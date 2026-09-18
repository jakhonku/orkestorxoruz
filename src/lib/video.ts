import { instagramAjrat, instagramHavolasimi, instagramKanonik } from './instagram';
import { youtubeIdAjrat, youtubeIdTogrimi } from './youtube';

/**
 * Bitta "Video havolasi" maydoniga qo'yilgan manzilni tanib oladi.
 *
 * Muharrir YouTube havolasini ham, Instagram havolasini ham shu bitta
 * maydonga qo'yadi — qaysi biri ekanini sayt o'zi aniqlaydi.
 */
export type VideoManba =
  | { tur: 'youtube'; youtubeId: string }
  | { tur: 'instagram'; havola: string };

export function videoManbasi(xom: string): VideoManba | null {
  const matn = (xom ?? '').trim();
  if (!matn) return null;

  if (instagramHavolasimi(matn)) {
    return instagramAjrat(matn) ? { tur: 'instagram', havola: instagramKanonik(matn) } : null;
  }

  const id = youtubeIdAjrat(matn);
  return youtubeIdTogrimi(id) ? { tur: 'youtube', youtubeId: id } : null;
}

/** Bazaga yozishdan oldin havolani bir xil ko'rinishga keltiradi */
export function videoHavolaKanonik(xom: string): string {
  const manba = videoManbasi(xom);
  if (!manba) return (xom ?? '').trim();
  return manba.tur === 'youtube'
    ? `https://www.youtube.com/watch?v=${manba.youtubeId}`
    : manba.havola;
}
