import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type {
  DocumentLinkModel as DocQator,
  ExpertModel as ExpertQator,
  LeaderModel as LeaderQator,
} from '@/generated/prisma/models';
import type { DocumentLink, Expert, Leader } from '@/types';
import { loc, locList } from '@/server/map';

function moslashExpert(e: ExpertQator): Expert {
  return {
    slug: e.slug,
    name: e.name,
    countryCode: e.countryCode,
    country: loc(e.country),
    photo: e.photoUrl ?? '',
    role: loc(e.role),
    bio: loc(e.bio),
    specialties: locList(e.specialties),
  };
}

export const getExperts = cache(async (): Promise<Expert[]> => {
  const rows = await db.expert.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(moslashExpert);
});

export const getExpertBySlug = cache(async (slug: string): Promise<Expert | undefined> => {
  const row = await db.expert.findFirst({ where: { slug, published: true } });
  return row ? moslashExpert(row) : undefined;
});

export const getLeaders = cache(async (): Promise<Leader[]> => {
  const rows = await db.leader.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((l: LeaderQator) => ({
    name: l.name,
    role: loc(l.role),
    photo: l.photoUrl ?? '',
    bio: loc(l.bio),
  }));
});

export const getDocuments = cache(async (): Promise<DocumentLink[]> => {
  const rows = await db.documentLink.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((d: DocQator) => ({ title: loc(d.title), href: d.href, meta: d.meta }));
});
