'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { pick } from '@/lib/utils';
import type { Competition, CompetitionStatus } from '@/types';

const statusVariant: Record<CompetitionStatus, 'success' | 'danger' | 'gold'> = {
  ochiq: 'success',
  yopiq: 'danger',
  'tez-kunda': 'gold',
};

export function CompetitionCard({ competition }: { competition: Competition }) {
  const locale = useLocale();
  const t = useTranslations('Competitions');

  return (
    <Link
      href={`/tanlovlar/${competition.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={competition.cover}
          alt={pick(competition.title, locale)}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge variant="outline" className="border-white/40 bg-white/90 text-navy">
            {t(`kind_${competition.kind}`)}
          </Badge>
        </div>
        <Badge variant={statusVariant[competition.status]} className="absolute right-4 top-4">
          {t(`status_${competition.status}`)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-navy-600">
          {pick(competition.title, locale)}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {pick(competition.shortDescription, locale)}
        </p>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gold" />
            {pick(competition.date, locale)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            {pick(competition.location, locale)}
          </span>
        </div>
      </div>
    </Link>
  );
}