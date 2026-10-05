import type { Localized } from '@/types';

/**
 * Uchala tilda ham bir xil yoziladigan matn.
 *
 * Ism-familiyalar uch tilli boʻlib qoldi (lotin, kirill, inglizcha yozuv
 * farq qiladi), lekin bu boshlangʻich maʼlumotlarda faqat lotincha varianti
 * bor — shuning uchun uchala tilga ham oʻsha qoʻyiladi.
 */
export const bir = (matn: string): Localized => ({ uz: matn, ru: matn, en: matn });
