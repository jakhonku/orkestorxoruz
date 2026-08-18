import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import { YonMenyu } from './_components/yon-menyu';

/** Admin panel hech qachon keshlanmaydi — har doim bazadan o'qiydi */
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const sessiya = await joriySessiya();
  if (!sessiya) redirect('/admin/kirish');

  // Yon menyudagi "yangi arizalar" belgisi uchun
  const [xabar, jamoa, tanlov, talent] = await Promise.all([
    db.contactMessage.count({ where: { status: 'YANGI' } }),
    db.ensembleApplication.count({ where: { status: 'YANGI' } }),
    db.competitionApplication.count({ where: { status: 'YANGI' } }),
    db.talentApplication.count({ where: { status: 'YANGI' } }),
  ]);

  return (
    <div className="min-h-screen bg-navy-50/30">
      <YonMenyu
        foydalanuvchi={{ name: sessiya.name, email: sessiya.email }}
        adminMi={sessiya.role === 'ADMIN'}
        yangiArizalar={xabar + jamoa + tanlov + talent}
      />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-5xl px-4 py-8 pt-16 sm:px-6 lg:px-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
