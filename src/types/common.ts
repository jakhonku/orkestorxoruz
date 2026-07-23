import type { Locale } from '@/i18n/routing';

/**
 * A value translated into every supported locale.
 * Mock data stores all three; a real API would return one resolved string.
 */
export type Localized<T = string> = Record<Locale, T>;

export interface ImageAsset {
  src: string;
  alt: Localized;
  width?: number;
  height?: number;
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'telegram' | 'youtube' | 'x';
  url: string;
}

/** O'zbekiston viloyatlari (regions) */
export type Region =
  | 'toshkent-shahri'
  | 'toshkent'
  | 'samarqand'
  | 'buxoro'
  | 'xorazm'
  | 'fargona'
  | 'andijon'
  | 'namangan'
  | 'qashqadaryo'
  | 'surxondaryo'
  | 'navoiy'
  | 'jizzax'
  | 'sirdaryo'
  | 'qoraqalpogiston';
