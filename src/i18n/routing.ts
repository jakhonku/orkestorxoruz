import { defineRouting } from 'next-intl/routing';

export const locales = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];

/**
 * Sayt birinchi ochilganda shu tilda chiqadi.
 *
 * Til tanlash tugmasi orqali odam istagan tilga oʻtadi — oʻsha paytdan
 * boshlab manzil ham oʻzgaradi (/en/... -> /uz/...), shuning uchun sayt
 * boʻylab yurganda tanlangan til saqlanib qoladi.
 */
export const defaultLocale: Locale = 'uz';

export const localeNames: Record<Locale, string> = {
  uz: "Oʻzbekcha",
  ru: 'Русский',
  en: 'English',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  /**
   * Til brauzer sozlamasidan (accept-language) yoki cookieʼdan aniqlanmaydi.
   * Shu sababli sayt hammaga bir xil — oʻzbekcha ochiladi, keyin odam oʻzi
   * kerakli tilni tanlaydi.
   */
  localeDetection: false,
});
