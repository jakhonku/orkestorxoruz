import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { Localized, SocialLink } from '@/types';
import { SITE, SOCIALS } from '@/lib/constants';

/** Bazadagi sozlamalar to'plami (kontakt ma'lumotlari, missiya matni va h.k.) */
export type SiteSettings = {
  name: Localized;
  shortName: Localized;
  slogan: Localized;
  address: Localized;
  phone: string;
  email: string;
  url: string;
  workingHours: Localized;
  missionText: Localized;
  /** "Birlashma haqida" sahifasidagi missiya rasmi */
  missionImage: string;
  /** "Media → Matbuot uchun" bo'limidagi press-kit fayli */
  pressKitUrl: string;
  mapCoords: { lat: number; lng: number };
  socials: SocialLink[];
  notifyEmail: string;
};

/**
 * Sozlamalar bazadan olinadi. Agar biror kalit bazada bo'lmasa,
 * `src/lib/constants.ts` dagi qiymat ishlatiladi — shu sababli sayt
 * baza bo'sh bo'lganda ham ishlashda davom etadi.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.setting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;

  const olish = <T>(key: string, zaxira: T): T => (s[key] === undefined ? zaxira : (s[key] as T));

  return {
    name: olish('siteName', SITE.name),
    shortName: olish('siteShortName', SITE.shortName),
    slogan: olish('slogan', SITE.slogan),
    address: olish('address', SITE.address),
    phone: olish('phone', SITE.phone),
    email: olish('email', SITE.email),
    url: olish('siteUrl', SITE.url),
    workingHours: olish('workingHours', {
      uz: 'Dushanba–Juma, 09:00–18:00',
      ru: 'Понедельник–Пятница, 09:00–18:00',
      en: 'Monday–Friday, 09:00–18:00',
    }),
    missionText: olish('missionText', { uz: '', ru: '', en: '' }),
    missionImage: olish('missionImage', ''),
    pressKitUrl: olish('pressKitUrl', ''),
    mapCoords: olish('mapCoords', { lat: 41.311081, lng: 69.279737 }),
    socials: olish('socials', SOCIALS),
    notifyEmail: olish('notifyEmail', SITE.email),
  };
});
