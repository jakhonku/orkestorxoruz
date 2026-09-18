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
import { HarakatSozlamalari } from '@/components/shared/harakat-sozlamalari';
import { getSettings } from '@/server/queries/settings';
import { getInternationalPages } from '@/server/queries/xalqaro';

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
 * Sahifalar build paytida tayyorlanadi (tez ochiladi) va keshlanadi.
 *
 * Admin panelda biror yozuv saqlansa, `revalidatePath('/', 'layout')`
 * chaqiriladi — kesh o'sha zahoti bekor qilinadi va keyingi so'rov bazadan
 * yangi ma'lumot bilan quriladi. Ya'ni tahrir darhol ko'rinadi.
 *
 * Quyidagi 60 soniya — faqat zaxira: kimdir ma'lumotni Supabase panelidan
 * to'g'ridan-to'g'ri o'zgartirsa (admin panelsiz), sayt shuncha vaqt ichida
 * o'zi yangilanadi.
 */
export const revalidate = 60;

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
  const [messages, settings, xalqaro] = await Promise.all([
    getMessages(),
    getSettings(),
    getInternationalPages(),
  ]);

  // Admin paneldan qo'shilgan sahifalar "Xalqaro" menyusiga ulanadi.
  // Sarlavha bazadan kelgani uchun joriy tilga shu yerda o'giriladi.
  const xalqaroHavolalar = xalqaro.map((p) => ({
    href: `/xalqaro/${p.slug}`,
    label: pick(p.title, locale),
  }));

  // Talent platformasi admin panelda yopilgan bo'lsa — menyuda ham,
  // footerda ham ko'rinmaydi (sahifasi 404 qaytaradi)
  const yashirinHavolalar = settings.talentOpen ? [] : ['/talent'];

  return (
    <html lang={locale} className={`${playfair.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <HarakatSozlamalari>
            <Header
              dinamikHavolalar={xalqaroHavolalar}
              yashirinHavolalar={yashirinHavolalar}
              logoNomi={settings.shortName}
              logoOstidagi={settings.logoSubline}
            />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} yashirinHavolalar={yashirinHavolalar} />
          </HarakatSozlamalari>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
