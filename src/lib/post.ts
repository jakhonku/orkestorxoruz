import { instagramAjrat, instagramHavolasimi, instagramKanonik } from './instagram';
import { telegramAjrat, telegramHavolasimi, telegramKanonik } from './telegram';
import { youtubeIdAjrat, youtubeIdTogrimi } from './youtube';

/**
 * Bitta "havola" maydoniga qo'yilgan manzilni tanib oladi.
 *
 * Muharrir YouTube videosini ham, Instagram postini ham, Telegram kanalidagi
 * postni ham shu bitta maydonga qo'yadi — qaysi biri ekanini sayt o'zi
 * aniqlaydi va sahifada mos ko'rinishda chiqaradi.
 */
export type PostManba =
  | { tur: 'youtube'; youtubeId: string }
  | { tur: 'instagram'; havola: string }
  | { tur: 'telegram'; havola: string };

export function postManbasi(xom: string): PostManba | null {
  const matn = (xom ?? '').trim();
  if (!matn) return null;

  if (instagramHavolasimi(matn)) {
    return instagramAjrat(matn) ? { tur: 'instagram', havola: instagramKanonik(matn) } : null;
  }

  if (telegramHavolasimi(matn)) {
    return telegramAjrat(matn) ? { tur: 'telegram', havola: telegramKanonik(matn) } : null;
  }

  const id = youtubeIdAjrat(matn);
  return youtubeIdTogrimi(id) ? { tur: 'youtube', youtubeId: id } : null;
}

/** Bazaga yozishdan oldin havolani bir xil ko'rinishga keltiradi */
export function postHavolaKanonik(xom: string): string {
  const manba = postManbasi(xom);
  if (!manba) return (xom ?? '').trim();
  return manba.tur === 'youtube'
    ? `https://www.youtube.com/watch?v=${manba.youtubeId}`
    : manba.havola;
}

/** Shakl ostida ko'rsatiladigan qisqa nom: "YouTube (ID)", "Telegram" ... */
export function postManbaNomi(manba: PostManba): string {
  if (manba.tur === 'youtube') return `YouTube (${manba.youtubeId})`;
  return manba.tur === 'instagram' ? 'Instagram post' : 'Telegram post';
}
