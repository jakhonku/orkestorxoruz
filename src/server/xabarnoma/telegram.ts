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
async function chatIdlar(): Promise<string[]> {
  let xom = '';

  try {
    const qator = await db.setting.findUnique({ where: { key: 'telegramChatId' } });
    xom = String(qator?.value ?? '').trim();
  } catch {
    // Baza javob bermadi — muhit o'zgaruvchisiga tushamiz
  }

  if (!xom) xom = (process.env.TELEGRAM_CHAT_ID ?? '').trim();

  // Vergul yoki bo'sh joy bilan ajratilgan bir nechta chat bo'lishi mumkin —
  // masalan rahbar va kotib bir vaqtda xabar olsin
  return xom
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
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

  const chatlar = await chatIdlar();
  if (chatlar.length === 0) return false;

  /** Bitta chatga yuborish — xatosi shu yerda yutiladi */
  const bittaga = async (chat: string): Promise<boolean> => {
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
        console.error(`Telegram (${chat}) xabarni qabul qilmadi:`, javob.status, await javob.text());
        return false;
      }
      return true;
    } catch (e) {
      console.error(`Telegram (${chat}) xabar yuborilmadi:`, e instanceof Error ? e.message : e);
      return false;
    }
  };

  // Bir chat ishlamay qolsa ham qolganlariga xabar boradi
  const natijalar = await Promise.all(chatlar.map(bittaga));
  return natijalar.some(Boolean);
}

/**
 * Ariza haqidagi xabarni tayyorlab yuboradi.
 *
 * Butun tanasi `try` ichida: xabarnomadagi hech qanday nosozlik yuqoriga
 * chiqmaydi. Ariza allaqachon bazaga yozilgan bo'ladi — xabar bormagani
 * uchun odamga "yuborib bo'lmadi" deyish noto'g'ri bo'lardi.
 */
export async function arizaXabari(sarlavha: string, qatorlar: Qator[]): Promise<boolean> {
  try {
    return await telegramYubor(xabarMatni(sarlavha, qatorlar, arizalarHavolasi()));
  } catch (e) {
    console.error('Telegram xabarnomasi yuborilmadi:', e instanceof Error ? e.message : e);
    return false;
  }
}
