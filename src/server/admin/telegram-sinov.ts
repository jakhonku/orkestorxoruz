'use server';

import { joriySessiya } from '@/server/auth';
import { arizalarHavolasi, telegramYubor } from '@/server/xabarnoma/telegram';
import { xabarMatni } from '@/server/xabarnoma/matn';
import { getSettings } from '@/server/queries/settings';

/**
 * "Sinov xabari" tugmasi.
 *
 * Sozlash uch qismdan iborat (bot tokeni, chat ID, botga /start bosilgani) —
 * qaysi biri yetishmayotganini haqiqiy ariza kutmasdan bilib olish uchun.
 */

export type SinovNatija = { ok: true } | { ok: false; xato: string };

export async function telegramSinov(): Promise<SinovNatija> {
  const sessiya = await joriySessiya();
  if (!sessiya) return { ok: false, xato: 'Ruxsat yo‘q. Qaytadan kiring.' };

  if (!(process.env.TELEGRAM_BOT_TOKEN ?? '').trim()) {
    return {
      ok: false,
      xato:
        'TELEGRAM_BOT_TOKEN qo‘yilmagan. Uni Vercel loyihasining ' +
        '"Settings → Environment Variables" bo‘limiga qo‘shing va saytni qayta joylang.',
    };
  }

  const sozlamalar = await getSettings();
  if (!sozlamalar.telegramChatId.trim()) {
    return {
      ok: false,
      xato: 'Yuqoridagi "Telegram chat ID" maydoni bo‘sh. To‘ldirib, avval Saqlang.',
    };
  }

  const yuborildi = await telegramYubor(
    xabarMatni(
      '✅ Sinov xabari',
      [
        { yorliq: 'Holat', qiymat: 'Telegram xabarnomasi to‘g‘ri sozlangan' },
        { yorliq: 'Tekshirdi', qiymat: sessiya.email },
      ],
      arizalarHavolasi(),
    ),
  );

  if (!yuborildi) {
    return {
      ok: false,
      xato:
        'Telegram xabarni qabul qilmadi. Eng ko‘p uchraydigan sabablar: chat ID xato, ' +
        'yoki botga hali /start bosilmagan (guruhda — bot guruhga qo‘shilmagan).',
    };
  }

  return { ok: true };
}
