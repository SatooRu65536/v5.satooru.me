/**
 * EmDash のコレクション定義に対応する型
 * (apps/cms/emdash-env.d.ts と揃えること)
 */

export interface PortableTextBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}

export interface ImageValue {
  id?: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  provider?: string;
}

export interface Post {
  title: string;
  featured_image?: ImageValue | null;
  content?: PortableTextBlock[] | string | null;
  excerpt?: string;
  published_date?: string;
}

export interface Page {
  title: string;
  content?: PortableTextBlock[] | null;
}

export interface Work {
  title: string;
  type: string;
  start_date: string;
  end_date?: string;
  summary: string;
}

export interface Experience {
  title: string;
  start_date: string;
  end_date?: string;
  summary?: string;
  link_name?: string;
  link?: string;
  important?: boolean;
}

export interface Presentation {
  event_name: string;
  presentation_type: string;
  presentation_date: string;
  presentation_title?: string;
  link?: string;
}

export interface Award {
  award: string;
  event_name: string;
  award_date: string;
  summary: string;
  link?: string;
}

export interface Collections {
  posts: Post;
  pages: Page;
  works: Work;
  experiences: Experience;
  presentations: Presentation;
  awards: Award;
}

export type CollectionName = keyof Collections;

export interface Entry<T> {
  /** データベースの ID (ULID) */
  id: string;
  slug: string;
  data: T;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface Term {
  id: string;
  name: string;
  slug: string;
  label: string;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
}

export interface Menu {
  items: MenuItem[];
}

export interface SiteSettings {
  title?: string;
  tagline?: string;
  logo?: { url?: string; alt?: string };
}
