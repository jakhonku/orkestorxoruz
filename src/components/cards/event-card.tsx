'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, Clock, MapPin, Music2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pick, formatDate } from '@/lib/utils';
import type { ConcertEvent } from '@/types';
import type { Locale } from '@/i18n/routing';

export function EventCard({ event }: { event: ConcertEvent }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Afisha');
  const tc = useTranslations('Common');

  // Bo'sh maydonlar sabab ", " kabi yarim qolgan satr chiqmasligi uchun
  const joy = [pick(event.venue, locale), pick(event.city, locale)].filter(Boolean).join(', ');
  const ijrochi = event.performerNote ? pick(event.performerNote, locale) : '';
  const narx = event.price ? pick(event.price, locale) : '';

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-soft-lg sm:flex-row">
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden sm:aspect-auto sm:w-56">
        <Image
          src={event.poster}
          alt={pick(event.title, locale)}
          fill
          sizes="(max-width: 640px) 100vw, 224px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge variant="gold" className="absolute left-3 top-3">
          {t(`category_${event.category}`)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-navy/70">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gold" />
            {formatDate(event.date, locale)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gold" />
            {event.time}
          </span>
        </div>
        <h3 className="font-serif text-xl font-semibold leading-snug text-navy">
          {pick(event.title, locale)}
        </h3>
        {joy && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-gold" />
            {joy}
          </p>
        )}
        {ijrochi && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Music2 className="h-4 w-4 text-gold" />
            <span className="font-medium text-navy/80">{t('performer')}:</span> {ijrochi}
          </p>
        )}
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {pick(event.shortDescription, locale)}
        </p>
        <div className="mt-4 flex items-center justify-between gap-4">
          {narx && <span className="text-sm font-semibold text-navy">{narx}</span>}
          <Button asChild variant="gold" size="sm" className="ml-auto">
            <a href={event.ticketUrl ?? '#'}>{tc('tickets')}</a>
          </Button>
        </div>
      </div>
    </article>
  );
}