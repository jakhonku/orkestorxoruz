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
  /** YouTube video ID. Bo'sh bo'lsa — boshqa manba ishlatiladi */
  youtubeId: string;
  /** Instagram post yoki reel havolasi */
  instagramUrl?: string;
  /** Saytga yuklangan video fayl manzili */
  fileUrl?: string;
  /** Muqova rasmi (Instagram va yuklangan video uchun) */
  coverUrl?: string;
  date: string;
}

export interface MediaPhoto {
  id: string;
  src: string;
  caption: Localized;
  /** relative aspect for masonry: portrait | landscape | square */
  ratio: 'portrait' | 'landscape' | 'square';
}
