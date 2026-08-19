'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';

/**
 * Admin foydalanuvchilarni boshqarish. Faqat ADMIN roliga ruxsat beriladi —
 * muharrir kontentni tahrirlaydi, lekin yangi hisob ocholmaydi.
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

    await db.adminUser.create({
      data: { email, name, role, passwordHash: await bcrypt.hash(parol, 10) },
    });

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

    await db.adminUser.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(parol, 10) },
    });
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
      select: { role: true, active: true },
    });
    if (ochiriladigan?.role === 'ADMIN' && ochiriladigan.active && adminlar <= 1) {
      return { ok: false, xato: 'Kamida bitta faol administrator qolishi kerak.' };
    }

    await db.adminUser.delete({ where: { id } });
    revalidatePath('/admin/foydalanuvchilar');
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}
