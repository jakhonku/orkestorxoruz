/**
 * Sarlavhadan manzil qismini (slug) yasash.
 *
 * Admin panelda slug maydoni yo'q — u sarlavhadan avtomatik yasaladi.
 * Kirill va ruscha harflar lotinga o'giriladi, chunki manzilda faqat
 * lotin harflari, raqam va chiziqcha bo'lishi mumkin.
 */

const HARFLAR: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', о: 'o', ў: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ҳ: 'h', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'sch', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ə: 'a', ç: 'ch', ğ: 'g', ı: 'i', ö: 'o', ş: 'sh', ü: 'u',
  á: 'a', à: 'a', â: 'a', ä: 'a', é: 'e', è: 'e', ê: 'e', í: 'i', ó: 'o', ô: 'o',
  ú: 'u', ñ: 'n', ß: 'ss', '‘': '', '’': '', "'": '', '`': '',
};

/** Matnni manzilga yaroqli ko'rinishga keltiradi: "Buxoro yoshlar xori" -> "buxoro-yoshlar-xori" */
export function slugYasa(matn: string, uzunlik = 120): string {
  const lotin = matn
    .toLowerCase()
    .split('')
    .map((h) => HARFLAR[h] ?? h)
    .join('');

  return lotin
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, uzunlik)
    .replace(/-+$/, '');
}

/**
 * Band bo'lmagan manzil qismini tanlaydi.
 *
 * Bir xil nomli ikkita yozuv bo‘lishi mumkin (masalan ikki xil yildagi
 * "Bahor navolari"), shuning uchun band nom oxiriga raqam qo‘shiladi:
 * bahor-navolari, bahor-navolari-2, bahor-navolari-3 …
 */
export function bosSlugTanla(manba: string, band: Iterable<string>): string {
  const asos = slugYasa(manba) || 'yozuv';
  const olingan = new Set(band);

  if (!olingan.has(asos)) return asos;
  for (let i = 2; i < 500; i++) {
    const nomzod = `${asos}-${i}`;
    if (!olingan.has(nomzod)) return nomzod;
  }
  return `${asos}-${Date.now().toString(36)}`;
}
