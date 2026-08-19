import { notFound } from 'next/navigation';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import { FoydalanuvchilarRoyxati } from './foydalanuvchilar-royxati';

export const metadata = { title: 'Foydalanuvchilar' };

export default async function FoydalanuvchilarSahifasi() {
  const sessiya = await joriySessiya();
  // Muharrir bu sahifani ochsa — bo'lim umuman yo'qdek ko'rinadi
  if (sessiya?.role !== 'ADMIN') notFound();

  const royxat = await db.adminUser.findMany({ orderBy: [{ role: 'asc' }, { name: 'asc' }] });

  return (
    <FoydalanuvchilarRoyxati
      meniId={sessiya.userId}
      foydalanuvchilar={royxat.map((f) => ({
        id: f.id,
        email: f.email,
        name: f.name,
        admin: f.role === 'ADMIN',
        faol: f.active,
        oxirgiKirish: f.lastLoginAt ? f.lastLoginAt.toISOString().slice(0, 10) : null,
      }))}
    />
  );
}
