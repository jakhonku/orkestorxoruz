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
import { getSettings } from '@/server/queries/settings';

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

/**
 * Sahifalar build paytida tayyorlanadi (tez ochiladi), lekin har 5 daqiqada
 * bazadan qayta o'qiladi. Ya'ni admin panelda kiritilgan o'zgarish saytni
 * qayta qurmasdan ham ko'rinadi.
 *
 * Keyinchalik admin panel qo'shilganda bu yerga "darhol yangilash"
 * (revalidatePath) qo'shiladi — o'shanda kutish ham kerak bo'lmaydi.
 */
export const revalidate = 300;

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
  const [messages, settings] = await Promise.all([getMessages(), getSettings()]);

  return (
    <html lang={locale} className={`${playfair.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
