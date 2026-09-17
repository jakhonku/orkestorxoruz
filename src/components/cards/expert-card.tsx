'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { pick, flagEmoji } from '@/lib/utils';
import type { Expert } from '@/types';

/**
 * Ekspert kartochkasi.
 *
 * `ochish` berilgan bo'lsa kartochka bosiladigan tugmaga aylanadi va to'liq
 * biografiya oynasini ochadi — bu yerda matn uch qator bilan cheklangan,
 * chunki aks holda kartochkalar turli balandlikda chiqardi.
 */
export function ExpertCard({ expert, ochish }: { expert: Expert; ochish?: () => void }) {
  const locale = useLocale();
  const t = useTranslations('Experts');
  const tc = useTranslations('Common');
  const hamkorlik = expert.cooperation ? pick(expert.cooperation, locale) : '';

  const ichi = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={expert.photo || '/hero.png'}
          alt={pick(expert.name, locale)}
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
        <h3 className="font-serif text-lg font-semibold text-navy">{pick(expert.name, locale)}</h3>
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
        {hamkorlik && (
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-gold-700">
              {t('cooperationTitle')}:
            </span>{' '}
            {hamkorlik}
          </p>
        )}

        {ochish && (
          <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-navy">
            {tc('readMore')}
            <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </>
  );

  const uslub =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg';

  if (!ochish) return <article className={uslub}>{ichi}</article>;

  return (
    <button
      type="button"
      onClick={ochish}
      aria-haspopup="dialog"
      className={`${uslub} w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30`}
    >
      {ichi}
    </button>
  );
}
