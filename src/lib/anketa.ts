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
  | 'belgilar'
  /** Fayl yuklash (surat, pasport nusxasi...) — yopiq bucket'ga tushadi */
  | 'fayl'
  /** Bitta belgi: "roziman" (masalan shaxsiy ma'lumotlarni qayta ishlashga) */
  | 'rozilik'
  /**
   * Savol emas — ariza sahifasida yangi QADAM boshlanadi. `savol` — qadam
   * sarlavhasi, `izoh` — uning ostidagi qisqa tushuntirish.
   */
  | 'bolim';

/** `fayl` savolida qabul qilinadigan fayllar */
export type FaylQabuli = 'rasm' | 'pdf' | 'hammasi';

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
  /** `fayl` uchun: qanday fayl qabul qilinadi */
  qabul: FaylQabuli;
};

/**
 * Bazaga yoziladigan bitta javob. Savol matni ham saqlanadi (o'zbekcha).
 * `fayl` savolida javob — yopiq bucket'dagi fayl yo'li, `tur` shuni bildiradi.
 */
export type Javob = { id: string; savol: string; javob: string | string[]; tur?: 'fayl' };

export const SAVOL_TURLARI: { qiymat: SavolTuri; yorliq: string }[] = [
  { qiymat: 'matn', yorliq: 'Qisqa matn' },
  { qiymat: 'matnKatta', yorliq: 'Uzun matn' },
  { qiymat: 'raqam', yorliq: 'Son' },
  { qiymat: 'sana', yorliq: 'Sana' },
  { qiymat: 'havola', yorliq: 'Havola (video, fayl)' },
  { qiymat: 'tanlov', yorliq: 'Ro‘yxatdan tanlash' },
  { qiymat: 'variant', yorliq: 'Bitta variant' },
  { qiymat: 'belgilar', yorliq: 'Bir nechta variant' },
  { qiymat: 'fayl', yorliq: 'Fayl yuklash (surat, hujjat)' },
  { qiymat: 'rozilik', yorliq: 'Rozilik belgisi' },
  { qiymat: 'bolim', yorliq: '➜ Yangi qadam (sarlavha)' },
];

export const FAYL_QABULI: { qiymat: FaylQabuli; yorliq: string }[] = [
  { qiymat: 'rasm', yorliq: 'Faqat rasm (JPG, PNG, WEBP)' },
  { qiymat: 'pdf', yorliq: 'Faqat PDF' },
  { qiymat: 'hammasi', yorliq: 'Rasm yoki hujjat (JPG, PNG, WEBP, PDF, Word)' },
];

/** Qabul turi -> ruxsat etilgan MIME turlari va kengaytmalar */
export const FAYL_TURLARI: Record<FaylQabuli, Record<string, string>> = {
  rasm: { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' },
  pdf: { 'application/pdf': '.pdf' },
  hammasi: {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  },
};

/** Ishtirokchi yuklaydigan bitta faylning eng katta hajmi */
export const ARIZA_FAYL_CHEGARASI = 15 * 1024 * 1024;

/** Brauzer fayl turini aytmasa — kengaytmadan aniqlanadi */
export function arizaFaylTuri(nom: string, tur?: string | null): string {
  const berilgan = (tur ?? '').toLowerCase().split(';')[0].trim();
  if (berilgan && berilgan in FAYL_TURLARI.hammasi) return berilgan;
  const k = nom.toLowerCase().split('.').pop() ?? '';
  const topilgan = Object.entries(FAYL_TURLARI.hammasi).find(
    ([, kengaytma]) => kengaytma === `.${k}` || (k === 'jpeg' && kengaytma === '.jpg'),
  );
  return topilgan?.[0] ?? berilgan;
}

/** Tanlov fayllari papkasi: shu tanlovga tegishli bo'lmagan yo'l qabul qilinmaydi */
export function arizaPapkasi(tanlovId: number): string {
  return `tanlov-${tanlovId}/`;
}

const FAYL_YOLI = /^tanlov-\d+\/\d{4}-\d{2}\/[a-z0-9-]+\.(jpg|png|webp|pdf|doc|docx)$/;

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
    qabul: 'hammasi',
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
      qabul: s.qabul === 'rasm' || s.qabul === 'pdf' ? s.qabul : 'hammasi',
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
  /** Fayl yo'llari shu papkadan bo'lishi shart (`arizaPapkasi`) */
  faylPapkasi = '',
): { ok: true; javoblar: Javob[] } | { ok: false; savolId: string } {
  const javoblar: Javob[] = [];

  for (const s of savollar) {
    const v = xom[s.id];

    if (s.tur === 'bolim') continue;

    if (s.tur === 'rozilik') {
      const rozi = v === true || v === 'ha';
      if (s.talab && !rozi) return { ok: false, savolId: s.id };
      if (rozi) javoblar.push({ id: s.id, savol: s.savol.uz, javob: 'Ha' });
      continue;
    }

    if (s.tur === 'fayl') {
      const yol = typeof v === 'string' ? v.trim() : '';
      if (!yol) {
        if (s.talab) return { ok: false, savolId: s.id };
        continue;
      }
      const kengaytma = yol.slice(yol.lastIndexOf('.'));
      if (
        !FAYL_YOLI.test(yol) ||
        !yol.startsWith(faylPapkasi) ||
        !Object.values(FAYL_TURLARI[s.qabul]).includes(kengaytma)
      ) {
        return { ok: false, savolId: s.id };
      }
      javoblar.push({ id: s.id, savol: s.savol.uz, javob: yol, tur: 'fayl' });
      continue;
    }

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
      ...(x.tur === 'fayl' ? { tur: 'fayl' as const } : {}),
    }));
}

export function javobMatni(j: Javob['javob']): string {
  return Array.isArray(j) ? j.join(', ') : j;
}

/**
 * Ariza sahifasidagi qadamlar uchun anketani bo'laklaydi.
 *
 *   boshi     — birinchi "bolim" gacha bo'lgan savollar (ishtirokchi qadamiga qo'shiladi)
 *   bolimlar  — har bir "bolim" va undan keyingi savollar (alohida qadam)
 *   roziliklar — rozilik belgilari: qayerda turganidan qat'i nazar oxirgi,
 *                tasdiqlash qadamida so'raladi
 */
export function qadamlargaBol(anketa: Savol[]): {
  boshi: Savol[];
  bolimlar: { sarlavha: Savol; savollar: Savol[] }[];
  roziliklar: Savol[];
} {
  const boshi: Savol[] = [];
  const bolimlar: { sarlavha: Savol; savollar: Savol[] }[] = [];
  const roziliklar: Savol[] = [];

  for (const s of anketa) {
    if (s.tur === 'rozilik') roziliklar.push(s);
    else if (s.tur === 'bolim') bolimlar.push({ sarlavha: s, savollar: [] });
    else if (bolimlar.length) bolimlar[bolimlar.length - 1].savollar.push(s);
    else boshi.push(s);
  }

  // Ichi bo'sh qadam ko'rsatilmaydi
  return { boshi, bolimlar: bolimlar.filter((b) => b.savollar.length > 0), roziliklar };
}
