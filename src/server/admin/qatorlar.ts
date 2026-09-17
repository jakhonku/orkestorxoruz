/**
 * Takrorlanuvchi qatorlar (tarkib, repertuar, galereya, natijalar...)
 * uchun tekshiruv qoidalari.
 *
 * Alohida faylda turadi, chunki `amallar.ts` — server amali (`use server`)
 * va undan faqat async funksiya eksport qilish mumkin.
 */

import { TILLAR, type Maydon, type Qiymatlar } from './turlar';

/** Qator ichidagi bitta maydon bo'shmi */
export function ichkiBoshmi(im: Maydon, qiymat: unknown): boolean {
  if (im.tur === 'kopTilli' || im.tur === 'kopTilliKatta') {
    const v = qiymat as Record<string, unknown> | null;
    return !TILLAR.some((t) => String(v?.[t.kalit] ?? '').trim() !== '');
  }
  if (im.tur === 'kopTilliRoyxat') {
    const v = qiymat as Record<string, unknown[]> | null;
    return !TILLAR.some((t) => (v?.[t.kalit] ?? []).some((x) => String(x ?? '').trim() !== ''));
  }
  if (im.tur === 'raqam') return qiymat === null || qiymat === undefined || qiymat === '';
  if (im.tur === 'belgi') return !qiymat;
  return String(qiymat ?? '').trim() === '';
}

/**
 * Butunlay bo'sh qator — muharrir "Qator qo'shish" ni bosgan-u, to'ldirmagan.
 *
 * Bunday qator bazaga yozilmaydi: NOT NULL ustunlar uni rad etardi va
 * muharrirga tushunarsiz Postgres xatosi ko'rinardi
 * ("null value in column \"src\" violates not-null constraint").
 */
export function qatorBoshmi(m: Maydon, q: Record<string, unknown>): boolean {
  return (m.maydonlar ?? []).every((im) => ichkiBoshmi(im, q[im.nom]));
}

/** Bo'sh qatorlarni tashlaydi — qolganlari bazaga yoziladi */
export function qatorlarniTozala(m: Maydon, xom: unknown): Record<string, unknown>[] {
  return ((xom as Record<string, unknown>[]) ?? []).filter((q) => !qatorBoshmi(m, q));
}

/**
 * To'ldirilgan qatorda majburiy maydon bo'sh qolgan bo'lsa — tushunarli xato.
 * Masalan galereyaga qator qo'shilgan, izoh yozilgan, lekin rasm yuklanmagan.
 */
export function qatorlarTekshir(maydonlar: Maydon[], qiymatlar: Qiymatlar): string | null {
  for (const m of maydonlar) {
    if (m.tur !== 'qatorlar') continue;

    const xom = (qiymatlar[m.nom] as Record<string, unknown>[]) ?? [];
    for (const [i, q] of xom.entries()) {
      if (qatorBoshmi(m, q)) continue; // bo'sh qator jimgina tashlanadi

      for (const im of m.maydonlar ?? []) {
        if (!im.talab || !ichkiBoshmi(im, q[im.nom])) continue;
        return (
          `"${m.yorliq}" — ${i + 1}-qatorda "${im.yorliq}" to‘ldirilmagan. ` +
          'Uni to‘ldiring yoki qatorni o‘chiring.'
        );
      }
    }
  }
  return null;
}
