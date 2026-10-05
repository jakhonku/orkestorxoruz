import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale } from '@/i18n/routing';
import type { Localized } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Har bir til uchun zaxira tartibi.
 *
 * Admin panelda yozuv koʻpincha avval oʻzbekcha toʻldiriladi, tarjimalar esa
 * keyinroq qoʻshiladi. Shu sababli tanlangan tildagi matn boʻsh boʻlsa,
 * sahifada boʻsh joy qolmasligi uchun keyingi tildagi matn koʻrsatiladi.
 */
const ZAXIRA_TARTIBI: Record<Locale, Locale[]> = {
  uz: ['uz', 'ru', 'en'],
  ru: ['ru', 'uz', 'en'],
  en: ['en', 'uz', 'ru'],
};

/** Matn ham, roʻyxat ham boʻsh sanaladi — ikkalasi ham zaxiraga oʻtadi */
function boshmi(qiymat: unknown): boolean {
  if (qiymat === null || qiymat === undefined) return true;
  if (typeof qiymat === 'string') return qiymat.trim() === '';
  if (Array.isArray(qiymat)) {
    return qiymat.every((band) => typeof band === 'string' && band.trim() === '');
  }
  return false;
}

/**
 * Localized qiymatdan joriy tildagisini oladi.
 * Tanlangan tilda matn boʻlmasa — zaxira tartibi boʻyicha toʻldirilgani.
 */
export function pick<T>(value: Localized<T>, locale: string): T {
  const tartib = ZAXIRA_TARTIBI[locale as Locale] ?? ZAXIRA_TARTIBI.uz;
  const manba = (value ?? {}) as Record<string, T>;

  for (const til of tartib) {
    const qiymat = manba[til];
    if (!boshmi(qiymat)) return qiymat;
  }

  // Hamma til boʻsh — tanlangan tildagi (boʻsh) qiymat qaytariladi
  return manba[tartib[0]] ?? manba.uz;
}

/** Turn an ISO 3166 country code into a flag emoji. */
export function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const monthNames: Record<Locale, string[]> = {
  uz: [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
  ],
  ru: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  const month = monthNames[locale][d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  if (locale === 'ru') return `${day} ${month.toLowerCase()} ${year}`;
  if (locale === 'en') return `${month} ${day}, ${year}`;
  return `${day}-${month.toLowerCase()}, ${year}`;
}

export function getMonthName(monthIndex: number, locale: Locale): string {
  return monthNames[locale][monthIndex];
}
