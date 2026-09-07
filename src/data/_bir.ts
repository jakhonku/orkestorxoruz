import type { Localized } from '@/types';

/**
 * Uchala tilda ham bir xil yoziladigan matn.
 *
 * Ism-familiyalar uch tilli bo'lib qoldi (lotin, kirill, inglizcha yozuv
 * farq qiladi), lekin bu boshlang'ich ma'lumotlarda faqat lotincha varianti
 * bor — shuning uchun uchala tilga ham o'sha qo'yiladi.
 */
export const bir = (matn: string): Localized => ({ uz: matn, ru: matn, en: matn });
