'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Compass, Globe, Landmark, Trophy, Radio, GraduationCap, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { kpiStats } from '@/data/kpi';
import { pick } from '@/lib/utils';

const icons: Record<string, LucideIcon> = {
  compass: Compass,
  globe: Globe,
  landmark: Landmark,
  trophy: Trophy,
  radio: Radio,
  'graduation-cap': GraduationCap,
};

export function KpiStats() {
  const locale = useLocale();
  const t = useTranslations('Home');

  return (
    <section className="section bg-white">
      <div className="container">
        <SectionTitle eyebrow={t('kpiSubtitle')} title={t('kpiTitle')} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {kpiStats.map((stat, i) => {
            const Icon = icons[stat.icon] ?? Compass;
            return (
              <Reveal key={i} delay={i * 0.08}>
                <div className="group flex h-full flex-col items-center rounded-2xl border border-border bg-gradient-to-b from-white to-navy-50/40 p-6 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg md:p-8">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy/5 text-navy transition-colors group-hover:bg-gold group-hover:text-navy-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-serif text-4xl font-bold text-navy md:text-5xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="mt-2 text-sm font-medium text-muted-foreground">
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
