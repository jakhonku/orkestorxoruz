/**
 * Telegram kanal postining havolasini tanish.
 *
 * Qabul qilinadigan ko'rinishlar:
 *   https://t.me/kanal/123
 *   https://t.me/s/kanal/123        (brauzerdagi ko'rinish)
 *   https://telegram.me/kanal/123
 *   ...?single, ...?comment=5       (qo'shimchalar tashlab yuboriladi)
 *
 * Yopiq kanal havolasi (t.me/c/1234567/89) saytga o'rnatilmaydi — Telegram
 * faqat ochiq kanal postini ko'rsatadi.
 */

const POST = /t(?:elegram)?[.]me\/(?:s\/)?([A-Za-z][A-Za-z0-9_]{3,})\/(\d+)/i;
const YOPIQ = /t(?:elegram)?[.]me\/c\//i;

/** Havoladagi `?single` belgisi — guruhdagi bitta postni ko'rsatish */
const YOLGIZ = /[?&]single(=|&|$)/i;

export function telegramAjrat(
  xom: string,
): { kanal: string; post: string; yolgiz: boolean } | null {
  const matn = (xom ?? '').trim();
  if (YOPIQ.test(matn)) return null;

  const moslik = matn.match(POST);
  if (!moslik) return null;

  /**
   * `?single` — Telegramning o'zi qo'yadigan belgi: post bir nechta rasmdan
   * iborat guruhning bir qismi bo'lsa, faqat o'sha bittasini ko'rsatadi.
   * Tashlab yuborilsa, saytda butun guruh chiqib, muharrir nusxalagan
   * havoladan boshqacha ko'rinish hosil bo'lardi.
   */
  return { kanal: moslik[1], post: moslik[2], yolgiz: YOLGIZ.test(matn) };
}

/** Bazaga yoziladigan bir xil ko'rinish: https://t.me/kanal/123 */
export function telegramKanonik(xom: string): string {
  const q = telegramAjrat(xom);
  if (!q) return (xom ?? '').trim();
  return `https://t.me/${q.kanal}/${q.post}${q.yolgiz ? '?single' : ''}`;
}

/**
 * <iframe> ichiga qo'yiladigan manzil.
 *
 * `dark=0` — post har doim oq fonda chiqadi. Busiz Telegram tashrif
 * buyuruvchining tizim mavzusiga qaraydi va qorong'i rejimdagi kompyuterda
 * oq kartochka ichida qora post paydo bo'lardi.
 */
export function telegramEmbed(xom: string): string | null {
  const q = telegramAjrat(xom);
  if (!q) return null;
  const yolgiz = q.yolgiz ? '&single=1' : '';
  return `https://t.me/${q.kanal}/${q.post}?embed=1&userpic=true&dark=0${yolgiz}`;
}

/** Umuman Telegram havolasimi (yopiq kanal yoki kanalning o'zi ham) */
export function telegramHavolasimi(xom: string): boolean {
  return /t(?:elegram)?[.]me\//i.test((xom ?? '').trim());
}

/** Yopiq kanal posti — o'rnatib bo'lmaydi, muharrirga shuni aytish kerak */
export function telegramYopiqmi(xom: string): boolean {
  return YOPIQ.test((xom ?? '').trim());
}
