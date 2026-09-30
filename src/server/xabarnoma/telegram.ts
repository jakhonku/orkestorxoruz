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

/** Bitta javob shundan uzun bo'lsa qisqartiriladi (to'liq matn admin panelda) */
const QIYMAT_UZUNLIGI = 400;

/** Telegram bitta xabarni 4096 belgigacha qabul qiladi */
const XABAR_UZUNLIGI = 3800;

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

function qisqart(s: string): string {
  return s.length > QIYMAT_UZUNLIGI ? `${s.slice(0, QIYMAT_UZUNLIGI).trimEnd()}…` : s;
}

/**
 * Xabar matni: sarlavha, qatorlar va admin panelga havola.
 *
 * Uzun ariza (biografiya, asar tavsifi) xabarni 4096 belgidan oshirib yuboradi.
 * Matnni o'rtasidan kesish HTML tegni buzadi va Telegram xabarni butunlay rad
 * etadi — shuning uchun har bir javob alohida qisqartiriladi va sig'may qolgan
 * qatorlar butunlay tashlanadi.
 *
 * `oddiy` — teglarsiz variant: HTML qabul qilinmasa zaxira sifatida yuboriladi.
 */
function xabarMatni(sarlavha: string, qatorlar: Qator[], oddiy: boolean): string {
  const havola = arizalarHavolasi();
  const qism = (s: string) => (oddiy ? s : himoya(s));
  const qalin = (s: string) => (oddiy ? s : `<b>${himoya(s)}</b>`);

  const oxiri = oddiy
    ? `Admin panelda ochish: ${havola}`
    : `<a href="${himoya(havola)}">Admin panelda ochish</a>`;

  let matn = `${qalin(sarlavha)}\n`;
  let tashlandi = false;

  for (const q of qatorlar) {
    const qiymat = String(q.qiymat ?? '').trim();
    if (!qiymat) continue;

    const qator = `\n${qalin(`${q.yorliq}:`)} ${qism(qisqart(qiymat))}`;
    if (matn.length + qator.length + oxiri.length + 40 > XABAR_UZUNLIGI) {
      tashlandi = true;
      continue;
    }
    matn += qator;
  }

  if (tashlandi) matn += '\n\n… (qolgani admin panelda)';
  return `${matn}\n\n${oxiri}`;
}

/** Barcha chatlarga yuboradi. Kamida bittasiga bordi — `true`. */
export async function telegramYubor(sarlavha: string, qatorlar: Qator[]): Promise<boolean> {
  try {
    const s = sozlamalar();
    if (!s.token || s.chatlar.length === 0) return false;

    const yubor = (chatId: string, oddiy: boolean) =>
      fetch(`https://api.telegram.org/bot${s.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: xabarMatni(sarlavha, qatorlar, oddiy),
          ...(oddiy ? {} : { parse_mode: 'HTML' }),
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(KUTISH_MS),
      });

    const natijalar = await Promise.all(
      s.chatlar.map(async (chatId) => {
        try {
          let javob = await yubor(chatId, false);
          if (!javob.ok) {
            // Sabab (masalan "chat not found" yoki noto'g'ri token) jurnalga tushadi
            console.error('Telegram xabari yuborilmadi:', javob.status, await javob.text());
            // Matnda HTML tushunilmagan bo'lsa (400) — teglarsiz variant bilan qayta uriniladi
            if (javob.status === 400) javob = await yubor(chatId, true);
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
