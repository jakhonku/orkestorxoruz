import 'server-only';
import { notFound, redirect } from 'next/navigation';

import { joriySessiya, type Sessiya } from '@/server/auth';
import { TANLOV_ROLI_BOLIMLARI } from '@/app/admin/(panel)/_lib/bolimlar';

/**
 * Qaysi rol admin panelning qaysi boʻlimiga kira oladi.
 *
 *   ADMIN, MUHARRIR — hamma boʻlimga (foydalanuvchilar sahifasi faqat ADMIN)
 *   TANLOV          — faqat "Tanlov va festivallar" va "Tanlov arizalari"
 *
 * Yon menyuda keraksiz boʻlimlarni yashirish yetarli emas — manzilni qoʻlda
 * yozib ochish yoki amalni toʻgʻridan-toʻgʻri chaqirish mumkin. Shu sababli
 * sahifalar ham, server amallari ham shu yerdagi tekshiruvdan oʻtadi.
 */

export function bolimgaRuxsatmi(s: Pick<Sessiya, 'role'>, kalit: string): boolean {
  if (s.role !== 'TANLOV') return true;
  return TANLOV_ROLI_BOLIMLARI.includes(kalit);
}

/** Server amallari uchun: ruxsat boʻlmasa xato tashlaydi */
export async function bolimRuxsati(kalit: string): Promise<Sessiya> {
  const s = await joriySessiya();
  if (!s) throw new Error('Ruxsat yoʻq. Qaytadan kiring.');
  if (!bolimgaRuxsatmi(s, kalit)) throw new Error('Bu boʻlim sizga ochiq emas.');
  return s;
}

/** Sahifalar uchun: ruxsat boʻlmasa boʻlim umuman yoʻqdek koʻrinadi */
export async function sahifaRuxsati(kalit: string): Promise<Sessiya> {
  const s = await joriySessiya();
  if (!s) redirect('/admin/kirish');
  if (!bolimgaRuxsatmi(s, kalit)) notFound();
  return s;
}
