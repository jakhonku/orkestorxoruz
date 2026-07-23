import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Hero } from '@/components/sections/hero';
import { KpiStats } from '@/components/sections/kpi-stats';
import { UpcomingEvents } from '@/components/sections/upcoming-events';
import { Directions } from '@/components/sections/directions';
import { NewsSection } from '@/components/sections/news-section';
import { Partners } from '@/components/sections/partners';
import { NewsletterCta } from '@/components/sections/newsletter-cta';

export default function HomePage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  return (
    <>
      <Hero />
      <KpiStats />
      <UpcomingEvents />
      <Directions />
      <NewsSection />
      <Partners />
      <NewsletterCta />
    </>
  );
}
