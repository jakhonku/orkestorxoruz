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
  /** Hujjat (PDF, Word, Excel) — yuklash tugmasi bilan */
  | 'fayl'
  /** Video fayl (MP4, WEBM, MOV) — yuklash tugmasi bilan */
  | 'video'
  /** YouTube video ID — to'liq havola qo'yilsa ID avtomatik ajratiladi */
  | 'youtube'
  /** Instagram post/reel havolasi — bir xil ko'rinishga keltiriladi */
  | 'instagram'
  /** Bitta maydon: YouTube, Instagram yoki Telegram havolasi (turi o'zi aniqlanadi) */
  | 'postHavola'
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
  /**
   * Shu nomdagi maydon to'ldirilgan bo'lsa, joriy maydon majburiy bo'lmaydi.
   *
   * Masalan yangilikda ijtimoiy tarmoq havolasi qo'yilgan bo'lsa, sarlavha
   * va matn shart emas — post o'zi hammasini ko'rsatadi. Havola bo'lmasa,
   * ular yana majburiy bo'ladi.
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
   * "Qo‘shimcha" bo‘limiga tushadi.
   */
  qoshimcha?: boolean;
  /**
   * Matn uchun ruxsat etilgan eng katta uzunlik.
   * Bazadagi VarChar ustunlar bilan mos bo'lishi kerak — aks holda saqlashda
   * tushunarsiz "value too long" xatosi chiqadi.
   */
  uzunlik?: number;
  /**
   * Maydon bo'sh qoldirilsa bazaga yoziladigan qiymat.
   * Bazada NULL qabul qilmaydigan ustunlar uchun kerak (masalan `sortOrder`).
   */
  bosh?: string | number;
  /**
   * `qatorlar` uchun: shakl ostida "Excel'dan yuklash" va "Namuna fayl"
   * tugmalari chiqadi — uzun ro'yxatni bittalab qo'lda kiritish shart emas.
   * Faqat matn/raqamdan iborat jadvallarga qo'yiladi (rasm yoki video
   * yuklanadigan qatorlarga mos emas).
   */
  excel?: boolean;
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

/** Maydon qiymati bo'shmi — turiga qarab tekshiriladi */
export function qiymatBoshmi(m: Maydon, qiymat: unknown): boolean {
  if (m.tur === 'kopTilli' || m.tur === 'kopTilliKatta') {
    const v = qiymat as Record<string, unknown> | null;
    return !TILLAR.some((t) => String(v?.[t.kalit] ?? '').trim() !== '');
  }
  if (m.tur === 'kopTilliRoyxat') {
    const v = qiymat as Record<string, unknown[]> | null;
    return !TILLAR.some((t) => (v?.[t.kalit] ?? []).some((x) => String(x ?? '').trim() !== ''));
  }
  if (m.tur === 'qatorlar') return ((qiymat as unknown[]) ?? []).length === 0;
  if (m.tur === 'raqam') return qiymat === null || qiymat === undefined || qiymat === '';
  if (m.tur === 'belgi') return !qiymat;
  return String(qiymat ?? '').trim() === '';
}

/**
 * Maydon shu topshiriqda majburiymi.
 *
 * Odatda `talab` yetarli, lekin ba'zi maydonlar shartli: boshqa maydon
 * to'ldirilgan bo'lsa majburiylik olib tashlanadi (`ixtiyoriyAgar`).
 */
export function talabMi(m: Maydon, qiymatlar: Qiymatlar, maydonlar: Maydon[]): boolean {
  if (!m.talab) return false;
  if (!m.ixtiyoriyAgar) return true;

  const boshqa = maydonlar.find((x) => x.nom === m.ixtiyoriyAgar);
  if (!boshqa) return true;

  return qiymatBoshmi(boshqa, qiymatlar[boshqa.nom]);
}
