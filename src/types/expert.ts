import type { Localized } from './common';

export interface Expert {
  slug: string;
  name: string;
  /** ISO 3166-1 alpha-2 for flag emoji, e.g. 'DE' */
  countryCode: string;
  country: Localized;
  photo: string;
  role: Localized;
  bio: Localized;
  specialties: Localized<string[]>;
}

export interface Leader {
  name: string;
  role: Localized;
  photo: string;
  bio: Localized;
}

export interface DocumentLink {
  title: Localized;
  href: string;
  /** e.g. 'PDF', '1.2 MB' */
  meta: string;
}
