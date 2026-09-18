/**
 * Ariza haqidagi xat matnini yasash.
 *
 * Alohida faylda turadi — `server-only` bog'liqligi yo'q, shuning uchun
 * mantiqni alohida sinab ko'rish mumkin.
 */

/** HTML da bu uch belgi almashtirilishi shart */
export function himoya(matn: string): string {
  return matn.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Xat qatori: bo'sh qiymatli qatorlar umuman chiqmaydi */
export type Qator = { yorliq: string; qiymat?: string | number | null };

/** Bo'sh bo'lmagan qatorlar */
function toza(qatorlar: Qator[]): { yorliq: string; qiymat: string }[] {
  return qatorlar
    .map((q) => ({ yorliq: q.yorliq, qiymat: String(q.qiymat ?? '').trim() }))
    .filter((q) => q.qiymat !== '');
}

/** Oddiy matnli ko'rinish — pochta dasturi HTML ni ko'rsatmasa ishlatiladi */
export function xabarMatni(sarlavha: string, qatorlar: Qator[], havola?: string): string {
  const bandlar = [sarlavha, ''];

  for (const q of toza(qatorlar)) bandlar.push(`${q.yorliq}: ${q.qiymat}`);
  if (havola) bandlar.push('', `Admin panelda ochish: ${havola}`);

  return bandlar.join('\n');
}

/**
 * Xatning HTML ko'rinishi — saytning ranglarida, jadval ko'rinishida.
 *
 * Pochta dasturlari zamonaviy CSS ni tushunmaydi, shuning uchun uslublar
 * to'g'ridan-to'g'ri teglarga yoziladi.
 */
export function xabarHtml(sarlavha: string, qatorlar: Qator[], havola?: string): string {
  const qatorlarHtml = toza(qatorlar)
    .map(
      (q) => `
        <tr>
          <td style="padding:8px 12px;background:#f6f8fb;border-bottom:1px solid #e6eaf2;
                     font-size:13px;color:#5b6577;white-space:nowrap;vertical-align:top">
            ${himoya(q.yorliq)}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e6eaf2;font-size:14px;color:#14213d">
            ${himoya(q.qiymat).replace(/\n/g, '<br>')}
          </td>
        </tr>`,
    )
    .join('');

  const tugma = havola
    ? `<p style="margin:20px 0 0">
         <a href="${himoya(havola)}"
            style="display:inline-block;padding:10px 18px;background:#14213d;color:#fff;
                   border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">
           Admin panelda ochish
         </a>
       </p>`
    : '';

  return `<!doctype html>
<html lang="uz">
  <body style="margin:0;padding:24px;background:#eef1f6;
               font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;
                  border:1px solid #e6eaf2;overflow:hidden">
      <tr>
        <td style="padding:20px 24px;background:#14213d;color:#fff;font-size:16px;font-weight:600">
          ${himoya(sarlavha)}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${qatorlarHtml}
          </table>
          ${tugma}
        </td>
      </tr>
      <tr>
        <td style="padding:14px 24px;background:#f6f8fb;font-size:12px;color:#8a93a5">
          Bu xat sayt formasidan avtomatik yuborildi.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
