import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Unbounded, Manrope } from 'next/font/google';

import { ADMIN_TIL_KUKISI, adminTilOl } from '@/lib/admin-tarjima';
import { AdminTarjimon } from './_tarjima/tarjimon';

const brand = Unbounded({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-brand',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Boshqaruv paneli', template: '%s — Boshqaruv paneli' },
  robots: { index: false, follow: false },
};

/**
 * Admin panel ikki tilli: o'zbekcha (asosiy) va ruscha. Til `admin-til`
 * cookie'sida turadi va yon menyudagi UZ / RU tugmasi bilan almashtiriladi.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const til = adminTilOl(cookies().get(ADMIN_TIL_KUKISI)?.value);

  return (
    <html lang={til} data-til={til} className={`${brand.variable} ${manrope.variable}`}>
      <head>
        {til === 'ru' && (
          // Tarjima tayyor bo'lguncha sahifa yashirin — o'zbekcha matn "yaltirab" qolmasin.
          // Skript ishlamasa ham 2 soniyadan keyin sahifa ochiladi.
          <style>{`
            html[data-til="ru"]:not([data-tarjima]) body { opacity: 0; animation: admin-korsat 0s 2s forwards; }
            @keyframes admin-korsat { to { opacity: 1; } }
          `}</style>
        )}
      </head>
      <body className="font-sans antialiased">
        {children}
        {til === 'ru' && <AdminTarjimon />}
      </body>
    </html>
  );
}
