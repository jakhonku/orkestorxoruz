/**
 * Instagram havolalarini tanish va o'rnatiladigan (embed) manzil yasash.
 *
 * Admin panelga havola turli ko'rinishda qo'yiladi:
 *   https://www.instagram.com/reel/ABC123/?igsh=...
 *   https://instagram.com/p/ABC123
 *   https://www.instagram.com/uz/tv/ABC123/
 *   https://www.instagram.com/share/BAxxxx      ← kodi yashirin ("ulashish" havolasi)
 *
 * Shu sababli havola saqlashdan oldin bir xil ko'rinishga keltiriladi —
 * saytda esa faqat kanonik havola bilan ishlanadi.
 */

/** Post, reel yoki IGTV havolasi. Oldida til kodi turishi mumkin: /uz/reel/... */
const HAVOLA = /instagram\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;

/** "Ulashish" havolasi — ichida post kodi yo'q, ochib ko'rmasdan bilib bo'lmaydi */
const ULASHISH = /instagram\.com\/share(\/|$|\?)/i;

export type InstagramTuri = 'p' | 'reel' | 'tv';

/** Havoladan post turi va kodini ajratadi. Tanimasa — null */
export function instagramAjrat(xom: string): { tur: InstagramTuri; kod: string } | null {
  const moslik = (xom ?? '').trim().match(HAVOLA);
  if (!moslik) return null;

  const tur = moslik[1].toLowerCase();
  // "reels" -> "reel": Instagram embed faqat shu ko'rinishni tushunadi
  return { tur: (tur === 'reels' ? 'reel' : tur) as InstagramTuri, kod: moslik[2] };
}

/** Bazaga yoziladigan bir xil ko'rinish: https://www.instagram.com/reel/KOD/ */
export function instagramKanonik(xom: string): string {
  const q = instagramAjrat(xom);
  return q ? `https://www.instagram.com/${q.tur}/${q.kod}/` : (xom ?? '').trim();
}

/** <iframe> ichiga qo'yiladigan manzil. Havola tanilmasa — null */
export function instagramEmbed(xom: string): string | null {
  const q = instagramAjrat(xom);
  return q ? `https://www.instagram.com/${q.tur}/${q.kod}/embed/` : null;
}

/** Umuman Instagram havolasimi (tanilmagan ko'rinishi ham) */
export function instagramHavolasimi(xom: string): boolean {
  return /instagram\.com/i.test((xom ?? '').trim());
}

/** Ilovaning "Ulashish" tugmasi bergan havolami */
export function instagramUlashishmi(xom: string): boolean {
  return ULASHISH.test((xom ?? '').trim());
}
