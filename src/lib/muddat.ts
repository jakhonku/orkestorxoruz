/**
 * Tanlovga ariza qabul qilish muddati.
 *
 * Admin oxirgi sana VA vaqtni kiritadi (Toshkent vaqti bilan). Shu vaqt
 * oʻtgach "ochiq" tanlov avtomatik "yopiq" hisoblanadi — bazadagi holat
 * oʻzgarmaydi, hisob-kitob soʻrov paytida qilinadi.
 */

/** Toshkent UTC+5 (yozgi vaqt yoʻq) */
const TOSHKENT_SOAT_FARQI = 5 * 3600 * 1000;

export function muddatOtdimi(muddat: Date | null | undefined, hozir = Date.now()): boolean {
  return !!muddat && hozir >= muddat.getTime();
}

/** Bazadagi holat + muddat → ariza hozir qabul qilinadimi */
export function arizaOchiqmi(
  status: 'OCHIQ' | 'YOPIQ' | 'TEZ_KUNDA',
  muddat: Date | null | undefined,
): boolean {
  return status === 'OCHIQ' && !muddatOtdimi(muddat);
}

/** Admin shakli kiritgan "YYYY-MM-DDTHH:mm" (Toshkent vaqti) → Date */
export function toshkentdanDate(matn: string): Date | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(matn.trim());
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:00+05:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → "YYYY-MM-DDTHH:mm" (Toshkent vaqti) — admin shakli uchun */
export function toshkentMatni(d: Date): string {
  return new Date(d.getTime() + TOSHKENT_SOAT_FARQI).toISOString().slice(0, 16);
}

/** Koʻrsatish uchun: "31.12.2026 18:00" */
export function muddatKorinishi(d: Date): string {
  const [sana, vaqt] = toshkentMatni(d).split('T');
  return `${sana.split('-').reverse().join('.')} ${vaqt}`;
}
