import 'server-only';
import { notFound, redirect } from 'next/navigation';

import { joriySessiya, type Sessiya } from '@/server/auth';
import { TANLOV_ROLI_BOLIMLARI } from '@/app/admin/(panel)/_lib/bolimlar';

/**
 * Qaysi rol admin panelning qaysi bo'limiga kira oladi.
 *
 *   ADMIN, MUHARRIR — hamma bo'limga (foydalanuvchilar sahifasi faqat ADMIN)
 *   TANLOV          — faqat "Tanlov va festivallar" va "Tanlov arizalari"
 *
 * Yon menyuda keraksiz bo'limlarni yashirish yetarli emas — manzilni qo'lda
 * yozib ochish yoki amalni to'g'ridan-to'g'ri chaqirish mumkin. Shu sababli
 * sahifalar ham, server amallari ham shu yerdagi tekshiruvdan o'tadi.
 */

export function bolimgaRuxsatmi(s: Pick<Sessiya, 'role'>, kalit: string): boolean {
  if (s.role !== 'TANLOV') return true;
  return TANLOV_ROLI_BOLIMLARI.includes(kalit);
}

/** Server amallari uchun: ruxsat bo'lmasa xato tashlaydi */
export async function bolimRuxsati(kalit: string): Promise<Sessiya> {
  const s = await joriySessiya();
  if (!s) throw new Error('Ruxsat yo‘q. Qaytadan kiring.');
  if (!bolimgaRuxsatmi(s, kalit)) throw new Error('Bu bo‘lim sizga ochiq emas.');
  return s;
}

/** Sahifalar uchun: ruxsat bo'lmasa bo'lim umuman yo'qdek ko'rinadi */
export async function sahifaRuxsati(kalit: string): Promise<Sessiya> {
  const s = await joriySessiya();
  if (!s) redirect('/admin/kirish');
  if (!bolimgaRuxsatmi(s, kalit)) notFound();
  return s;
}
