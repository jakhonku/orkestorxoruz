'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, CalendarClock } from 'lucide-react';

import { Reveal } from '@/components/shared/reveal';
import { Modal } from '@/components/shared/modal';
import { Abzatslar } from '@/components/shared/abzatslar';
import type { Leader } from '@/types';
import { pick } from '@/lib/utils';

/**
 * Rahbariyat kartochkalari va "batafsil" oynasi.
 *
 * Kartochkada faqat qisqacha ma'lumot turadi — uzun matn kartochkalarni
 * turli balandlikka olib kelardi. To'liq tarjimai hol va katta surat
 * kartochka bosilganda ochiladi.
 */
export function Rahbariyat({ leaders }: { leaders: Leader[] }) {
  const locale = useLocale();
  const t = useTranslations('About');
  const tc = useTranslations('Common');

  const [ochiq, setOchiq] = useState<number | null>(null);
  const tanlangan = ochiq === null ? null : (leaders[ochiq] ?? null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {leaders.map((leader, i) => {
          const ism = pick(leader.name, locale);
          const qabul = leader.receptionDay ? pick(leader.receptionDay, locale) : '';
          const unvon = leader.honorific ? pick(leader.honorific, locale) : '';

          return (
            <Reveal key={i} delay={i * 0.08}>
              <button
                type="button"
                onClick={() => setOchiq(i)}
                aria-haspopup="dialog"
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={leader.photo || '/hero.png'}
                    alt={ism}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-lg font-semibold text-navy">{ism}</h3>
                  <p className="mt-1 text-sm font-medium text-gold-700">
                    {pick(leader.role, locale)}
                  </p>
                  {unvon && <p className="mt-1.5 text-xs font-medium text-navy/70">{unvon}</p>}
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {pick(leader.bio, locale)}
                  </p>

                  {qabul && (
                    <p className="mt-3 flex items-start gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                      <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      <span>
                        <span className="font-semibold text-navy/80">{t('receptionLabel')}:</span>{' '}
                        {qabul}
                      </span>
                    </p>
                  )}

                  <span className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-navy">
                    {tc('readMore')}
                    <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>

      <Modal open={tanlangan !== null} onClose={() => setOchiq(null)} kenglik="3xl">
        {tanlangan && <Batafsil leader={tanlangan} />}
      </Modal>
    </>
  );
}

function Batafsil({ leader }: { leader: Leader }) {
  const locale = useLocale();
  const t = useTranslations('About');
  const te = useTranslations('Experts');

  const ism = pick(leader.name, locale);
  const unvon = leader.honorific ? pick(leader.honorific, locale) : '';
  const qabul = leader.receptionDay ? pick(leader.receptionDay, locale) : '';
  const qisqa = pick(leader.bio, locale);
  const toliq = leader.fullBio ? pick(leader.fullBio, locale) : '';

  return (
    <div className="grid gap-7 sm:grid-cols-[minmax(0,15rem)_1fr]">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy-50">
          <Image
            src={leader.photo || '/hero.png'}
            alt={ism}
            fill
            sizes="(max-width: 640px) 100vw, 240px"
            className="object-cover"
          />
        </div>

        {qabul && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-navy-50/50 px-3 py-2.5 text-xs text-muted-foreground">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            <span>
              <span className="block font-semibold text-navy/80">{t('receptionLabel')}</span>
              {qabul}
            </span>
          </p>
        )}
      </div>

      <div>
        <h3 className="font-serif text-2xl font-semibold leading-tight text-navy">{ism}</h3>
        <p className="mt-1.5 text-sm font-medium text-gold-700">{pick(leader.role, locale)}</p>
        {unvon && <p className="mt-1.5 text-sm text-navy/70">{unvon}</p>}
        <div className="mt-4 h-1 w-14 rounded-full bg-gold" />

        {/*
          Batafsil matn bo'lsa sarlavha bilan chiqadi, bo'lmasa qisqachasining
          o'zi ko'rsatiladi — oyna hech qachon bo'sh qolmaydi.
        */}
        {toliq.trim() !== '' ? (
          <>
            {qisqa.trim() !== '' && (
              <p className="mt-5 text-base font-medium leading-relaxed text-navy-900">{qisqa}</p>
            )}
            <h4 className="mt-6 font-serif text-lg font-semibold text-navy">{te('bioTitle')}</h4>
            <Abzatslar matn={toliq} className="mt-3 text-base" />
          </>
        ) : (
          <Abzatslar matn={qisqa} className="mt-5 text-base" />
        )}
      </div>
    </div>
  );
}
