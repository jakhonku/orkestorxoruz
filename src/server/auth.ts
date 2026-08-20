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
 * `authUserId` orqali bog'lanadi.
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
 * Joriy sessiya. Kirilmagan yoki hisob bloklangan bo'lsa — null.
 * `cache()` — bitta so'rov ichida bir marta hisoblanadi.
 */
export const joriySessiya = cache(async (): Promise<Sessiya | null> => {
  const supabase = supabaseServer();

  // getUser() tokenni Supabase serverida tekshiradi (getSession() dan xavfsizroq)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const email = (user.email ?? '').trim().toLowerCase();

  const qayd = await db.adminUser.findFirst({
    where: { OR: [{ authUserId: user.id }, ...(email ? [{ email }] : [])] },
    select: { id: true, email: true, name: true, role: true, active: true, authUserId: true },
  });

  // Supabase'da hisob bor, lekin panelga ruxsat berilmagan — kirish yo'q
  if (!qayd || !qayd.active) return null;

  // Email bo'yicha topilgan bo'lsa, keyingi safarlar uchun bog'lab qo'yiladi
  if (qayd.authUserId !== user.id) {
    try {
      await db.adminUser.update({ where: { id: qayd.id }, data: { authUserId: user.id } });
    } catch {
      // Boshqa qayd allaqachon shu uuid'ga bog'langan — jimgina o'tkazib yuboriladi
    }
  }

  return {
    userId: qayd.id,
    authId: user.id,
    email: qayd.email,
    name: qayd.name,
    role: qayd.role,
  };
});

/** Faqat ADMIN bajarishi mumkin bo'lgan amallar uchun */
export async function adminMi(): Promise<boolean> {
  const s = await joriySessiya();
  return s?.role === 'ADMIN';
}
