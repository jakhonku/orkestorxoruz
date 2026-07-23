import type { Localized } from './common';

export type NewsCategory = 'yangilik' | 'matbuot' | 'elon';

export interface NewsArticle {
  slug: string;
  title: Localized;
  category: NewsCategory;
  cover: string;
  /** ISO date string */
  date: string;
  author: Localized;
  excerpt: Localized;
  body: Localized<string[]>;
  featured?: boolean;
}

export interface MediaVideo {
  id: string;
  title: Localized;
  youtubeId: string;
  date: string;
}

export interface MediaPhoto {
  id: string;
  src: string;
  caption: Localized;
  /** relative aspect for masonry: portrait | landscape | square */
  ratio: 'portrait' | 'landscape' | 'square';
}
