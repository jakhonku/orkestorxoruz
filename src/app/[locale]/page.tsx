import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Hero } from '@/components/sections/hero';
import { KpiStats } from '@/components/sections/kpi-stats';
import { UpcomingEvents } from '@/components/sections/upcoming-events';
import { Directions } from '@/components/sections/directions';
import { NewsSection } from '@/components/sections/news-section';
import { Partners } from '@/components/sections/partners';
import { MapSection } from '@/components/sections/map-section';
import { getKpiStats, getPartners, getStrategySlides } from '@/server/queries/home';
import { getUpcomingEvents } from '@/server/queries/events';
import { getLatestNews } from '@/server/queries/news';
import { getSettings } from '@/server/queries/settings';
import { pick } from '@/lib/utils';
import { SITE } from '@/lib/constants';
import { sahifaAlternates } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Meta' });
  const title = t('homeTitle');
  const description = t('homeDescription');
  return {
    // Shablon (`· Orkestr va Xor`) qoʻshilmasin — sarlavha toʻliq shu holda chiqadi
    title: { absolute: title },
    description,
    alternates: sahifaAlternates(params.locale),
    openGraph: { title, description, url: `/${params.locale}` },
    twitter: { title, description },
  };
}

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  // Bosh sahifadagi barcha bloklar uchun maʼlumot — parallel olinadi
  const t = await getTranslations({ locale: params.locale, namespace: 'Meta' });
  const [slides, stats, events, articles, partners, settings] = await Promise.all([
    getStrategySlides(),
    getKpiStats(),
    getUpcomingEvents(3),
    getLatestNews(3),
    getPartners(),
    getSettings(),
  ]);

  // Hero mijoz komponenti — matnlar shu yerda joriy tilga oʻgiriladi
  const heroSlides = slides.map((s) => ({
    tag: pick(s.tag, params.locale),
    title: pick(s.title, params.locale),
    text: pick(s.text, params.locale),
    points: pick(s.points, params.locale),
    image: s.image,
  }));

  // Google uchun tashkilot haqida strukturali maʼlumot (Organization)
  const tashkilot = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: t('orgName'),
    alternateName: ['CAOC', ...Object.values(settings.name)].filter(Boolean),
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    email: settings.email,
    telephone: settings.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pick(settings.address, params.locale),
      addressCountry: 'UZ',
    },
    sameAs: settings.socials.map((s) => s.url).filter((u) => /^https?:\/\//.test(u)),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tashkilot).replace(/</g, '\\u003c') }}
      />
      <Hero slides={heroSlides} heading={t('orgName')} />
      {/*
        "Raqamlarda birlashma" bloki ikki shartda chiqadi:
        sozlamalarda yoqilgan boʻlsa VA kamida bitta ochiq koʻrsatkich boʻlsa.
        Shu sababli boʻsh sarlavhali blok sahifada osilib qolmaydi.
      */}
      {settings.showKpi && stats.length > 0 && <KpiStats stats={stats} />}
      <UpcomingEvents events={events} />
      <Directions yashirinHavolalar={[
          ...(settings.talentOpen ? [] : ['/talent']),
          ...(settings.tanlovOpen ? [] : ['/loyihalar#tanlovlar']),
        ]} />
      <NewsSection articles={articles} />
      {partners.length > 0 && <Partners partners={partners} />}
      <MapSection settings={settings} />
    </>
  );
}
