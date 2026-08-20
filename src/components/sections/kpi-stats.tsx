'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  MapPin,
  Globe2,
  Building2,
  Award,
  Tv2,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import type { KpiStat } from '@/types';
import { pick } from '@/lib/utils';

const icons: Record<string, LucideIcon> = {
  compass: MapPin,
  globe: Globe2,
  landmark: Building2,
  trophy: Award,
  radio: Tv2,
  'graduation-cap': BookOpen,
};

/** Icon gradient accent colors per position (cycles) */
const accentGradients = [
  'from-navy-700 to-navy-500',
  'from-gold-600 to-gold-400',
  'from-navy-600 to-navy-400',
  'from-gold-700 to-gold-500',
  'from-navy-800 to-navy-600',
  'from-gold-500 to-gold-300',
];

export function KpiStats({ stats }: { stats: KpiStat[] }) {
  const locale = useLocale();
  const t = useTranslations('Home');

  return (
    <section className="section relative overflow-hidden bg-gradient-to-b from-white via-navy-50/30 to-white">
      {/* Subtle decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #0B3C7D 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }}
      />

      <div className="container relative">
        <SectionTitle eyebrow={t('kpiSubtitle')} title={t('kpiTitle')} />

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-7">
          {stats.map((stat, i) => {
            const Icon = icons[stat.icon] ?? MapPin;
            const grad = accentGradients[i % accentGradients.length];
            const isGold = grad.includes('gold');

            return (
              <Reveal key={i} delay={i * 0.09}>
                <div className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-navy-100/60 bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-navy-200/80 hover:shadow-soft-lg md:p-9">
                  {/* Card inner glow on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: isGold
                        ? 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 65%)'
                        : 'radial-gradient(ellipse at 50% 0%, rgba(11,60,125,0.07) 0%, transparent 65%)',
                    }}
                  />

                  {/* Icon container — gradient bg, lifts on hover */}
                  <div
                    className={`mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br ${grad} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                  >
                    <Icon className="h-7 w-7 text-white drop-shadow-sm" strokeWidth={1.8} />
                  </div>

                  {/* Number */}
                  <span
                    className={`font-serif text-4xl font-bold leading-none md:text-5xl ${
                      isGold ? 'text-gold-700' : 'text-navy'
                    }`}
                  >
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </span>

                  {/* Thin divider line */}
                  <span
                    className={`my-3 block h-px w-8 rounded-full ${
                      isGold ? 'bg-gold/50' : 'bg-navy/20'
                    }`}
                  />

                  {/* Label */}
                  <span className="text-sm font-medium leading-snug text-navy-500">
                    {pick(stat.label, locale)}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

