/**
 * EmDash (CMS) の REST API クライアント
 *
 * ビルド時にのみ実行される。同じリクエストはビルド中キャッシュする。
 */
import {
  CF_ACCESS_CLIENT_ID,
  CF_ACCESS_CLIENT_SECRET,
  CMS_API_TOKEN,
  CMS_URL,
} from 'astro:env/server';
import type {
  CollectionName,
  Collections,
  Entry,
  Menu,
  MenuItem,
  SiteSettings,
  Term,
} from './cms-types';

type Envelope<T>
  = | { success: true; data: T }
    | { success: false; error: { code: string; message: string } };

const cache = new Map<string, Promise<unknown>>();

function request<T>(path: string): Promise<T> {
  const cached = cache.get(path);
  if (cached) return cached as Promise<T>;

  const promise = fetchJson<T>(path);
  cache.set(path, promise);
  return promise;
}

async function fetchJson<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${CMS_API_TOKEN}`,
  };
  if (CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET) {
    headers['CF-Access-Client-Id'] = CF_ACCESS_CLIENT_ID;
    headers['CF-Access-Client-Secret'] = CF_ACCESS_CLIENT_SECRET;
  }

  const url = new URL(`/_emdash/api${path}`, CMS_URL);
  const res = await fetch(url, { headers });

  const text = await res.text();
  let body: Envelope<T>;
  try {
    body = JSON.parse(text) as Envelope<T>;
  } catch {
    // Access に止められるとログインページの HTML が返ってくる
    throw new Error(
      `[cms] ${url} returned non-JSON (status ${res.status}). Check the Access service token.`,
    );
  }

  if (!body.success) {
    throw new Error(
      `[cms] ${url} failed: ${body.error.code} ${body.error.message}`,
    );
  }
  return body.data;
}

/** 同時実行数を制限しつつ map する */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

interface RawEntry {
  id: string;
  slug: string | null;
  status: string;
  data: Record<string, unknown>;
  liveData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/** 公開済みエントリをすべて取得する */
export async function getCollection<K extends CollectionName>(
  collection: K,
): Promise<Entry<Collections[K]>[]> {
  const items: RawEntry[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ status: 'published', limit: '100' });
    if (cursor) params.set('cursor', cursor);

    const data = await request<{ items: RawEntry[]; nextCursor?: string }>(
      `/content/${collection}?${params}`,
    );
    items.push(...data.items);
    cursor = data.nextCursor ?? undefined;
  } while (cursor);

  return items.map((item) => ({
    id: item.id,
    slug: item.slug ?? item.id,
    // 下書きリビジョンがある場合、公開中の値は liveData に入る
    data: (item.liveData ?? item.data) as unknown as Collections[K],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
  }));
}

export async function getEntry<K extends CollectionName>(
  collection: K,
  slug: string,
): Promise<Entry<Collections[K]> | undefined> {
  const entries = await getCollection(collection);
  return entries.find((entry) => entry.slug === slug);
}

export async function getTaxonomyTerms(taxonomy: string): Promise<Term[]> {
  const data = await request<{ terms: Term[] }>(
    `/taxonomies/${taxonomy}/terms`,
  );
  return data.terms;
}

export async function getTerm(
  taxonomy: string,
  slug: string,
): Promise<Term | undefined> {
  const terms = await getTaxonomyTerms(taxonomy);
  return terms.find((term) => term.slug === slug);
}

export async function getEntryTerms(
  collection: CollectionName,
  entryId: string,
  taxonomy: string,
): Promise<Term[]> {
  const data = await request<{ terms: Term[] }>(
    `/content/${collection}/${entryId}/terms/${taxonomy}`,
  );
  return data.terms;
}

/** 複数エントリのタームをまとめて取得する (entryId -> terms) */
export async function getTermsForEntries(
  collection: CollectionName,
  entryIds: string[],
  taxonomy: string,
): Promise<Map<string, Term[]>> {
  const results = await mapLimit(entryIds, 8, async (id) => {
    const terms = await getEntryTerms(collection, id, taxonomy);
    return [id, terms] as const;
  });
  return new Map(results);
}

interface RawMenuItem {
  id: string;
  label: string;
  parentId: string | null;
  customUrl: string | null;
}

/** メニューのトップレベル項目を取得する (custom URL のみ対応) */
export async function getMenu(name: string): Promise<Menu> {
  const data = await request<{ items: RawMenuItem[] }>(`/menus/${name}`);
  return {
    items: data.items
      .filter((item) => item.parentId === null)
      .map(
        (item): MenuItem => ({
          id: item.id,
          label: item.label,
          url: item.customUrl ?? '#',
        }),
      ),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return request<SiteSettings>('/settings');
}

/** 文字列フィールドの昇順で比較する (未設定は先頭) */
export function compareByFields<T>(...keys: (keyof T)[]) {
  return (a: Entry<T>, b: Entry<T>): number => {
    for (const key of keys) {
      const diff = String(a.data[key] ?? '').localeCompare(
        String(b.data[key] ?? ''),
      );
      if (diff !== 0) return diff;
    }
    return 0;
  };
}
