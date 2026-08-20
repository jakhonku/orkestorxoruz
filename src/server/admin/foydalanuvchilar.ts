'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { joriySessiya } from '@/server/auth';

/**
 * Admin foydalanuvchilarni boshqarish. Faqat ADMIN roliga ruxsat beriladi —
 * muharrir kontentni tahrirlaydi, lekin yangi hisob ocholmaydi.
 *
 * Hisob ikki joyda yashaydi:
 *   Supabase Auth — email va parol (parol bazada saqlanmaydi)
 *   `admin_users` — ism, rol, faollik; `authUserId` orqali bog'lanadi
 */

export type Natija = { ok: true } | { ok: false; xato: string };

const ENG_QISQA_PAROL = 8;

async function adminSessiya() {
  const s = await joriySessiya();
  if (!s) throw new Error('Ruxsat yo‘q. Qaytadan kiring.');
  if (s.role !== 'ADMIN') throw new Error('Bu amal faqat administrator uchun.');
  return s;
}

function xatoBilan(e: unknown): Natija {
  const xabar = e instanceof Error ? e.message : String(e);
  if (xabar.includes('Unique constraint')) {
    return { ok: false, xato: 'Bu email allaqachon ro‘yxatdan o‘tgan.' };
  }
  return { ok: false, xato: xabar };
}

/** Supabase Auth'dagi hisobni email bo'yicha topadi (bog'lanmagan eski qaydlar uchun) */
async function authIdTopish(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return null;
  const topildi = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return topildi?.id ?? null;
}

export async function foydalanuvchiQoshish(formData: FormData): Promise<Natija> {
  try {
    await adminSessiya();

    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const name = String(formData.get('name') ?? '').trim();
    const parol = String(formData.get('parol') ?? '');
    const role = String(formData.get('role') ?? 'MUHARRIR') === 'ADMIN' ? 'ADMIN' : 'MUHARRIR';

    if (!email.includes('@')) return { ok: false, xato: 'Email noto‘g‘ri.' };
    if (!name) return { ok: false, xato: 'Ism to‘ldirilishi shart.' };
    if (parol.length < ENG_QISQA_PAROL) {
      return { ok: false, xato: `Parol kamida ${ENG_QISQA_PAROL} ta belgidan iborat bo‘lsin.` };
    }

    const bor = await db.adminUser.findUnique({ where: { email }, select: { id: true } });
    if (bor) return { ok: false, xato: 'Bu email allaqachon ro‘yxatdan o‘tgan.' };

    // Supabase'da hisob ochiladi. Email tasdiqlash so'ralmaydi — hisobni
    // administrator o'zi yaratayapti va parolni foydalanuvchiga beradi.
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: parol,
      email_confirm: true,
    });

    // Supabase'da shu email bilan hisob allaqachon bo'lsa — mavjudiga bog'lanamiz
    let authUserId = data?.user?.id ?? null;
    if (error) {
      authUserId = await authIdTopish(email);
      if (!authUserId) return { ok: false, xato: error.message };
      await supabase.auth.admin.updateUserById(authUserId, { password: parol });
    }

    await db.adminUser.create({ data: { email, name, role, authUserId } });

    revalidatePath('/admin/foydalanuvchilar');
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

export async function parolniOzgartirish(id: number, parol: string): Promise<Natija> {
  try {
    await adminSessiya();
    if (parol.length < ENG_QISQA_PAROL) {
      return { ok: false, xato: `Parol kamida ${ENG_QISQA_PAROL} ta belgidan iborat bo‘lsin.` };
    }

    const qayd = await db.adminUser.findUnique({
      where: { id },
      select: { email: true, authUserId: true },
    });
    if (!qayd) return { ok: false, xato: 'Foydalanuvchi topilmadi.' };

    const authUserId = qayd.authUserId ?? (await authIdTopish(qayd.email));
    if (!authUserId) {
      return { ok: false, xato: 'Supabase Auth’da bu hisob topilmadi.' };
    }

    const { error } = await supabaseAdmin().auth.admin.updateUserById(authUserId, {
      password: parol,
    });
    if (error) return { ok: false, xato: error.message };

    if (!qayd.authUserId) {
      await db.adminUser.update({ where: { id }, data: { authUserId } });
    }
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

export async function faollikAlmashtirish(id: number): Promise<Natija> {
  try {
    const sessiya = await adminSessiya();
    if (sessiya.userId === id) {
      return { ok: false, xato: 'O‘z hisobingizni bloklay olmaysiz.' };
    }

    const joriy = await db.adminUser.findUnique({ where: { id }, select: { active: true } });
    if (!joriy) return { ok: false, xato: 'Foydalanuvchi topilmadi.' };

    await db.adminUser.update({ where: { id }, data: { active: !joriy.active } });
    revalidatePath('/admin/foydalanuvchilar');
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

export async function rolniOzgartirish(id: number, admin: boolean): Promise<Natija> {
  try {
    const sessiya = await adminSessiya();
    if (sessiya.userId === id) {
      return { ok: false, xato: 'O‘z rolingizni o‘zgartira olmaysiz.' };
    }

    await db.adminUser.update({ where: { id }, data: { role: admin ? 'ADMIN' : 'MUHARRIR' } });
    revalidatePath('/admin/foydalanuvchilar');
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

export async function foydalanuvchiOchirish(id: number): Promise<Natija> {
  try {
    const sessiya = await adminSessiya();
    if (sessiya.userId === id) {
      return { ok: false, xato: 'O‘z hisobingizni o‘chira olmaysiz.' };
    }

    const adminlar = await db.adminUser.count({ where: { role: 'ADMIN', active: true } });
    const ochiriladigan = await db.adminUser.findUnique({
      where: { id },
      select: { role: true, active: true, email: true, authUserId: true },
    });
    if (!ochiriladigan) return { ok: false, xato: 'Foydalanuvchi topilmadi.' };
    if (ochiriladigan.role === 'ADMIN' && ochiriladigan.active && adminlar <= 1) {
      return { ok: false, xato: 'Kamida bitta faol administrator qolishi kerak.' };
    }

    await db.adminUser.delete({ where: { id } });

    // Supabase'dagi hisob ham o'chiriladi — aks holda kirish imkoni qolib ketadi
    const authUserId = ochiriladigan.authUserId ?? (await authIdTopish(ochiriladigan.email));
    if (authUserId) {
      await supabaseAdmin().auth.admin.deleteUser(authUserId);
    }

    revalidatePath('/admin/foydalanuvchilar');
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}
