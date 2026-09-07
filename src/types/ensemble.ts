import type { ImageAsset, Localized, Region } from './common';

export type EnsembleType = 'orkestr' | 'xor' | 'ansambl';

export interface EnsembleMember {
  name: Localized;
  role: Localized;
}

export interface RepertoireItem {
  composer: Localized;
  work: Localized;
}

export interface GalleryPhoto {
  src: string;
  caption: Localized;
}

export interface VideoRef {
  title: Localized;
  youtubeId: string;
}

export interface Ensemble {
  slug: string;
  name: Localized;
  type: EnsembleType;
  region: Region;
  city: Localized;
  conductor: Localized;
  memberCount: number;
  foundedYear: number;
  logo: string;
  banner: string;
  shortDescription: Localized;
  history: Localized;
  members: EnsembleMember[];
  repertoire: RepertoireItem[];
  gallery: GalleryPhoto[];
  videos: VideoRef[];
  featured?: boolean;
}
