'use server';

import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { supabaseServer } from '@/lib/supabase/server';

export type KirishHolati = { xato?: string };

/**
 * Admin panelga kirish.
 *
 * Parolni Supabase Auth tekshiradi; sessiya cookie'ni `@supabase/ssr` o'zi
 * yozadi. Panelga ruxsat esa `admin_users` jadvalidagi qaydga bog'liq —
 * Supabase'da hisobi bo'lsa ham, jadvalda faol qaydi yo'q odam kira olmaydi.
 */
export async function kirish(_avvalgi: KirishHolati, formData: FormData): Promise<KirishHolati> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const parol = String(formData.get('parol') ?? '');

  if (!email || !parol) {
    return { xato: 'Email va parolni kiriting.' };
  }

  const qayd = await db.adminUser.findUnique({
    where: { email },
    select: { id: true, active: true },
  });
  if (!qayd || !qayd.active) {
    return { xato: 'Email yoki parol noto‘g‘ri.' };
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parol });

  if (error || !data.user) {
    return { xato: 'Email yoki parol noto‘g‘ri.' };
  }

  await db.adminUser.update({
    where: { id: qayd.id },
    data: { lastLoginAt: new Date(), authUserId: data.user.id },
  });

  redirect('/admin');
}

export async function chiqish() {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/kirish');
}
