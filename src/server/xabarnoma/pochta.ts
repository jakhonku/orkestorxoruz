import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';

import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';
import { xabarHtml, xabarMatni, type Qator } from './matn';

/**
 * Yangi ariza kelganda pochtaga xabar yuboradi (Gmail SMTP).
 *
 * Ikkita sozlama kerak:
 *   SMTP_USER / SMTP_PASS — muhit o'zgaruvchilari: Gmail manzili va Google
 *                            hisobidan olingan 16 belgili "App password"
 *                            (oddiy parol emas!)
 *   Xabarnoma pochtasi     — admin panelda "Sozlamalar" da; bo'sh bo'lsa
 *                            xat SMTP_USER ning o'ziga boradi
 *
 * MUHIM: xat ketmasa ham ariza baribir saqlanadi — bu yerdagi hech bir
 * xato yuqoriga chiqmaydi.
 */

/** Pochta serveri javob bermasa shuncha kutiladi — forma muzlab qolmaydi */
const KUTISH_MS = 10_000;

function sozlamalar() {
  return {
    user: (process.env.SMTP_USER ?? '').trim(),
    pass: (process.env.SMTP_PASS ?? '').replace(/\s+/g, ''),
    host: (process.env.SMTP_HOST ?? 'smtp.gmail.com').trim(),
    port: Number(process.env.SMTP_PORT ?? 465),
  };
}

/** Ulanish bir marta yasaladi va qayta ishlatiladi */
let ulanish: Transporter | null = null;

function transport(): Transporter | null {
  const s = sozlamalar();
  if (!s.user || !s.pass) return null;

  if (!ulanish) {
    ulanish = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.port === 465,
      auth: { user: s.user, pass: s.pass },
      connectionTimeout: KUTISH_MS,
      greetingTimeout: KUTISH_MS,
      socketTimeout: KUTISH_MS,
    });
  }

  return ulanish;
}

/**
 * Qabul qiluvchilar: avval admin paneldagi sozlama, u bo'sh bo'lsa
 * xat yuborayotgan pochtaning o'zi.
 */
async function qabulQiluvchilar(): Promise<string[]> {
  let xom = '';

  try {
    const qator = await db.setting.findUnique({ where: { key: 'notifyEmail' } });
    xom = String(qator?.value ?? '').trim();
  } catch {
    // Baza javob bermadi — pastdagi zaxiraga tushamiz
  }

  if (!xom) xom = sozlamalar().user;

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
 * Xatni yuboradi. Hech qachon xato tashlamaydi — natijani `boolean`
 * qilib qaytaradi.
 */
export async function pochtaYubor(sarlavha: string, qatorlar: Qator[]): Promise<boolean> {
  try {
    const yuboruvchi = transport();
    if (!yuboruvchi) return false;

    const kimga = await qabulQiluvchilar();
    if (kimga.length === 0) return false;

    const havola = arizalarHavolasi();

    await yuboruvchi.sendMail({
      from: `"Orkestr va Xor sayti" <${sozlamalar().user}>`,
      to: kimga.join(', '),
      subject: sarlavha,
      text: xabarMatni(sarlavha, qatorlar, havola),
      html: xabarHtml(sarlavha, qatorlar, havola),
    });

    return true;
  } catch (e) {
    console.error('Pochta xabarnomasi yuborilmadi:', e instanceof Error ? e.message : e);
    return false;
  }
}

/** Ariza haqidagi xabarni tayyorlab yuboradi */
export async function arizaXabari(sarlavha: string, qatorlar: Qator[]): Promise<boolean> {
  return pochtaYubor(sarlavha, qatorlar);
}
