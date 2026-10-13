import { locales, defaultLocale, type Locale } from '@/i18n/routing';

/**
 * Sahifaning canonical va hreflang manzillari.
 *
 * `path` — tilsiz yoʻl ('' = bosh sahifa, '/haqida', '/media/slug').
 * Manzillar nisbiy: ularni `metadataBase` (SITE.url) toʻliq manzilga aylantiradi.
 * `x-default` — til aniqlanmagan foydalanuvchilar uchun standart til.
 */
export function sahifaAlternates(locale: Locale, path = '') {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      'x-default': `/${defaultLocale}${path}`,
    },
  };
}
