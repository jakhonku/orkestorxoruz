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
  /** YouTube yoki Instagram havolasi — sahifada pleyer boʻlib ochiladi */
  video?: string;
  featured?: boolean;
}

export interface MediaVideo {
  id: string;
  title: Localized;
  /** YouTube video ID. Boʻsh boʻlsa — boshqa manba ishlatiladi */
  youtubeId: string;
  /** Instagram post yoki reel havolasi */
  instagramUrl?: string;
  /** Saytga yuklangan video fayl manzili */
  fileUrl?: string;
  /** Muqova rasmi (Instagram va yuklangan video uchun) */
  coverUrl?: string;
  date: string;
}

/** "Matbuot uchun" boʻlimidagi press-reliz — bitta tadbir boʻyicha */
export interface PressRelease {
  id: string;
  /** Tadbir nomi */
  title: Localized;
  date: string;
  /** Kartochkada koʻrinadigan qisqa mazmuni */
  summary?: Localized;
  /** Toʻliq matn — har bir band alohida abzats */
  body: Localized<string[]>;
  /** Yuklab olish uchun fayl (PDF, Word). Boʻsh boʻlsa tugma chiqmaydi */
  fileUrl?: string;
}

export interface MediaPhoto {
  id: string;
  src: string;
  caption: Localized;
  /** relative aspect for masonry: portrait | landscape | square */
  ratio: 'portrait' | 'landscape' | 'square';
}
