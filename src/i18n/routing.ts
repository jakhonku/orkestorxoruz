import { defineRouting } from 'next-intl/routing';

export const locales = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];

/**
 * Sayt birinchi ochilganda shu tilda chiqadi.
 *
 * Til tanlash tugmasi orqali odam istagan tilga o'tadi — o'sha paytdan
 * boshlab manzil ham o'zgaradi (/en/... -> /uz/...), shuning uchun sayt
 * bo'ylab yurganda tanlangan til saqlanib qoladi.
 */
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  /**
   * Til brauzer sozlamasidan (accept-language) yoki cookie'dan aniqlanmaydi.
   * Shu sababli sayt hammaga bir xil — inglizcha ochiladi, keyin odam o'zi
   * kerakli tilni tanlaydi.
   */
  localeDetection: false,
});
