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
  featured?: boolean;
}
