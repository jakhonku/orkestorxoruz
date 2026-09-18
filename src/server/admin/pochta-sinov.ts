'use server';

import { joriySessiya } from '@/server/auth';
import { pochtaYubor } from '@/server/xabarnoma/pochta';
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

  if (!(process.env.SMTP_USER ?? '').trim() || !(process.env.SMTP_PASS ?? '').trim()) {
    return {
      ok: false,
      xato:
        'SMTP_USER yoki SMTP_PASS qo‘yilmagan. Ularni Vercel loyihasining ' +
        '"Settings → Environment Variables" bo‘limiga qo‘shing (SMTP_PASS — Google ' +
        'hisobidagi 16 belgili "App password") va saytni qayta joylang.',
    };
  }

  const sozlamalar = await getSettings();
  const kimga = sozlamalar.notifyEmail.trim() || (process.env.SMTP_USER ?? '').trim();

  const yuborildi = await pochtaYubor('✅ Sinov xati', [
    { yorliq: 'Holat', qiymat: 'Pochta xabarnomasi to‘g‘ri sozlangan' },
    { yorliq: 'Qabul qiluvchi', qiymat: kimga },
    { yorliq: 'Tekshirdi', qiymat: sessiya.email },
  ]);

  if (!yuborildi) {
    return {
      ok: false,
      xato:
        'Pochta serveri xatni qabul qilmadi. Eng ko‘p uchraydigan sabablar: ' +
        '"App password" noto‘g‘ri yoki eskirgan, Google hisobida ikki bosqichli ' +
        'tasdiqlash yoqilmagan, yoki qabul qiluvchi manzil xato yozilgan. ' +
        'Aniq sababi Vercel’dagi "Logs" bo‘limida ko‘rinadi.',
    };
  }

  return { ok: true };
}
