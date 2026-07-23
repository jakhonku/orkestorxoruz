import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Playfair_Display, Manrope } from 'next/font/google';
import { routing, type Locale } from '@/i18n/routing';
import { SITE } from '@/lib/constants';
import { pick } from '@/lib/utils';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Meta' });
  const title = t('title');
  const description = t('description');
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s · ${pick(SITE.shortName, params.locale)}`,
    },
    description,
    openGraph: {
      title,
      description,
      url: SITE.url,
      siteName: pick(SITE.name, params.locale),
      locale: params.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        uz: '/uz',
        ru: '/ru',
        en: '/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  if (!routing.locales.includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${playfair.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
