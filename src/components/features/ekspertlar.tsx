'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { ExpertCard } from '@/components/cards/expert-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { Modal } from '@/components/shared/modal';
import { Abzatslar } from '@/components/shared/abzatslar';
import { Badge } from '@/components/ui/badge';
import type { Expert } from '@/types';
import { pick, flagEmoji } from '@/lib/utils';

/**
 * Ekspertlar ro'yxati va "batafsil" oynasi.
 *
 * Kartochkada biografiya uch qator bilan cheklangan — to'liq matn, barcha
 * mutaxassislik yo'nalishlari va hamkorlik shakli kartochka bosilganda
 * ochiladi.
 */
export function Ekspertlar({ experts }: { experts: Expert[] }) {
  const tc = useTranslations('Common');
  const [ochiq, setOchiq] = useState<number | null>(null);
  const tanlangan = ochiq === null ? null : (experts[ochiq] ?? null);

  if (experts.length === 0) {
    return <EmptyState title={tc('emptyTitle')} text={tc('emptyText')} />;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {experts.map((expert, i) => (
          <Reveal key={expert.slug} delay={(i % 3) * 0.1}>
            <ExpertCard expert={expert} ochish={() => setOchiq(i)} />
          </Reveal>
        ))}
      </div>

      <Modal open={tanlangan !== null} onClose={() => setOchiq(null)} kenglik="3xl">
        {tanlangan && <Batafsil expert={tanlangan} />}
      </Modal>
    </>
  );
}

function Batafsil({ expert }: { expert: Expert }) {
  const locale = useLocale();
  const t = useTranslations('Experts');

  const ism = pick(expert.name, locale);
  const yonalishlar = pick(expert.specialties, locale);
  const hamkorlik = expert.cooperation ? pick(expert.cooperation, locale) : '';

  return (
    <div className="grid gap-7 sm:grid-cols-[minmax(0,15rem)_1fr]">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy-50">
          <Image
            src={expert.photo || '/hero.png'}
            alt={ism}
            fill
            sizes="(max-width: 640px) 100vw, 240px"
            className="object-cover"
          />
        </div>

        <p className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-navy-50/50 px-3 py-2.5 text-sm font-medium text-navy">
          <span className="text-lg leading-none">{flagEmoji(expert.countryCode)}</span>
          {pick(expert.country, locale)}
        </p>
      </div>

      <div>
        <h3 className="font-serif text-2xl font-semibold leading-tight text-navy">{ism}</h3>
        <p className="mt-1.5 text-sm font-medium text-gold-700">{pick(expert.role, locale)}</p>
        <div className="mt-4 h-1 w-14 rounded-full bg-gold" />

        <h4 className="mt-5 font-serif text-lg font-semibold text-navy">{t('bioTitle')}</h4>
        <Abzatslar matn={pick(expert.bio, locale)} className="mt-3 text-base" />

        {yonalishlar.length > 0 && (
          <>
            <h4 className="mt-6 font-serif text-lg font-semibold text-navy">
              {t('specialtiesTitle')}
            </h4>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {yonalishlar.map((s) => (
                <Badge key={s} variant="muted">
                  {s}
                </Badge>
              ))}
            </div>
          </>
        )}

        {hamkorlik && (
          <>
            <h4 className="mt-6 font-serif text-lg font-semibold text-navy">
              {t('cooperationTitle')}
            </h4>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">{hamkorlik}</p>
          </>
        )}
      </div>
    </div>
  );
}
