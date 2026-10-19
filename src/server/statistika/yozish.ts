import 'server-only';

import { createHash } from 'node:crypto';

/**
 * Statistika yozuvlari uchun yordamchilar.
 * IP va cookie saqlanmaydi: noyob tashrifchi kunlik oʻzgaradigan hash bilan aniqlanadi.
 */

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python-requests|monitor|uptime/i;

export function botmi(userAgent: string | null): boolean {
  return !userAgent || BOT.test(userAgent);
}

/** Toshkent vaqti bilan bugungi sana (YYYY-MM-DD) */
export function toshkentSanasi(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(d);
}

/** Kunlik oʻzgaradigan bir tomonlama hash — IP qayta tiklanmaydi */
export function tashrifchiHash(ip: string, userAgent: string): string {
  const tuz = process.env.STATISTIKA_TUZ ?? 'orkestr-statistika';
  return createHash('sha256').update(`${ip}|${userAgent}|${toshkentSanasi()}|${tuz}`).digest('hex');
}

/** Faqat saytning ochiq sahifalari hisoblanadi */
export function yolToza(yol: unknown): string | null {
  if (typeof yol !== 'string' || !yol.startsWith('/') || yol.length > 300) return null;
  if (/^\/(admin|api|_next)(\/|$)/.test(yol)) return null;
  return yol.split('?')[0].split('#')[0];
}

export function davlatKodi(v: string | null): string | null {
  return v && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : null;
}
