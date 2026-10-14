import { getCollection } from './cms';
import type { Entry, Post, PortableTextBlock } from './cms-types';

/** 表示用の公開日 (published_date が無ければ公開日時) */
export function postDate(post: Entry<Post>): string {
  return post.data.published_date ?? post.publishedAt ?? post.createdAt;
}

/** 公開済みの記事を新しい順に取得する */
export async function getPosts(): Promise<Entry<Post>[]> {
  const posts = await getCollection('posts');
  return posts.toSorted(
    (a, b) => new Date(postDate(b)).getTime() - new Date(postDate(a)).getTime(),
  );
}

/** Portable Text 本文を Portable Text の配列に正規化する */
export function toBlocks(
  content: Post['content'],
): PortableTextBlock[] {
  return Array.isArray(content) ? content : [];
}

/** Portable Text からプレーンテキストを取り出す */
export function extractPlainText(content: Post['content']): string {
  if (typeof content === 'string') return content;
  return toBlocks(content)
    .filter((block) => block._type === 'block')
    .map((block) =>
      ((block.children as { text?: string }[] | undefined) ?? [])
        .map((child) => child.text ?? '')
        .join(''),
    )
    .join('\n');
}

/** サムネイル画像 (アイキャッチが無ければ本文の1枚目の画像) */
export function postThumbnail(
  post: Entry<Post>,
): { src: string; alt: string } | undefined {
  const featured = post.data.featured_image;
  if (featured?.src) return { src: featured.src, alt: featured.alt ?? '' };

  for (const block of toBlocks(post.data.content)) {
    if (block._type !== 'image') continue;
    const image = block as {
      alt?: string;
      url?: string;
      asset?: { url?: string };
    };
    const src = image.asset?.url ?? image.url;
    if (src) return { src, alt: image.alt ?? '' };
  }
  return undefined;
}
