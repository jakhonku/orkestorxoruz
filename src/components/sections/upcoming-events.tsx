import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/shared/reveal';
import { Badge } from '@/components/ui/badge';
import { events } from '@/data/events';
import { pick, formatDate } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

export function UpcomingEvents() {
  const locale = useLocale() as Locale;
  const t = useTranslations('Home');
  const ta = useTranslations('Afisha');
  const tc = useTranslations('Common');

  const upcoming = events.slice(0, 3);

  return (
    <section className="section bg-white">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t('upcomingSubtitle')}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-navy md:text-4xl">
              {t('upcomingTitle')}
            </h2>
          </div>
          <Link
            href="/afisha"
            className="flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-gold-700"
          >
            {tc('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {upcoming.map((event, i) => (
            <Reveal key={event.slug} delay={i * 0.1}>
              <Link
                href="/afisha"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={event.poster}
                    alt={pick(event.title, locale)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
                  <Badge variant="gold" className="absolute left-4 top-4">
                    {ta(`category_${event.category}`)}
                  </Badge>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gold-200">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(event.date, locale)} · {event.time}
                    </div>
                    <h3 className="font-serif text-lg font-semibold leading-snug">
                      {pick(event.title, locale)}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/70">
                      <MapPin className="h-3.5 w-3.5" />
                      {pick(event.venue, locale)}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
