import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';
import { matnniJoylash, uiMatnlar } from '@/server/queries/matnlar';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  /**
   * Standart matnlar — `messages/*.json` fayllaridan.
   * Ular ustidan admin panelda tahrirlangan matnlar yoziladi (`ui_texts`),
   * shu tufayli saytdagi har bir yozuvni koddan tashqarida o'zgartirish mumkin.
   */
  const standart = (await import(`../../messages/${locale}.json`)).default;
  const messages = structuredClone(standart);

  const tahrirlangan = await uiMatnlar(locale as Locale);
  for (const [kalit, qiymat] of Object.entries(tahrirlangan)) {
    matnniJoylash(messages as Record<string, unknown>, kalit, qiymat);
  }

  return { locale, messages };
});
