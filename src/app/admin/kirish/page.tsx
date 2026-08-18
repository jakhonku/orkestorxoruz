import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { joriySessiya } from '@/server/auth';
import { KirishFormasi } from './kirish-formasi';

export const metadata: Metadata = {
  title: 'Kirish — Boshqaruv paneli',
  robots: { index: false, follow: false },
};

export default async function KirishSahifasi() {
  if (await joriySessiya()) redirect('/admin');

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Orkestr va Xor
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-navy">Boshqaruv paneli</h1>
          <p className="mt-2 text-sm text-muted-foreground">Davom etish uchun tizimga kiring</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft-lg">
          <KirishFormasi />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Parolni unutdingizmi? Tizim administratoriga murojaat qiling.
        </p>
      </div>
    </div>
  );
}
