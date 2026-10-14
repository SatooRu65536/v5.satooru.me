import type { Project } from '@/types/project';
import { ofetch } from 'ofetch';
import { API_BASE_URL } from 'astro:env/server';

/**
 * 取得に失敗した場合は空配列を返す
 * (外部 API の障害でサイト全体のビルドを止めないため)
 */
export const fetchActiveProjects = async (): Promise<Project[]> => {
  const url = new URL('/projects', API_BASE_URL);
  try {
    return await ofetch<Project[]>(url.toString(), {
      parseResponse: JSON.parse,
    });
  } catch (error) {
    console.warn(`[fetcher] Failed to fetch ${url}:`, error);
    return [];
  }
};
