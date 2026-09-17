import type { Localized } from './common';

export interface Expert {
  slug: string;
  name: Localized;
  /** ISO 3166-1 alpha-2 for flag emoji, e.g. 'DE' */
  countryCode: string;
  country: Localized;
  photo: string;
  role: Localized;
  bio: Localized;
  specialties: Localized<string[]>;
  /** Hamkorlik shakli */
  cooperation?: Localized;
}

export interface Leader {
  name: Localized;
  role: Localized;
  photo: string;
  /** Kartochkadagi qisqacha matn */
  bio: Localized;
  /** Faqat "Batafsil" oynasida ochiladigan to'liq ma'lumot */
  fullBio?: Localized;
  /** Unvon / ilmiy daraja */
  honorific?: Localized;
  /** Qabul kunlari */
  receptionDay?: Localized;
}

export interface DocumentLink {
  title: Localized;
  href: string;
  /** e.g. 'PDF', '1.2 MB' */
  meta: string;
}
