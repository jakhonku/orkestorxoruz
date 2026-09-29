import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import { YonMenyu } from './_components/yon-menyu';

/** Admin panel hech qachon keshlanmaydi — har doim bazadan o'qiydi */
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  // Ikkalasi birdan so‘raladi — biri ikkinchisini kutib turmaydi
  const [sessiya, yangi] = await Promise.all([joriySessiya(), yangiArizalarSoni()]);
  if (!sessiya) redirect('/admin/kirish');

  return (
    <div className="min-h-screen bg-navy-50/30">
      <YonMenyu
        foydalanuvchi={{ name: sessiya.name, email: sessiya.email }}
        rol={sessiya.role}
        belgilar={{ arizalar: yangi.jami, 'tanlov-arizalari': yangi.tanlov }}
      />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-5xl px-4 py-8 pt-16 sm:px-6 lg:px-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}

/**
 * Yon menyudagi "yangi arizalar" belgisi.
 *
 * To‘rtta jadval bitta so‘rovda sanaladi: admin paneldagi HAR BIR sahifa shu
 * raqamni oladi, to‘rtta alohida so‘rov esa bazaga to‘rt marta borib kelish
 * degani edi.
 */
async function yangiArizalarSoni(): Promise<{ jami: number; tanlov: number }> {
  const [qator] = await db.$queryRaw<{ boshqa: bigint; tanlov: bigint }[]>`
    select
      (select count(*) from contact_messages where status = 'YANGI')
      + (select count(*) from ensemble_applications where status = 'YANGI')
      + (select count(*) from talent_applications where status = 'YANGI') as boshqa,
      (select count(*) from competition_applications where status = 'YANGI') as tanlov
  `;
  const tanlov = Number(qator?.tanlov ?? 0);
  return { jami: Number(qator?.boshqa ?? 0) + tanlov, tanlov };
}
