import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type {
  AboutTaskModel as TaskQator,
  KpiStatModel as KpiQator,
  PartnerModel as PartnerQator,
  StrategySlideModel as SlideQator,
} from '@/generated/prisma/models';
import type { KpiStat, Localized, Partner } from '@/types';
import { loc, locList } from '@/server/map';

/** Bosh ekrandagi strategiya slaydi */
export type StrategySlide = {
  tag: Localized;
  title: Localized;
  text: Localized;
  points: Localized<string[]>;
  image: string;
};

export const getStrategySlides = cache(async (): Promise<StrategySlide[]> => {
  const rows = await db.strategySlide.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((s: SlideQator) => ({
    tag: loc(s.tag),
    title: loc(s.title),
    text: loc(s.text),
    points: locList(s.points),
    image: s.imageUrl ?? '/hero.png',
  }));
});

export const getKpiStats = cache(async (): Promise<KpiStat[]> => {
  const rows = await db.kpiStat.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((k: KpiQator) => ({
    value: k.value,
    suffix: k.suffix,
    icon: k.icon,
    label: loc(k.label),
  }));
});

export const getPartners = cache(async (): Promise<Partner[]> => {
  const rows = await db.partner.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((p: PartnerQator) => ({
    name: p.name,
    logoText: p.logoText,
    logo: p.logoUrl ?? undefined,
    country: loc(p.country),
    url: p.url ?? undefined,
  }));
});

/** "Birlashma haqida" sahifasidagi tashkiliy vazifalar */
export const getAboutTasks = cache(async (): Promise<Localized[]> => {
  const rows = await db.aboutTask.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((t: TaskQator) => loc(t.text));
});
