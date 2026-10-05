import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { Localized, SocialLink } from '@/types';
import { SITE, SOCIALS } from '@/lib/constants';

/** Bazadagi sozlamalar toʻplami (kontakt maʼlumotlari, missiya matni va h.k.) */
export type SiteSettings = {
  name: Localized;
  shortName: Localized;
  /** Logotip yonidagi nom ostidagi mayda yozuv */
  logoSubline: Localized;
  slogan: Localized;
  address: Localized;
  phone: string;
  email: string;
  url: string;
  workingHours: Localized;
  missionText: Localized;
  /** "Birlashma haqida" sahifasidagi missiya rasmi */
  missionImage: string;
  /** "Birlashma haqida" sahifasi bannerida, sarlavha yonida chiqadigan rasm */
  aboutHeaderImage: string;
  /** "Media → Matbuot uchun" boʻlimidagi press-kit fayli */
  pressKitUrl: string;
  /** Bosh sahifadagi "Raqamlarda birlashma" (KPI) bloki koʻrinsinmi */
  showKpi: boolean;
  /** Jamoa sahifasidagi "Tarkib" bloki koʻrinsinmi */
  showEnsembleMembers: boolean;
  /** Jamoa sahifasidagi "Repertuar" bloki koʻrinsinmi */
  showEnsembleRepertoire: boolean;
  /**
   * Talent platformasi ochiqmi (admin panelda yopib-ochiladi).
   * Yopiq boʻlsa sahifa 404 qaytaradi va menyudan chiqib turadi.
   */
  talentOpen: boolean;
  /**
   * Tanlov va festivallar ochiqmi (admin panelda vaqtincha yopiladi).
   * Yopiq boʻlsa tanlov sahifalari 404 qaytaradi, menyudan chiqib turadi va ariza qabul qilinmaydi.
   */
  tanlovOpen: boolean;
  /**
   * "Ishtirok etish" kartasining umumiy shabloni — tanlovning oʻzida matn kiritilmagan
   * boʻlsa shu ishlatiladi. Boʻsh qolsa saytdagi standart matn chiqadi.
   */
  ishtirok: {
    steps: Localized;
    title: Localized;
    text: Localized;
    prepareTitle: Localized;
    prepareList: Localized<string[]>;
  };
  /** Yangi ariza kelganda xat boradigan pochta manzil(lar)i */
  notifyEmail: string;
  mapCoords: { lat: number; lng: number };
  socials: SocialLink[];
};

/**
 * Sozlamalar bazadan olinadi. Agar biror kalit bazada boʻlmasa,
 * `src/lib/constants.ts` dagi qiymat ishlatiladi — shu sababli sayt
 * baza boʻsh boʻlganda ham ishlashda davom etadi.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.setting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;

  const olish = <T>(key: string, zaxira: T): T => (s[key] === undefined ? zaxira : (s[key] as T));

  return {
    name: olish('siteName', SITE.name),
    shortName: olish('siteShortName', SITE.shortName),
    logoSubline: olish('logoSubline', SITE.logoSubline),
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
    aboutHeaderImage: olish('aboutHeaderImage', ''),
    pressKitUrl: olish('pressKitUrl', ''),
    // Kalit hali bazada boʻlmasa — koʻrinadi (eski xatti-harakat saqlanadi)
    showKpi: s.showKpi === undefined || s.showKpi === null ? true : Boolean(s.showKpi),
    // Bu bloklar ham — kalit boʻlmasa koʻrinadigan holatda qoladi
    showEnsembleMembers:
      s.showEnsembleMembers === undefined || s.showEnsembleMembers === null
        ? true
        : Boolean(s.showEnsembleMembers),
    showEnsembleRepertoire:
      s.showEnsembleRepertoire === undefined || s.showEnsembleRepertoire === null
        ? true
        : Boolean(s.showEnsembleRepertoire),
    // Kalit hali bazada boʻlmasa — platforma ochiq deb hisoblanadi
    talentOpen: s.talentOpen === undefined || s.talentOpen === null ? true : Boolean(s.talentOpen),
    tanlovOpen: s.tanlovOpen === undefined || s.tanlovOpen === null ? true : Boolean(s.tanlovOpen),
    ishtirok: {
      steps: olish('ishtirokQadamlar', { uz: '', ru: '', en: '' }),
      title: olish('ishtirokSarlavha', { uz: '', ru: '', en: '' }),
      text: olish('ishtirokMatn', { uz: '', ru: '', en: '' }),
      prepareTitle: olish('tayyorlashSarlavha', { uz: '', ru: '', en: '' }),
      prepareList: olish('tayyorlashRoyxat', { uz: [], ru: [], en: [] }),
    },
    notifyEmail: olish('notifyEmail', process.env.SMTP_USER ?? ''),
    mapCoords: olish('mapCoords', { lat: 41.311081, lng: 69.279737 }),
    socials: olish('socials', SOCIALS),
  };
});
