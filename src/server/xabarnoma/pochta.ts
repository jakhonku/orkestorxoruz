import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';

import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';
import { xabarHtml, xabarMatni, type Qator } from './matn';
import { telegramYubor } from './telegram';

/**
 * Yangi ariza kelganda pochtaga xabar yuboradi (Gmail SMTP). Telegram bot ham ulangan
 * boʻlsa (`telegram.ts`), xabar u yerga ham boradi.
 *
 * Ikkita sozlama kerak:
 *   SMTP_USER / SMTP_PASS — muhit oʻzgaruvchilari: Gmail manzili va Google
 *                            hisobidan olingan 16 belgili "App password"
 *                            (oddiy parol emas!)
 *   Xabarnoma pochtasi     — admin panelda "Sozlamalar" da; boʻsh boʻlsa
 *                            xat SMTP_USER ning oʻziga boradi
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
 * Qabul qiluvchilar: avval admin paneldagi sozlama, u boʻsh boʻlsa
 * xat yuborayotgan pochtaning oʻzi.
 */
async function qabulQiluvchilar(oziniki?: string | null): Promise<string[]> {
  // Masalan tanlovning oʻz emaili — u bor boʻlsa umumiy sozlama oʻrniga shu ishlatiladi
  let xom = String(oziniki ?? '').trim();

  if (!xom) {
    try {
      const qator = await db.setting.findUnique({ where: { key: 'notifyEmail' } });
      xom = String(qator?.value ?? '').trim();
    } catch {
      // Baza javob bermadi — pastdagi zaxiraga tushamiz
    }
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
export async function pochtaYubor(
  sarlavha: string,
  qatorlar: Qator[],
  kimgaOzi?: string | null,
): Promise<boolean> {
  try {
    const yuboruvchi = transport();
    if (!yuboruvchi) return false;

    const kimga = await qabulQiluvchilar(kimgaOzi);
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
export async function arizaXabari(
  sarlavha: string,
  qatorlar: Qator[],
  kimgaOzi?: string | null,
): Promise<boolean> {
  // Ikkala kanal bir-biriga bogʻliq emas: biri ishlamasa ikkinchisi baribir yuboradi
  const [pochta, telegram] = await Promise.all([
    pochtaYubor(sarlavha, qatorlar, kimgaOzi),
    telegramYubor(sarlavha, qatorlar),
  ]);
  return pochta || telegram;
}
