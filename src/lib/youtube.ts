/**
 * YouTube havolasidan video ID ajratish.
 *
 * Admin panelda "YouTube ID" maydoniga ko'pincha to'liq havola qo'yiladi
 * (https://www.youtube.com/watch?v=... — 40 belgidan uzun). Bazadagi ustun esa
 * qisqa ID uchun mo'ljallangan, shu sababli qiymat saqlashdan oldin tozalanadi.
 */

/** YouTube video ID: 11 ta harf/raqam/tire/pastki chiziq */
const ID_NAMUNA = /^[A-Za-z0-9_-]{11}$/;

/** Havolaning turli ko'rinishlaridan ID ajratadigan namunalar */
const HAVOLA_NAMUNALARI = [
  /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
  /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
  /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/ID
  /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/ID
  /\/live\/([A-Za-z0-9_-]{11})/, // /live/ID
  /\/v\/([A-Za-z0-9_-]{11})/, // /v/ID
];

/**
 * Kiritilgan matndan YouTube ID ni qaytaradi.
 * Ajratib bo'lmasa — matnning o'zi (tozalangan holda) qaytadi, shunda
 * foydalanuvchiga tushunarli xato xabari ko'rsatiladi.
 */
export function youtubeIdAjrat(xom: string): string {
  const matn = xom.trim();
  if (!matn) return '';
  if (ID_NAMUNA.test(matn)) return matn;

  for (const namuna of HAVOLA_NAMUNALARI) {
    const moslik = matn.match(namuna);
    if (moslik) return moslik[1];
  }
  return matn;
}

/** Qiymat haqiqiy YouTube ID ga o'xshaydimi */
export function youtubeIdTogrimi(qiymat: string): boolean {
  return ID_NAMUNA.test(qiymat.trim());
}
