/**
 * Excel varag'idan o'qilgan xom jadvalni shakl qatorlariga o'girish.
 *
 * Bu yerda React ham, SheetJS ham yo'q — faqat sof funksiyalar. Shu sababli
 * mantiqni alohida sinab ko'rish mumkin, komponent esa faqat fayl o'qish va
 * ko'rinish bilan shug'ullanadi.
 */

import { TILLAR, type KopTilli, type Maydon } from '@/server/admin/turlar';

export const KOP_TILLI: Maydon['tur'][] = ['kopTilli', 'kopTilliKatta', 'kopTilliRoyxat'];

/**
 * Ustun sarlavhasini solishtirishga tayyorlaydi: harf va raqamdan boshqa
 * hamma narsa olib tashlanadi. Shu sababli "F.I.SH. (UZ)", "fish uz" va
 * "name_uz" — bitta ustun sifatida tanib olinadi.
 */
export function kalitla(matn: string): string {
  return matn.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

/** Namuna fayl va ko'rsatmadagi ustun sarlavhalari */
export function sarlavhalarRoyxati(ichki: Maydon[]): string[] {
  const s: string[] = [];
  for (const im of ichki) {
    if (KOP_TILLI.includes(im.tur)) {
      for (const til of TILLAR) s.push(`${im.yorliq} (${til.qisqa})`);
    } else {
      s.push(im.yorliq);
    }
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* Ustunlarni maydonlarga bog'lash                                     */
/* ------------------------------------------------------------------ */

type Boglanish = { im: Maydon; ustunlar: Partial<Record<'uz' | 'ru' | 'en' | 'bir', string>> };

function ustunTop(sarlavhalar: Map<string, string>, nomzodlar: string[]): string | undefined {
  for (const n of nomzodlar) {
    const topildi = sarlavhalar.get(kalitla(n));
    if (topildi !== undefined) return topildi;
  }
  return undefined;
}

function bogla(ichki: Maydon[], sarlavhalar: Map<string, string>): Boglanish[] {
  return ichki.map((im) => {
    const ustunlar: Boglanish['ustunlar'] = {};

    if (KOP_TILLI.includes(im.tur)) {
      for (const til of TILLAR) {
        const u = ustunTop(sarlavhalar, [
          `${im.nom} ${til.kalit}`,
          `${im.yorliq} ${til.kalit}`,
          `${im.yorliq} ${til.qisqa}`,
        ]);
        if (u) ustunlar[til.kalit] = u;
      }
      // Tilsiz ustun ham qabul qilinadi — u o'zbekcha deb olinadi
      if (!ustunlar.uz) {
        const u = ustunTop(sarlavhalar, [im.nom, im.yorliq]);
        if (u) ustunlar.uz = u;
      }
    } else {
      const u = ustunTop(sarlavhalar, [im.nom, im.yorliq]);
      if (u) ustunlar.bir = u;
    }

    return { im, ustunlar };
  });
}

/* ------------------------------------------------------------------ */
/* Katakdagi matnni maydon turiga o'girish                             */
/* ------------------------------------------------------------------ */

function matn(qator: Record<string, unknown>, ustun: string | undefined): string {
  if (!ustun) return '';
  const q = qator[ustun];
  return q === null || q === undefined ? '' : String(q).trim();
}

function royxat(xom: string): string[] {
  return xom
    .split(/\r?\n|;/)
    .map((b) => b.trim())
    .filter(Boolean);
}

function qiymatQur(b: Boglanish, qator: Record<string, unknown>): unknown {
  const { im, ustunlar } = b;

  if (im.tur === 'kopTilli' || im.tur === 'kopTilliKatta') {
    const v: KopTilli = { uz: '', ru: '', en: '' };
    for (const til of TILLAR) v[til.kalit] = matn(qator, ustunlar[til.kalit]);
    return v;
  }

  if (im.tur === 'kopTilliRoyxat') {
    return {
      uz: royxat(matn(qator, ustunlar.uz)),
      ru: royxat(matn(qator, ustunlar.ru)),
      en: royxat(matn(qator, ustunlar.en)),
    };
  }

  const xom = matn(qator, ustunlar.bir);

  if (im.tur === 'raqam') {
    if (xom === '') return null;
    const n = Number(xom.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  if (im.tur === 'belgi') {
    return /^(ha|yes|true|1|\+|bor)$/i.test(xom);
  }

  if (im.tur === 'tanlov') {
    const k = kalitla(xom);
    const moslik = (im.variantlar ?? []).find(
      (v) => kalitla(v.qiymat) === k || kalitla(v.yorliq) === k,
    );
    return moslik ? moslik.qiymat : xom;
  }

  return xom;
}

/** Maydon to'ldirilganmi — talab qilinganlarni tekshirish uchun */
export function boshmi(im: Maydon, qiymat: unknown): boolean {
  if (KOP_TILLI.includes(im.tur)) {
    const v = qiymat as Record<string, unknown>;
    return TILLAR.every((t) => {
      const x = v?.[t.kalit];
      return Array.isArray(x) ? x.length === 0 : String(x ?? '').trim() === '';
    });
  }
  if (im.tur === 'raqam') return qiymat === null;
  if (im.tur === 'belgi') return false;
  return String(qiymat ?? '').trim() === '';
}

/* ------------------------------------------------------------------ */
/* Asosiy funksiya                                                     */
/* ------------------------------------------------------------------ */

export type OqishNatijasi = {
  qatorlar: Record<string, unknown>[];
  ogohlantirishlar: string[];
  topilmaganUstunlar: string[];
};

/**
 * Xom jadval (`sheet_to_json` natijasi) → shakl qatorlari.
 *
 * Bo'sh satrlar jimgina tashlab ketiladi, talab qilingan maydoni bo'sh
 * satrlar esa ogohlantirish bilan tashlanadi — shunda muharrir qaysi
 * satr tushib qolganini biladi.
 */
export function jadvalniOqi(
  ichki: Maydon[],
  jadval: Record<string, unknown>[],
): OqishNatijasi {
  // Birinchi satrdagi sarlavhalar emas, barcha kalitlar yig'iladi:
  // Excel ba'zan bo'sh kataklarni tashlab ketadi.
  const sarlavhalar = new Map<string, string>();
  for (const q of jadval) {
    for (const k of Object.keys(q)) {
      const kalit = kalitla(k);
      if (kalit && !sarlavhalar.has(kalit)) sarlavhalar.set(kalit, k);
    }
  }

  const bogliqlar = bogla(ichki, sarlavhalar);

  const topilmaganUstunlar = bogliqlar
    .filter((b) => Object.keys(b.ustunlar).length === 0)
    .map((b) => b.im.yorliq);

  const qatorlar: Record<string, unknown>[] = [];
  const ogohlantirishlar: string[] = [];

  jadval.forEach((xomQator, i) => {
    const yozuv: Record<string, unknown> = {};
    for (const b of bogliqlar) yozuv[b.im.nom] = qiymatQur(b, xomQator);

    // Butunlay bo'sh satr — Excel oxiridagi bo'shliqlar shu yerda tushib qoladi
    if (bogliqlar.every((b) => boshmi(b.im, yozuv[b.im.nom]))) return;

    const yetishmaydi = bogliqlar
      .filter((b) => b.im.talab && boshmi(b.im, yozuv[b.im.nom]))
      .map((b) => b.im.yorliq);

    if (yetishmaydi.length > 0) {
      // +2: birinchi satr sarlavha, hisob 1 dan boshlanadi
      ogohlantirishlar.push(`${i + 2}-satr tashlab ketildi — ${yetishmaydi.join(', ')} bo‘sh`);
      return;
    }

    qatorlar.push(yozuv);
  });

  return { qatorlar, ogohlantirishlar, topilmaganUstunlar };
}
