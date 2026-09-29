/**
 * Tanlov arizasi anketasi — admin panelda tuziladi, saytda to'ldiriladi.
 *
 * Bu fayl ham serverda, ham brauzerda ishlatiladi: admin paneldagi quruvchi,
 * saytdagi ariza oynasi va serverdagi tekshiruv — hammasi bitta ta'rifga
 * tayanadi. Shu sababli bu yerda faqat sof funksiyalar.
 *
 * F.I.SH., email va telefon anketaga kirmaydi — ular har bir arizada doim
 * so'raladi (ishtirokchi bilan bog'lanish uchun shart).
 */

export type Tillar = { uz: string; ru: string; en: string };
export type TillarRoyxat = { uz: string[]; ru: string[]; en: string[] };

export type SavolTuri =
  /** Bir qatorli matn */
  | 'matn'
  /** Ko'p qatorli matn */
  | 'matnKatta'
  /** Son (masalan yoshi, a'zolar soni) */
  | 'raqam'
  /** Sana */
  | 'sana'
  /** Havola (masalan ijro videosi) */
  | 'havola'
  /** Ochiladigan ro'yxatdan bittasini tanlash */
  | 'tanlov'
  /** Variantlardan bittasini belgilash (radio) */
  | 'variant'
  /** Variantlardan bir nechtasini belgilash (checkbox) */
  | 'belgilar';

export type Savol = {
  /** O'zgarmas kalit — javoblar shu bo'yicha bog'lanadi */
  id: string;
  tur: SavolTuri;
  savol: Tillar;
  /** Savol ostidagi kichik izoh (ixtiyoriy) */
  izoh: Tillar;
  talab: boolean;
  /** `tanlov`, `variant`, `belgilar` uchun — har bir tilda bir xil tartibda */
  variantlar: TillarRoyxat;
};

/** Bazaga yoziladigan bitta javob. Savol matni ham saqlanadi (o'zbekcha). */
export type Javob = { id: string; savol: string; javob: string | string[] };

export const SAVOL_TURLARI: { qiymat: SavolTuri; yorliq: string }[] = [
  { qiymat: 'matn', yorliq: 'Qisqa matn' },
  { qiymat: 'matnKatta', yorliq: 'Uzun matn' },
  { qiymat: 'raqam', yorliq: 'Son' },
  { qiymat: 'sana', yorliq: 'Sana' },
  { qiymat: 'havola', yorliq: 'Havola (video, fayl)' },
  { qiymat: 'tanlov', yorliq: 'Ro‘yxatdan tanlash' },
  { qiymat: 'variant', yorliq: 'Bitta variant' },
  { qiymat: 'belgilar', yorliq: 'Bir nechta variant' },
];

const TURLAR = new Set<SavolTuri>(SAVOL_TURLARI.map((t) => t.qiymat));

/** Variantli savol turlari */
export function variantliMi(tur: SavolTuri): boolean {
  return tur === 'tanlov' || tur === 'variant' || tur === 'belgilar';
}

export const ANKETA_CHEGARASI = 40;
const MATN_CHEGARASI = { matn: 300, matnKatta: 5000, havola: 2000 } as const;

export function yangiSavol(): Savol {
  return {
    id: Math.random().toString(36).slice(2, 10),
    tur: 'matn',
    savol: { uz: '', ru: '', en: '' },
    izoh: { uz: '', ru: '', en: '' },
    talab: false,
    variantlar: { uz: [], ru: [], en: [] },
  };
}

function tillar(x: unknown, kop = 500): Tillar {
  const v = (x ?? {}) as Record<string, unknown>;
  const ol = (k: string) => (typeof v[k] === 'string' ? (v[k] as string).slice(0, kop) : '');
  return { uz: ol('uz'), ru: ol('ru'), en: ol('en') };
}

function tillarRoyxat(x: unknown): TillarRoyxat {
  const v = (x ?? {}) as Record<string, unknown>;
  const ol = (k: string) =>
    Array.isArray(v[k])
      ? (v[k] as unknown[])
          .map((s) => String(s ?? '').trim().slice(0, 200))
          .filter(Boolean)
          .slice(0, 50)
      : [];
  return { uz: ol('uz'), ru: ol('ru'), en: ol('en') };
}

/**
 * Bazadan yoki shakldan kelgan xom qiymatni ishonchli anketaga aylantiradi.
 * Noto'g'ri savollar tashlab yuboriladi — hech qachon xato tashlamaydi.
 */
