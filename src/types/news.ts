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
  /** YouTube yoki Instagram havolasi — sahifada pleyer bo'lib ochiladi */
  video?: string;
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

/** "Matbuot uchun" bo'limidagi press-reliz — bitta tadbir bo'yicha */
export interface PressRelease {
  id: string;
  /** Tadbir nomi */
  title: Localized;
  date: string;
  /** Kartochkada ko'rinadigan qisqa mazmuni */
  summary?: Localized;
  /** To'liq matn — har bir band alohida abzats */
  body: Localized<string[]>;
  /** Yuklab olish uchun fayl (PDF, Word). Bo'sh bo'lsa tugma chiqmaydi */
  fileUrl?: string;
}

export interface MediaPhoto {
  id: string;
  src: string;
  caption: Localized;
  /** relative aspect for masonry: portrait | landscape | square */
  ratio: 'portrait' | 'landscape' | 'square';
}
