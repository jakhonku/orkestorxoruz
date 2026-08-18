import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { CompetitionGetPayload } from '@/generated/prisma/models';
import type { Competition } from '@/types';
import { competitionKindFromDb, competitionStatusFromDb } from '@/server/enums';
import { loc } from '@/server/map';

const toliq = {
  timeline: { orderBy: { sortOrder: 'asc' } },
  jury: { orderBy: { sortOrder: 'asc' } },
} as const;

type Qator = CompetitionGetPayload<{ include: typeof toliq }>;

function moslash(c: Qator): Competition {
  return {
    slug: c.slug,
    title: loc(c.title),
    kind: competitionKindFromDb[c.kind],
    status: competitionStatusFromDb[c.status],
    cover: c.coverUrl ?? '',
    date: loc(c.date),
    location: loc(c.location),
    shortDescription: loc(c.shortDescription),
    regulations: loc(c.regulations),
    timeline: c.timeline.map((s) => ({
      date: loc(s.date),
      title: loc(s.title),
      description: loc(s.description),
    })),
    jury: c.jury.map((j) => ({ name: j.name, country: loc(j.country), title: loc(j.title) })),
  };
}

export const getCompetitions = cache(async (): Promise<Competition[]> => {
  const rows = await db.competition.findMany({
    where: { published: true },
    include: toliq,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(moslash);
});

export const getCompetitionBySlug = cache(async (slug: string): Promise<Competition | undefined> => {
  const row = await db.competition.findFirst({ where: { slug, published: true }, include: toliq });
  return row ? moslash(row) : undefined;
});

/** Ariza formasi uchun — tanlovning id va holati */
export const getCompetitionMeta = cache(async (slug: string) => {
  return db.competition.findFirst({
    where: { slug, published: true },
    select: { id: true, status: true, applicationEmail: true },
  });
});

export async function getCompetitionSlugs(): Promise<string[]> {
  const rows = await db.competition.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
