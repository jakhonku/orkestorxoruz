import { setRequestLocale } from 'next-intl/server';
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

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  // Bosh sahifadagi barcha bloklar uchun ma'lumot — parallel olinadi
  const [slides, stats, events, articles, partners, settings] = await Promise.all([
    getStrategySlides(),
    getKpiStats(),
    getUpcomingEvents(3),
    getLatestNews(3),
    getPartners(),
    getSettings(),
  ]);

  // Hero mijoz komponenti — matnlar shu yerda joriy tilga o'giriladi
  const heroSlides = slides.map((s) => ({
    tag: pick(s.tag, params.locale),
    title: pick(s.title, params.locale),
    text: pick(s.text, params.locale),
    points: pick(s.points, params.locale),
    image: s.image,
  }));

  return (
    <>
      <Hero slides={heroSlides} />
      {/*
        "Raqamlarda birlashma" bloki ikki shartda chiqadi:
        sozlamalarda yoqilgan bo'lsa VA kamida bitta ochiq ko'rsatkich bo'lsa.
        Shu sababli bo'sh sarlavhali blok sahifada osilib qolmaydi.
      */}
      {settings.showKpi && stats.length > 0 && <KpiStats stats={stats} />}
      <UpcomingEvents events={events} />
      <Directions />
      <NewsSection articles={articles} />
      {partners.length > 0 && <Partners partners={partners} />}
      <MapSection settings={settings} />
    </>
  );
}
