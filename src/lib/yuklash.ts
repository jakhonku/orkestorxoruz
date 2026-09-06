/**
 * Fayl yuklash qoidalari — server (imzo berish) va brauzer (tekshirish)
 * bitta ro'yxatga tayanadi, shunda ikki joyda ikki xil qoida bo'lib qolmaydi.
 *
 * Fayl brauzerdan to'g'ridan-to'g'ri Supabase Storage'ga yuklanadi, shuning
 * uchun server so'rovining hajmi cheklovi (Vercel) yo'l to'sib qo'ymaydi.
 */

export type FaylGuruhi = 'rasm' | 'hujjat' | 'video';

type Tavsif = { kengaytma: string; guruh: FaylGuruhi };

/** Ruxsat etilgan turlar: MIME -> kengaytma va guruh */
export const RUXSAT_ETILGAN: Record<string, Tavsif> = {
  'image/jpeg': { kengaytma: '.jpg', guruh: 'rasm' },
  'image/png': { kengaytma: '.png', guruh: 'rasm' },
  'image/webp': { kengaytma: '.webp', guruh: 'rasm' },
  'image/avif': { kengaytma: '.avif', guruh: 'rasm' },
  'image/gif': { kengaytma: '.gif', guruh: 'rasm' },
  'image/svg+xml': { kengaytma: '.svg', guruh: 'rasm' },

  'application/pdf': { kengaytma: '.pdf', guruh: 'hujjat' },
  'application/msword': { kengaytma: '.doc', guruh: 'hujjat' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    kengaytma: '.docx',
    guruh: 'hujjat',
  },
  'application/vnd.ms-excel': { kengaytma: '.xls', guruh: 'hujjat' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    kengaytma: '.xlsx',
    guruh: 'hujjat',
  },

  'video/mp4': { kengaytma: '.mp4', guruh: 'video' },
  'video/webm': { kengaytma: '.webm', guruh: 'video' },
  'video/quicktime': { kengaytma: '.mov', guruh: 'video' },
};

/**
 * Brauzer fayl turini aytmasa (ayniqsa .mov bilan shunday bo'ladi) —
 * kengaytmaga qarab aniqlanadi.
 */
const KENGAYTMA_TURI: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  qt: 'video/quicktime',
};

/**
 * Eng katta hajm. Supabase loyihasining umumiy chegarasi — 50 MB,
 * shuning uchun undan oshiq qiymat qo'yilmaydi.
 */
export const CHEGARA: Record<FaylGuruhi, number> = {
  rasm: 15 * 1024 * 1024,
  hujjat: 30 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};

/** Fayl turini aniqlaydi: brauzer aytgan tur yoki kengaytmadan topilgani */
export function faylTuri(nom: string, tur?: string | null): string {
  const berilgan = (tur ?? '').toLowerCase().split(';')[0].trim();
  if (berilgan && berilgan in RUXSAT_ETILGAN) return berilgan;

  const kengaytma = nom.toLowerCase().split('.').pop() ?? '';
  return KENGAYTMA_TURI[kengaytma] ?? berilgan;
}

/** Fayl nomini manzilga yaroqli holga keltiradi */
export function xavfsizNom(nom: string): string {
  return nom
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function mb(baytlar: number): number {
  return Math.round(baytlar / 1024 / 1024);
}

/** Tur ruxsat etilmagan bo'lsa ko'rsatiladigan tushunarli xabar */
export function turXatosi(nom: string, tur: string): string {
  const kengaytma = nom.toLowerCase().split('.').pop() ?? '';

  if (['heic', 'heif'].includes(kengaytma)) {
    return (
      'iPhone’ning HEIC formatidagi rasmi — sayt uni ko‘rsata olmaydi. ' +
      'Telefonda "Sozlamalar → Kamera → Formatlar → Eng mos" ni tanlang yoki rasmni JPG ga o‘giring.'
    );
  }
  if (['mkv', 'avi', 'wmv', 'flv', '3gp'].includes(kengaytma)) {
    return `.${kengaytma} formatidagi video brauzerda ochilmaydi. MP4 ga o‘girib yuklang.`;
  }
  return (
    `Bu turdagi fayl (${tur || `.${kengaytma}`}) yuklanmaydi. ` +
    'Rasm — JPG, PNG, WEBP, AVIF, GIF, SVG; hujjat — PDF, Word, Excel; video — MP4, WEBM, MOV.'
  );
}

/** Hajm chegarasidan oshsa ko'rsatiladigan xabar */
export function hajmXatosi(guruh: FaylGuruhi, hajm: number): string {
  const chegara = mb(CHEGARA[guruh]);
  if (guruh === 'video') {
    return (
      `Video ${mb(hajm)} MB — chegara ${chegara} MB. Videoni siqing yoki YouTube’ga ` +
      'joylab, "YouTube ID" maydoniga havolasini qo‘ying.'
    );
  }
  const nomi = guruh === 'rasm' ? 'Rasm' : 'Fayl';
  return `${nomi} ${mb(hajm)} MB — chegara ${chegara} MB. Kichraytirib qayta yuklang.`;
}
