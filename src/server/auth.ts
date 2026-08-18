import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { AdminRole } from '@/generated/prisma/enums';

const COOKIE = 'admin_session';
/** Sessiya amal qilish muddati — 7 kun */
const MUDDAT_MS = 7 * 24 * 60 * 60 * 1000;

export type Sessiya = {
  userId: number;
  email: string;
  name: string;
  role: AdminRole;
  exp: number;
};

function kalit(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      'AUTH_SECRET o‘rnatilmagan yoki juda qisqa. `.env` fayliga uzun tasodifiy satr qo‘shing.',
    );
  }
  return s;
}

function imzo(data: string): string {
  return createHmac('sha256', kalit()).update(data).digest('base64url');
}

/** Sessiyani imzolangan matnga aylantiradi: <payload>.<imzo> */
function yigish(s: Sessiya): string {
  const payload = Buffer.from(JSON.stringify(s)).toString('base64url');
  return `${payload}.${imzo(payload)}`;
}

/** Imzolangan matnni tekshiradi va sessiyani qaytaradi (yaroqsiz bo'lsa null) */
function ochish(token: string): Sessiya | null {
  const [payload, berilgan] = token.split('.');
  if (!payload || !berilgan) return null;

  const kutilgan = imzo(payload);
  const a = Buffer.from(berilgan);
  const b = Buffer.from(kutilgan);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Sessiya;
    if (typeof s.exp !== 'number' || s.exp < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

/** Kirish muvaffaqiyatli bo'lgandan keyin cookie o'rnatadi */
export function sessiyaOrnatish(user: {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
}) {
  const s: Sessiya = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + MUDDAT_MS,
  };

  cookies().set(COOKIE, yigish(s), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MUDDAT_MS / 1000,
  });
}

export function sessiyaOchirish() {
  cookies().delete(COOKIE);
}

/**
 * Joriy sessiya. Kirilmagan bo'lsa null.
 * `cache()` — bitta so'rov ichida bir marta hisoblanadi.
 */
export const joriySessiya = cache(async (): Promise<Sessiya | null> => {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;

  const s = ochish(token);
  if (!s) return null;

  // Foydalanuvchi o'chirilgan yoki bloklangan bo'lishi mumkin — bazadan tekshiriladi
  const user = await db.adminUser.findUnique({
    where: { id: s.userId },
    select: { id: true, active: true },
  });
  if (!user?.active) return null;

  return s;
});

/** Faqat ADMIN bajarishi mumkin bo'lgan amallar uchun */
export async function adminMi(): Promise<boolean> {
  const s = await joriySessiya();
  return s?.role === 'ADMIN';
}
