/**
 * Admin paneldagi shakl (forma) maydonlarining tavsifi.
 *
 * Har bir boʻlim shu maydonlar roʻyxati bilan tavsiflanadi, shakl esa
 * avtomatik quriladi — har bir boʻlim uchun alohida forma yozilmaydi.
 */

export type MaydonTuri =
  /** Bir qatorli matn (masalan F.I.SH.) */
  | 'matn'
  /** Koʻp qatorli matn */
  | 'matnKatta'
  /** Butun son */
  | 'raqam'
  /** Ha / Yoʻq */
  | 'belgi'
  /** Roʻyxatdan tanlash */
  | 'tanlov'
  /** Sana (YYYY-MM-DD) */
  | 'sana'
  /** Sana va vaqt (Toshkent vaqti bilan) */
  | 'sanaVaqt'
  /** Vaqt (SS:DD) */
  | 'vaqt'
  /** Havola (https://...) */
  | 'havola'
  /** Rasm — yuklash tugmasi bilan */
  | 'rasm'
  /** Hujjat (PDF, Word, Excel) — yuklash tugmasi bilan */
  | 'fayl'
  /** Video fayl (MP4, WEBM, MOV) — yuklash tugmasi bilan */
  | 'video'
  /** YouTube video ID — toʻliq havola qoʻyilsa ID avtomatik ajratiladi */
  | 'youtube'
  /** Instagram post/reel havolasi — bir xil koʻrinishga keltiriladi */
  | 'instagram'
  /** Bitta maydon: YouTube, Instagram yoki Telegram havolasi (turi oʻzi aniqlanadi) */
  | 'postHavola'
  /** Uch tilli bir qatorli matn */
  | 'kopTilli'
  /** Uch tilli koʻp qatorli matn */
  | 'kopTilliKatta'
  /** Uch tilli roʻyxat (har bir band alohida qator) */
  | 'kopTilliRoyxat'
  /** Takrorlanuvchi qatorlar (aʼzolar, repertuar, galereya...) */
  | 'qatorlar'
  /** Ariza anketasi quruvchisi — savollar roʻyxati (src/lib/anketa.ts) */
  | 'anketa';

export type Maydon = {
  nom: string;
  yorliq: string;
  tur: MaydonTuri;
  talab?: boolean;
  /**
   * Shu nomdagi maydon toʻldirilgan boʻlsa, joriy maydon majburiy boʻlmaydi.
   *
   * Masalan yangilikda ijtimoiy tarmoq havolasi qoʻyilgan boʻlsa, sarlavha
   * va matn shart emas — post oʻzi hammasini koʻrsatadi. Havola boʻlmasa,
   * ular yana majburiy boʻladi.
   */
  ixtiyoriyAgar?: string;
  izoh?: string;
  /** `tanlov` uchun variantlar */
  variantlar?: { qiymat: string; yorliq: string }[];
  /** `qatorlar` uchun ichki maydonlar */
  maydonlar?: Maydon[];
  /** Shaklda ikki ustunga joylashtirish */
  yarim?: boolean;
  /**
   * Kam ishlatiladigan maydon — shaklda yopiq turadigan
   * "Qoʻshimcha" boʻlimiga tushadi.
   */
  qoshimcha?: boolean;
  /**
   * Matn uchun ruxsat etilgan eng katta uzunlik.
   * Bazadagi VarChar ustunlar bilan mos boʻlishi kerak — aks holda saqlashda
   * tushunarsiz "value too long" xatosi chiqadi.
   */
  uzunlik?: number;
  /**
   * Maydon boʻsh qoldirilsa bazaga yoziladigan qiymat.
   * Bazada NULL qabul qilmaydigan ustunlar uchun kerak (masalan `sortOrder`).
   */
  bosh?: string | number;
  /**
   * `qatorlar` uchun: shakl ostida "Excelʼdan yuklash" va "Namuna fayl"
   * tugmalari chiqadi — uzun roʻyxatni bittalab qoʻlda kiritish shart emas.
   * Faqat matn/raqamdan iborat jadvallarga qoʻyiladi (rasm yoki video
   * yuklanadigan qatorlarga mos emas).
   */
  excel?: boolean;
  /**
   * `kopTilliKatta` uchun: oddiy maydon oʻrniga qalin, qiya, roʻyxat tugmalari
   * bor tahrirlagich chiqadi. Qiymat tozalangan HTML sifatida saqlanadi.
   */
  boy?: boolean;
};

