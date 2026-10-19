/**
 * Tanlovga ariza qabul qilish muddati.
 *
 * Admin faqat sanani kiritadi (oxirgi kun). Ariza shu kunning oxirigacha —
 * Toshkent vaqti bilan 23:59:59 gacha — qabul qilinadi. Muddat oʻtgach
 * "ochiq" tanlov avtomatik "yopiq" hisoblanadi (bazadagi holat oʻzgarmaydi).
 */

const TOSHKENT_SOAT_FARQI = 5 * 3600 * 1000;
const KUN = 24 * 3600 * 1000;

/** Oxirgi kun tugaydigan aniq vaqt (Toshkent boʻyicha 23:59:59.999) */
export function muddatTugashVaqti(oxirgiKun: Date): number {
  return oxirgiKun.getTime() + KUN - TOSHKENT_SOAT_FARQI - 1;
}

export function muddatOtdimi(oxirgiKun: Date | null | undefined, hozir = Date.now()): boolean {
  return !!oxirgiKun && hozir > muddatTugashVaqti(oxirgiKun);
}

/** Bazadagi holat + muddat → haqiqiy holat */
export function arizaOchiqmi(
  status: 'OCHIQ' | 'YOPIQ' | 'TEZ_KUNDA',
  oxirgiKun: Date | null | undefined,
): boolean {
  return status === 'OCHIQ' && !muddatOtdimi(oxirgiKun);
}
