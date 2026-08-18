/**
 * Admin paneldagi shakl (forma) maydonlarining tavsifi.
 *
 * Har bir bo'lim shu maydonlar ro'yxati bilan tavsiflanadi, shakl esa
 * avtomatik quriladi — har bir bo'lim uchun alohida forma yozilmaydi.
 */

export type MaydonTuri =
  /** Bir qatorli matn (masalan F.I.SH.) */
  | 'matn'
  /** Ko'p qatorli matn */
  | 'matnKatta'
  /** Manzil qismi: faqat lotin harflari, raqam va chiziqcha */
  | 'slug'
  /** Butun son */
  | 'raqam'
  /** Ha / Yo'q */
  | 'belgi'
  /** Ro'yxatdan tanlash */
  | 'tanlov'
  /** Sana (YYYY-MM-DD) */
  | 'sana'
  /** Vaqt (SS:DD) */
  | 'vaqt'
  /** Havola (https://...) */
  | 'havola'
  /** Rasm — yuklash tugmasi bilan */
  | 'rasm'
  /** Uch tilli bir qatorli matn */
  | 'kopTilli'
  /** Uch tilli ko'p qatorli matn */
  | 'kopTilliKatta'
  /** Uch tilli ro'yxat (har bir band alohida qator) */
  | 'kopTilliRoyxat'
  /** Takrorlanuvchi qatorlar (a'zolar, repertuar, galereya...) */
  | 'qatorlar';

export type Maydon = {
  nom: string;
  yorliq: string;
  tur: MaydonTuri;
  talab?: boolean;
  izoh?: string;
  /** `tanlov` uchun variantlar */
  variantlar?: { qiymat: string; yorliq: string }[];
  /** `qatorlar` uchun ichki maydonlar */
  maydonlar?: Maydon[];
  /** Shaklda ikki ustunga joylashtirish */
  yarim?: boolean;
};

/** Uch tilli qiymat */
export type KopTilli = { uz: string; ru: string; en: string };
export type KopTilliRoyxat = { uz: string[]; ru: string[]; en: string[] };

/** Shakldagi barcha qiymatlar — maydon nomi -> qiymat */
export type Qiymatlar = Record<string, unknown>;

/** Ro'yxat sahifasidagi bitta qator */
export type RoyxatQatori = {
  id: number;
  sarlavha: string;
  tavsif?: string;
  belgi?: string;
  ochiqmi?: boolean;
  rasm?: string | null;
};

export const TILLAR = [
  { kalit: 'uz' as const, nom: "O'zbekcha", qisqa: 'UZ' },
  { kalit: 'ru' as const, nom: 'Ruscha', qisqa: 'RU' },
  { kalit: 'en' as const, nom: 'Inglizcha', qisqa: 'EN' },
];

export function boshKopTilli(): KopTilli {
  return { uz: '', ru: '', en: '' };
}

export function boshKopTilliRoyxat(): KopTilliRoyxat {
  return { uz: [], ru: [], en: [] };
}

/** Maydon turiga qarab bo'sh boshlang'ich qiymat */
export function boshQiymat(m: Maydon): unknown {
  switch (m.tur) {
    case 'kopTilli':
    case 'kopTilliKatta':
      return boshKopTilli();
    case 'kopTilliRoyxat':
      return boshKopTilliRoyxat();
    case 'qatorlar':
      return [];
    case 'belgi':
      return false;
    case 'raqam':
      return null;
    default:
      return '';
  }
}

/** Maydonlar ro'yxatiga mos bo'sh yozuv */
export function boshYozuv(maydonlar: Maydon[]): Qiymatlar {
  return Object.fromEntries(maydonlar.map((m) => [m.nom, boshQiymat(m)]));
}
