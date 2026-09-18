/**
 * Takrorlanuvchi qatorlar (tarkib, repertuar, galereya, natijalar...)
 * uchun tekshiruv qoidalari.
 *
 * Alohida faylda turadi, chunki `amallar.ts` — server amali (`use server`)
 * va undan faqat async funksiya eksport qilish mumkin.
 */

import { instagramAjrat, instagramUlashishmi } from '@/lib/instagram';
import { postManbasi } from '@/lib/post';
import { qiymatBoshmi, type Maydon, type Qiymatlar } from './turlar';

/** Qator ichidagi bitta maydon bo'shmi — oddiy maydonlar bilan bir xil qoida */
export function ichkiBoshmi(im: Maydon, qiymat: unknown): boolean {
  return qiymatBoshmi(im, qiymat);
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
        if (im.talab && ichkiBoshmi(im, q[im.nom])) {
          return (
            `"${m.yorliq}" — ${i + 1}-qatorda "${im.yorliq}" to‘ldirilmagan. ` +
            'Uni to‘ldiring yoki qatorni o‘chiring.'
          );
        }

        // Havola tanilmasa, yozuv jimgina saqlanib, saytda ishlamay turardi
        const havolaXatosi = havolaniTekshir(im, q[im.nom]);
        if (havolaXatosi) return `"${m.yorliq}" — ${i + 1}-qatorda ${havolaXatosi}`;
      }
    }
  }
  return null;
}

/**
 * Qator ichidagi Instagram / video havolasi tanilganini tekshiradi.
 *
 * "Ulashish" havolasi bu bosqichda o'tkaziladi — uni saqlash amali oldindan
 * ochib, haqiqiy havolaga aylantiradi.
 */
function havolaniTekshir(im: Maydon, qiymat: unknown): string | null {
  const matn = String(qiymat ?? '').trim();
  if (!matn || instagramUlashishmi(matn)) return null;

  if (im.tur === 'instagram' && !instagramAjrat(matn)) {
    return (
      `"${im.yorliq}" tanilmadi. Postni brauzerda ochib, manzil qatoridagi havolani ` +
      'nusxalang (masalan https://www.instagram.com/reel/ABC123/).'
    );
  }

  if (im.tur === 'postHavola' && !postManbasi(matn)) {
    return `"${im.yorliq}" tanilmadi. YouTube, Instagram yoki Telegram havolasini qo‘ying.`;
  }

  return null;
}
