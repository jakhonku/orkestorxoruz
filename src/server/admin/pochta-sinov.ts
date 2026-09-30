'use server';

import { joriySessiya } from '@/server/auth';
import { bolimgaRuxsatmi } from './huquq';
import { pochtaYubor } from '@/server/xabarnoma/pochta';
import { telegramSozlanganmi, telegramYubor } from '@/server/xabarnoma/telegram';
import { getSettings } from '@/server/queries/settings';

/**
 * "Sinov xati" tugmasi.
 *
 * Sozlash ikki qismdan iborat (SMTP ma'lumotlari va qabul qiluvchi pochta) —
 * qaysi biri yetishmayotganini haqiqiy arizani kutmasdan bilib olish uchun.
 */

export type SinovNatija = { ok: true } | { ok: false; xato: string };

export async function pochtaSinov(): Promise<SinovNatija> {
  const sessiya = await joriySessiya();
  if (!sessiya) return { ok: false, xato: 'Ruxsat yo‘q. Qaytadan kiring.' };
  if (!bolimgaRuxsatmi(sessiya, 'sozlamalar')) return { ok: false, xato: 'Bu bo‘lim sizga ochiq emas.' };

  const smtpBor = Boolean((process.env.SMTP_USER ?? '').trim() && (process.env.SMTP_PASS ?? '').trim());
  const telegramBor = telegramSozlanganmi();

  if (!smtpBor && !telegramBor) {
    return {
      ok: false,
      xato:
        'Xabarnoma sozlanmagan. Vercel loyihasining "Settings → Environment Variables" ' +
        'bo‘limiga SMTP_USER va SMTP_PASS (Google "App password") yoki TELEGRAM_BOT_TOKEN va ' +
        'TELEGRAM_CHAT_ID qo‘shing va saytni qayta joylang.',
    };
  }

  const sozlamalar = await getSettings();
  const kimga = sozlamalar.notifyEmail.trim() || (process.env.SMTP_USER ?? '').trim();
  const qatorlar = [
    { yorliq: 'Holat', qiymat: 'Xabarnoma to‘g‘ri sozlangan' },
    { yorliq: 'Qabul qiluvchi', qiymat: kimga },
    { yorliq: 'Tekshirdi', qiymat: sessiya.email },
  ];

  // Har bir kanal alohida tekshiriladi — qaysi biri ishlamayotganini aniq aytish uchun
  const [pochtaOk, telegramOk] = await Promise.all([
    smtpBor ? pochtaYubor('✅ Sinov xati', qatorlar) : Promise.resolve(null),
    telegramBor ? telegramYubor('✅ Sinov xabari', qatorlar) : Promise.resolve(null),
  ]);

  const muammolar: string[] = [];
  if (pochtaOk === false) {
    muammolar.push(
      'Pochta: server xatni qabul qilmadi. Odatda "App password" noto‘g‘ri yoki eskirgan, ' +
        'Google hisobida ikki bosqichli tasdiqlash yoqilmagan yoki qabul qiluvchi manzil xato.',
    );
  }
  if (telegramOk === false) {
    muammolar.push(
      'Telegram: xabar ketmadi. Bot tokeni yoki chat ID noto‘g‘ri, yoki bot chatga qo‘shilmagan ' +
        '(avval botga /start yozing yoki uni guruhga qo‘shing).',
    );
  }
  if (muammolar.length > 0) {
    return {
      ok: false,
      xato: muammolar.join(' ') + ' Aniq sababi Vercel’dagi "Logs" bo‘limida ko‘rinadi.',
    };
  }

  return { ok: true };
}
