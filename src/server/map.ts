import type { Localized } from '@/types';

/**
 * Bazadagi Json ustunni Localized ga aylantiradi.
 *
 * Postgres jsonb har doim {"uz":"...","ru":"...","en":"..."} ko'rinishida
 * saqlanadi, lekin Prisma uni JsonValue deb qaytaradi — shuning uchun
 * bu yerda bir joyda tip beriladi.
 */
export function loc(value: unknown): Localized {
  return (value ?? { uz: '', ru: '', en: '' }) as Localized;
}

/** Ixtiyoriy Json ustun uchun — bo'sh bo'lsa undefined qaytaradi */
export function locOpt(value: unknown): Localized | undefined {
  return value == null ? undefined : (value as Localized);
}

/** {"uz": string[], ...} ko'rinishidagi ustunlar uchun */
export function locList(value: unknown): Localized<string[]> {
  return (value ?? { uz: [], ru: [], en: [] }) as Localized<string[]>;
}

/** Date -> 'YYYY-MM-DD' (frontend tiplari ISO satr kutadi) */
export function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
