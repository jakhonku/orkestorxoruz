import 'server-only';

import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';
import { xabarMatni, type Qator } from './matn';

/**
 * Yangi ariza kelganda Telegram botga xabar yuboradi.
 *
 * Nega Telegram: bepul, domen va DNS sozlash kerak emas, xabar spamga
 * tushmaydi va telefonga darhol keladi.
 *
 * Ikkita sozlama kerak:
 *   TELEGRAM_BOT_TOKEN  — muhit o'zgaruvchisi (maxfiy, Vercel'da saqlanadi)
 *   Telegram chat ID    — admin panelda "Sozlamalar" da; u yerda bo'sh bo'lsa
 *                         TELEGRAM_CHAT_ID muhit o'zgaruvchisi ishlatiladi
 *
 * MUHIM: xabar yuborilmasa ham ariza baribir saqlanadi. Bu yerdagi hech bir
 * xato yuqoriga chiqmaydi — Telegram ishlamay qolgani uchun odamning arizasi
 * yo'qolib ketmasligi kerak.
 */

const API = 'https://api.telegram.org';

/** Telegram javob bermasa shuncha kutiladi — forma muzlab qolmaydi */
const KUTISH_MS = 6000;

/**
 * Chat ID: avval admin paneldagi sozlama, u bo'sh bo'lsa muhit o'zgaruvchisi.
 *
 * Shu tartibda qilingani — qabul qiluvchini almashtirish uchun saytni qayta
 * joylash shart emas, admin paneldan o'zgartirilaveradi.
 */
async function chatId(): Promise<string> {
  try {
    const qator = await db.setting.findUnique({ where: { key: 'telegramChatId' } });
    const qiymat = String(qator?.value ?? '').trim();
    if (qiymat) return qiymat;
  } catch {
    // Baza javob bermadi — muhit o'zgaruvchisiga tushamiz
  }
  return (process.env.TELEGRAM_CHAT_ID ?? '').trim();
}

/** Admin paneldagi arizalar sahifasiga havola */
export function arizalarHavolasi(): string {
  const asos = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url).replace(/\/+$/, '');
  return `${asos}/admin/arizalar`;
}

/**
 * Xabarni yuboradi. Hech qachon xato tashlamaydi — natijani `boolean`
 * qilib qaytaradi, chaqiruvchi uni e'tiborsiz qoldirishi mumkin.
 */
export async function telegramYubor(matn: string): Promise<boolean> {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? '').trim();
  if (!token) return false;

  const chat = await chatId();
  if (!chat) return false;

  try {
    const javob = await fetch(`${API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: matn,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(KUTISH_MS),
      cache: 'no-store',
    });

    if (!javob.ok) {
      // Sozlamalar noto'g'ri bo'lsa (token eskirgan, chat topilmadi) —
      // jurnalga yoziladi, lekin ariza qabul qilinaveradi
      console.error('Telegram xabar yuborilmadi:', javob.status, await javob.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('Telegram xabar yuborilmadi:', e instanceof Error ? e.message : e);
    return false;
  }
}

/** Ariza haqidagi xabarni tayyorlab yuboradi */
export async function arizaXabari(sarlavha: string, qatorlar: Qator[]): Promise<void> {
  await telegramYubor(xabarMatni(sarlavha, qatorlar, arizalarHavolasi()));
}
