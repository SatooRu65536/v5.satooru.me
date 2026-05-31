import type { Project } from '@/types/project';
import { ofetch } from 'ofetch';
import { env } from 'cloudflare:workers';

export const fetchActiveProjects = async (): Promise<Project[]> => {
  const url = new URL('/projects', env.API_BASE_URL);
  return await ofetch<Project[]>(url.toString(), { parseResponse: JSON.parse });
};
