'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { pick, flagEmoji } from '@/lib/utils';
import type { Expert } from '@/types';

export function ExpertCard({ expert }: { expert: Expert }) {
  const locale = useLocale();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={expert.photo}
          alt={expert.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-900/70 to-transparent" />
        <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy">
          <span className="text-base leading-none">{flagEmoji(expert.countryCode)}</span>
          {pick(expert.country, locale)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-lg font-semibold text-navy">{expert.name}</h3>
        <p className="mt-1 text-sm font-medium text-gold-700">{pick(expert.role, locale)}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {pick(expert.bio, locale)}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {pick(expert.specialties, locale)
            .slice(0, 3)
            .map((s) => (
              <Badge key={s} variant="muted" className="text-[11px]">
                {s}
              </Badge>
            ))}
        </div>
      </div>
    </article>
  );
}