'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { sessiyaOchirish, sessiyaOrnatish } from '@/server/auth';

export type KirishHolati = { xato?: string };

export async function kirish(_avvalgi: KirishHolati, formData: FormData): Promise<KirishHolati> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const parol = String(formData.get('parol') ?? '');

  if (!email || !parol) {
    return { xato: 'Email va parolni kiriting.' };
  }

  const user = await db.adminUser.findUnique({ where: { email } });

  // Foydalanuvchi topilmasa ham bcrypt chaqiriladi — javob vaqti bir xil bo'lishi uchun
  const soxta = '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi';
  const togri = await bcrypt.compare(parol, user?.passwordHash ?? soxta);

  if (!user || !user.active || !togri) {
    return { xato: 'Email yoki parol noto‘g‘ri.' };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  sessiyaOrnatish(user);
  redirect('/admin');
}

export async function chiqish() {
  sessiyaOchirish();
  redirect('/admin/kirish');
}