/** Uch tilli qiymat */
export type KopTilli = { uz: string; ru: string; en: string };
export type KopTilliRoyxat = { uz: string[]; ru: string[]; en: string[] };

/** Shakldagi barcha qiymatlar — maydon nomi -> qiymat */
export type Qiymatlar = Record<string, unknown>;

/** Roʻyxat sahifasidagi bitta qator */
export type RoyxatQatori = {
  id: number;
  sarlavha: string;
  tavsif?: string;
  belgi?: string;
  ochiqmi?: boolean;
  rasm?: string | null;
};

export const TILLAR = [
  { kalit: 'uz' as const, nom: "Oʻzbekcha", qisqa: 'UZ' },
  { kalit: 'ru' as const, nom: 'Ruscha', qisqa: 'RU' },
  { kalit: 'en' as const, nom: 'Inglizcha', qisqa: 'EN' },
];

export function boshKopTilli(): KopTilli {
  return { uz: '', ru: '', en: '' };
}

export function boshKopTilliRoyxat(): KopTilliRoyxat {
  return { uz: [], ru: [], en: [] };
}

/** Maydon turiga qarab boʻsh boshlangʻich qiymat */
export function boshQiymat(m: Maydon): unknown {
  switch (m.tur) {
    case 'kopTilli':
    case 'kopTilliKatta':
      return boshKopTilli();
    case 'kopTilliRoyxat':
      return boshKopTilliRoyxat();
    case 'qatorlar':
    case 'anketa':
      return [];
    case 'belgi':
      return false;
    case 'raqam':
      return null;
    default:
      return '';
  }
}

/** Maydonlar roʻyxatiga mos boʻsh yozuv */
export function boshYozuv(maydonlar: Maydon[]): Qiymatlar {
  return Object.fromEntries(maydonlar.map((m) => [m.nom, boshQiymat(m)]));
}

/** Maydon qiymati boʻshmi — turiga qarab tekshiriladi */
export function qiymatBoshmi(m: Maydon, qiymat: unknown): boolean {
  if (m.tur === 'kopTilli' || m.tur === 'kopTilliKatta') {
    const v = qiymat as Record<string, unknown> | null;
    return !TILLAR.some((t) => String(v?.[t.kalit] ?? '').trim() !== '');
  }
  if (m.tur === 'kopTilliRoyxat') {
    const v = qiymat as Record<string, unknown[]> | null;
    return !TILLAR.some((t) => (v?.[t.kalit] ?? []).some((x) => String(x ?? '').trim() !== ''));
  }
  if (m.tur === 'qatorlar' || m.tur === 'anketa') return ((qiymat as unknown[]) ?? []).length === 0;
  if (m.tur === 'raqam') return qiymat === null || qiymat === undefined || qiymat === '';
  if (m.tur === 'belgi') return !qiymat;
  return String(qiymat ?? '').trim() === '';
}

/**
 * Maydon shu topshiriqda majburiymi.
 *
 * Odatda `talab` yetarli, lekin baʼzi maydonlar shartli: boshqa maydon
 * toʻldirilgan boʻlsa majburiylik olib tashlanadi (`ixtiyoriyAgar`).
 */
export function talabMi(m: Maydon, qiymatlar: Qiymatlar, maydonlar: Maydon[]): boolean {
  if (!m.talab) return false;
  if (!m.ixtiyoriyAgar) return true;

  const boshqa = maydonlar.find((x) => x.nom === m.ixtiyoriyAgar);
  if (!boshqa) return true;

  return qiymatBoshmi(boshqa, qiymatlar[boshqa.nom]);
}
