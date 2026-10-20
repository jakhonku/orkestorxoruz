import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { CompetitionGetPayload } from '@/generated/prisma/models';
import type { Competition } from '@/types';
import { competitionKindFromDb, competitionStatusFromDb } from '@/server/enums';
import { loc, locList, locOpt } from '@/server/map';
import { arizaOchiqmi, muddatKorinishi } from '@/lib/muddat';

const toliq = {
  timeline: { orderBy: { sortOrder: 'asc' } },
  jury: { orderBy: { sortOrder: 'asc' } },
  documents: { orderBy: { sortOrder: 'asc' } },
  notes: { orderBy: { sortOrder: 'asc' } },
} as const;

type Qator = CompetitionGetPayload<{ include: typeof toliq }>;

function moslash(c: Qator): Competition {
  return {
    slug: c.slug,
    title: loc(c.title),
    kind: competitionKindFromDb[c.kind],
    // Muddat oʻtgan boʻlsa, "ochiq" tanlov "yopiq" koʻrinadi
    status: c.status === 'OCHIQ' && !arizaOchiqmi(c.status, c.applicationDeadline)
      ? 'yopiq'
      : competitionStatusFromDb[c.status],
    applicationDeadline: c.applicationDeadline ? muddatKorinishi(c.applicationDeadline) : undefined,
    detailOpen: c.status !== 'TEZ_KUNDA' || c.detailOpen,
    cover: c.coverUrl ?? '',
    date: loc(c.date),
    location: loc(c.location),
    shortDescription: loc(c.shortDescription),
    regulations: loc(c.regulations),
    regulationsFile: c.regulationsFileUrl ?? undefined,
    contactPhone: c.contactPhone ?? undefined,
    prizeFund: locOpt(c.prizeFund),
    participateTitle: locOpt(c.participateTitle),
    participateText: locOpt(c.participateText),
    prepareTitle: locOpt(c.prepareTitle),
    prepareList: c.prepareList == null ? undefined : locList(c.prepareList),
    documents: c.documents.map((d) => ({ title: loc(d.title), file: d.fileUrl })),
    notes: c.notes.map((n) => ({ category: loc(n.category), title: loc(n.title), file: n.fileUrl })),
    timeline: c.timeline.map((s) => ({
      date: loc(s.date),
      title: loc(s.title),
      description: loc(s.description),
    })),
    jury: c.jury.map((j) => ({ name: loc(j.name), country: loc(j.country), title: loc(j.title) })),
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
    select: { id: true, status: true, applicationDeadline: true, applicationEmail: true, formFields: true },
  });
});

export async function getCompetitionSlugs(): Promise<string[]> {
  const rows = await db.competition.findMany({
    where: { published: true },
    select: { slug: true, status: true, detailOpen: true },
  });
  return rows.filter((r) => r.status !== 'TEZ_KUNDA' || r.detailOpen).map((r) => r.slug);
}
