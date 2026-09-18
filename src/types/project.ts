import type { GalleryPhoto } from './ensemble';
import type { Localized } from './common';

export type ProjectScope = 'respublika' | 'xalqaro';

export interface ProjectResult {
  label: Localized;
  value: string;
}

export interface Project {
  slug: string;
  title: Localized;
  scope: ProjectScope;
  cover: string;
  period: Localized;
  location: Localized;
  shortDescription: Localized;
  description: Localized;
  results: ProjectResult[];
  gallery: GalleryPhoto[];
  /** Hamkor tashkilotlar haqida izoh */
  partnersNote?: Localized;
  /** Loyihaning o'z sayti — "Batafsil" sahifasidagi tugma shu yerga olib boradi */
  website?: string;
  featured?: boolean;
}
