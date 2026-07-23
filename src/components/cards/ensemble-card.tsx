'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Users, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { REGION_NAMES } from '@/lib/constants';
import { pick } from '@/lib/utils';
import type { Ensemble } from '@/types';

export function EnsembleCard({ ensemble }: { ensemble: Ensemble }) {
  const locale = useLocale();
  const t = useTranslations('Ensembles');

  return (
    <Link
      href={`/jamoalar/${ensemble.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={ensemble.banner}
          alt={pick(ensemble.name, locale)}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent" />
        <Badge variant="gold" className="absolute left-4 top-4">
          {t(`type_${ensemble.type}`)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-navy-600">
          {pick(ensemble.name, locale)}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {pick(ensemble.shortDescription, locale)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            {pick(REGION_NAMES[ensemble.region], locale)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gold" />
            {ensemble.memberCount} {t('members')}
          </span>
        </div>
        <p className="mt-2 text-xs font-medium text-navy/70">
          {t('conductor')}: {ensemble.conductor}
        </p>
      </div>
    </Link>
  );
}