export function anketaniOqi(xom: unknown): Savol[] {
  if (!Array.isArray(xom)) return [];
  const idlar = new Set<string>();
  const natija: Savol[] = [];

  for (const x of xom.slice(0, ANKETA_CHEGARASI)) {
    if (!x || typeof x !== 'object') continue;
    const s = x as Record<string, unknown>;
    const tur = s.tur as SavolTuri;
    if (!TURLAR.has(tur)) continue;

    let id = String(s.id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    if (!id || idlar.has(id)) id = yangiSavol().id;
    idlar.add(id);

    natija.push({
      id,
      tur,
      savol: tillar(s.savol),
      izoh: tillar(s.izoh),
      talab: Boolean(s.talab),
      variantlar: variantliMi(tur) ? tillarRoyxat(s.variantlar) : { uz: [], ru: [], en: [] },
    });
  }
  return natija;
}

/** Admin saqlashdan oldin anketani tekshiradi. Xato bo'lsa — tushunarli matn. */
export function anketaXatosi(savollar: Savol[]): string | null {
  for (const [i, s] of savollar.entries()) {
    const raqam = `${i + 1}-savol`;
    if (!s.savol.uz.trim()) return `Anketa: ${raqam} matni (o‘zbekcha) yozilmagan.`;
    if (variantliMi(s.tur) && s.variantlar.uz.length === 0) {
      return `Anketa: "${s.savol.uz}" savoliga kamida bitta variant yozing.`;
    }
  }
  return null;
}

/** Ko'p tilli matndan kerakli tildagisi, bo'lmasa o'zbekchasi */
export function tilda(t: Tillar, locale: string): string {
  const v = (t as Record<string, string>)[locale];
  return v && v.trim() ? v : t.uz;
}

/** Variantlar ro'yxati kerakli tilda. Tarjima yetishmasa o'zbekchasi olinadi. */
export function variantlarTilda(s: Savol, locale: string): string[] {
  const tarjima = (s.variantlar as Record<string, string[]>)[locale] ?? [];
  return s.variantlar.uz.map((uz, i) => (tarjima[i]?.trim() ? tarjima[i] : uz));
}

/**
 * Saytdan kelgan javoblarni anketaga solishtirib tekshiradi.
 *
 * Variantli savollarda brauzer variant RAQAMINI yuboradi — bazaga esa
 * o'zbekcha matni yoziladi: admin panel o'zbekcha, ishtirokchi qaysi tilda
 * to'ldirgani ahamiyatsiz bo'lsin.
 */
export function javoblarniTekshir(
  savollar: Savol[],
  xom: Record<string, unknown>,
): { ok: true; javoblar: Javob[] } | { ok: false; savolId: string } {
  const javoblar: Javob[] = [];

  for (const s of savollar) {
    const v = xom[s.id];

    if (s.tur === 'belgilar') {
      const raqamlar = (Array.isArray(v) ? v : [])
        .map((x) => Number(x))
        .filter((n) => Number.isInteger(n) && n >= 0 && n < s.variantlar.uz.length);
      const tanlangan = Array.from(new Set(raqamlar)).sort((a, b) => a - b);
      if (s.talab && tanlangan.length === 0) return { ok: false, savolId: s.id };
      if (tanlangan.length) {
        javoblar.push({ id: s.id, savol: s.savol.uz, javob: tanlangan.map((n) => s.variantlar.uz[n]) });
      }
      continue;
    }

    const matn = typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '';
    if (!matn) {
      if (s.talab) return { ok: false, savolId: s.id };
      continue;
    }

    let qiymat = matn;
    switch (s.tur) {
      case 'tanlov':
      case 'variant': {
        const n = Number(matn);
        if (!Number.isInteger(n) || n < 0 || n >= s.variantlar.uz.length) {
          return { ok: false, savolId: s.id };
        }
        qiymat = s.variantlar.uz[n];
        break;
      }
      case 'raqam':
        if (!/^-?\d+([.,]\d+)?$/.test(matn) || matn.length > 20) return { ok: false, savolId: s.id };
        break;
      case 'sana':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(matn)) return { ok: false, savolId: s.id };
        break;
      case 'havola':
        if (!/^https?:\/\/\S+$/i.test(matn) || matn.length > MATN_CHEGARASI.havola) {
          return { ok: false, savolId: s.id };
        }
        break;
      default:
        if (matn.length > MATN_CHEGARASI[s.tur]) return { ok: false, savolId: s.id };
    }

    javoblar.push({ id: s.id, savol: s.savol.uz, javob: qiymat });
  }

  return { ok: true, javoblar };
}

/** Bazadagi javoblarni o'qiydi (admin panel uchun) */
export function javoblarniOqi(xom: unknown): Javob[] {
  if (!Array.isArray(xom)) return [];
  return xom
    .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
    .map((x) => ({
      id: String(x.id ?? ''),
      savol: String(x.savol ?? ''),
      javob: Array.isArray(x.javob) ? x.javob.map(String) : String(x.javob ?? ''),
    }));
}

export function javobMatni(j: Javob['javob']): string {
  return Array.isArray(j) ? j.join(', ') : j;
}
