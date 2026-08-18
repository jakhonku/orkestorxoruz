import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Playfair_Display, Manrope } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
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

/** Admin panel ko'p tilli emas — interfeys faqat o'zbek tilida */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
