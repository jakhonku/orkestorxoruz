import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import { supabaseServer } from '@/lib/supabase/server';
import type { AdminRole } from '@/generated/prisma/enums';

/**
 * Admin panel sessiyasi.
 *
 * Kirish/chiqish va parol tekshiruvi — Supabase Auth zimmasida.
 * Rol (ADMIN / MUHARRIR) va faollik esa bazadagi `admin_users` jadvalida
 * saqlanadi: Supabase foydalanuvchisi shu jadvaldagi qayd bilan
 * `authUserId` orqali bogʻlanadi.
 */

export type Sessiya = {
  /** `admin_users.id` — panel ichidagi havolalar shu raqamga tayanadi */
  userId: number;
  /** Supabase Auth foydalanuvchisi (uuid) */
  authId: string;
  email: string;
  name: string;
  role: AdminRole;
};

/**
 * Joriy sessiya. Kirilmagan yoki hisob bloklangan boʻlsa — null.
 * `cache()` — bitta soʻrov ichida bir marta hisoblanadi.
 */
export const joriySessiya = cache(async (): Promise<Sessiya | null> => {
  const supabase = supabaseServer();

  /**
   * Token imzosi mahalliy tekshiriladi (`getClaims`) — Supabase serveriga
   * soʻrov ketmaydi. Cookieʼni oʻzgartirib qoʻyish foyda bermaydi: imzo
   * loyihaning ochiq kaliti bilan tekshiriladi, soxta token oʻtmaydi.
   *
   * Hisob bloklangani esa quyida — har soʻrovda bazadan oʻqiladi, yaʼni
   * huquqni olib qoʻyish darhol kuchga kiradi.
   */
  const { data: dalil } = await supabase.auth.getClaims();
  const authId = dalil?.claims?.sub;
  if (!authId) return null;

  /**
   * Qayd FAQAT `authUserId` boʻyicha topiladi — email boʻyicha emas.
   *
   * Aks holda Supabaseʼda oʻzi roʻyxatdan oʻtgan odam, agar uning emaili
   * `admin_users` dagi biror qatorga toʻgʻri kelib qolsa, oʻsha qatorning
   * huquqlarini olib qoʻlardi. Bogʻlanish faqat kirish paytida, parol
   * tekshirilgandan keyin oʻrnatiladi (`src/app/admin/actions.ts`).
   */
  const qayd = await db.adminUser.findUnique({
    where: { authUserId: authId },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  // Supabaseʼda hisob bor, lekin panelga ruxsat berilmagan — kirish yoʻq
  if (!qayd || !qayd.active) return null;

  return {
    userId: qayd.id,
    authId,
    email: qayd.email,
    name: qayd.name,
    role: qayd.role,
  };
});

/** Faqat ADMIN bajarishi mumkin boʻlgan amallar uchun */
export async function adminMi(): Promise<boolean> {
  const s = await joriySessiya();
  return s?.role === 'ADMIN';
}
