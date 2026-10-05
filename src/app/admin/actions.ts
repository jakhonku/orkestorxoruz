'use server';

import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { supabaseServer } from '@/lib/supabase/server';

export type KirishHolati = { xato?: string };

/**
 * Admin panelga kirish.
 *
 * Parolni Supabase Auth tekshiradi; sessiya cookieʼni `@supabase/ssr` oʻzi
 * yozadi. Panelga ruxsat esa `admin_users` jadvalidagi qaydga bogʻliq —
 * Supabaseʼda hisobi boʻlsa ham, jadvalda faol qaydi yoʻq odam kira olmaydi.
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
    select: { id: true, active: true, authUserId: true },
  });
  if (!qayd || !qayd.active) {
    return { xato: 'Email yoki parol notoʻgʻri.' };
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parol });

  if (error || !data.user) {
    return { xato: 'Email yoki parol notoʻgʻri.' };
  }

  // Qayd boshqa Supabase hisobiga bogʻlangan boʻlsa — kirishga ruxsat yoʻq.
  // Bogʻlanish faqat bir marta, birinchi kirishda oʻrnatiladi.
  if (qayd.authUserId && qayd.authUserId !== data.user.id) {
    await supabase.auth.signOut();
    return { xato: 'Bu hisob boshqa foydalanuvchiga bogʻlangan. Administratorga murojaat qiling.' };
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
