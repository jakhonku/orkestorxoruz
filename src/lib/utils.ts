import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale } from '@/i18n/routing';
import type { Localized } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolve a Localized value for the active locale, falling back to uz. */
export function pick<T>(value: Localized<T>, locale: string): T {
  return (value as Record<string, T>)[locale] ?? value.uz;
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
