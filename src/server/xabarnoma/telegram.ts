import 'server-only';

import { himoya, type Qator } from './matn';
import { arizalarHavolasi } from './pochta';

/**
 * Yangi ariza haqidagi xabarni Telegram botga yuboradi.
 *
 * Webhook kerak emas — webhook Telegram'dan xabar QABUL qilish uchun. Bu yerda
 * server Telegram API'ga oddiy so'rov yuboradi (`sendMessage`), shuning uchun
 * bot doim ishlab turadi va serverda hech narsa "tinglab" turmaydi.
 *
 * Sozlash (Vercel → Settings → Environment Variables):
 *   TELEGRAM_BOT_TOKEN — @BotFather bergan token
 *   TELEGRAM_CHAT_ID   — xabar boradigan chat: shaxsiy chat, guruh yoki kanal ID si.
 *                        Bir nechtasi bo'lsa vergul bilan ajratiladi.
 *
 * Xato hech qachon yuqoriga chiqmaydi — ariza baribir saqlanadi.
 */

const KUTISH_MS = 8_000;

function sozlamalar() {
  return {
    token: (process.env.TELEGRAM_BOT_TOKEN ?? '').trim(),
    chatlar: (process.env.TELEGRAM_CHAT_ID ?? '')
      .split(/[,;\s]+/)
      .map((x) => x.trim())
      .filter(Boolean),
  };
}

export function telegramSozlanganmi(): boolean {
  const s = sozlamalar();
  return Boolean(s.token) && s.chatlar.length > 0;
}

/** Xabar matni: sarlavha, qatorlar va admin panelga havola (Telegram HTML) */
function xabarMatni(sarlavha: string, qatorlar: Qator[]): string {
  const bandlar = [`<b>${himoya(sarlavha)}</b>`, ''];

  for (const q of qatorlar) {
    const qiymat = String(q.qiymat ?? '').trim();
    if (!qiymat) continue;
    bandlar.push(`<b>${himoya(q.yorliq)}:</b> ${himoya(qiymat)}`);
  }
  bandlar.push('', `<a href="${himoya(arizalarHavolasi())}">Admin panelda ochish</a>`);

  // Telegram bitta xabarni 4096 belgigacha qabul qiladi
  return bandlar.join('\n').slice(0, 4000);
}

/** Barcha chatlarga yuboradi. Kamida bittasiga bordi — `true`. */
export async function telegramYubor(sarlavha: string, qatorlar: Qator[]): Promise<boolean> {
  try {
    const s = sozlamalar();
    if (!s.token || s.chatlar.length === 0) return false;

    const matn = xabarMatni(sarlavha, qatorlar);

    const natijalar = await Promise.all(
      s.chatlar.map(async (chatId) => {
        try {
          const javob = await fetch(`https://api.telegram.org/bot${s.token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: matn,
              parse_mode: 'HTML',
              disable_web_page_preview: true,
            }),
            signal: AbortSignal.timeout(KUTISH_MS),
          });
          if (!javob.ok) {
            // Sabab (masalan "chat not found" yoki noto'g'ri token) jurnalga tushadi
            console.error('Telegram xabari yuborilmadi:', javob.status, await javob.text());
          }
          return javob.ok;
        } catch (e) {
          console.error('Telegram xabari yuborilmadi:', e instanceof Error ? e.message : e);
          return false;
        }
      }),
    );

    return natijalar.some(Boolean);
  } catch (e) {
    console.error('Telegram xabarnomasi xatosi:', e instanceof Error ? e.message : e);
    return false;
  }
}
