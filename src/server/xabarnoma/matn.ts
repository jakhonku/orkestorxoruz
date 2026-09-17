/**
 * Telegram xabarining matnini yasash.
 *
 * Alohida faylda turadi — `server-only` bog'liqligi yo'q, shuning uchun
 * mantiqni alohida sinab ko'rish mumkin.
 */

/** Telegram HTML rejimida bu uch belgi almashtirilishi shart */
export function himoya(matn: string): string {
  return matn.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Xabar qatori: bo'sh qiymatli qatorlar umuman chiqmaydi */
export type Qator = { yorliq: string; qiymat?: string | number | null };

/**
 * Ariza haqidagi xabarni tayyorlaydi.
 *
 * Qiymatlar foydalanuvchi yozgan matn, shuning uchun HTML belgilari
 * almashtiriladi — aks holda `<b>` kabi yozuv xabar ko'rinishini buzardi
 * yoki Telegram butun xabarni rad etardi.
 */
export function xabarMatni(sarlavha: string, qatorlar: Qator[], havola?: string): string {
  const bandlar = [`<b>${himoya(sarlavha)}</b>`, ''];

  for (const q of qatorlar) {
    const qiymat = String(q.qiymat ?? '').trim();
    if (!qiymat) continue;
    bandlar.push(`<b>${himoya(q.yorliq)}:</b> ${himoya(qiymat)}`);
  }

  if (havola) {
    bandlar.push('', `<a href="${himoya(havola)}">Admin panelda ochish</a>`);
  }

  return bandlar.join('\n');
}
