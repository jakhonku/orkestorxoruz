import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { EnsembleGetPayload } from '@/generated/prisma/models';
import type { Ensemble } from '@/types';
import { ensembleTypeFromDb, regionFromDb } from '@/server/enums';
import { loc } from '@/server/map';

/** Bog'liq jadvallar bilan birga olish uchun umumiy include */
const toliq = {
  members: { orderBy: { sortOrder: 'asc' } },
  repertoire: { orderBy: { sortOrder: 'asc' } },
  gallery: { orderBy: { sortOrder: 'asc' } },
  videos: { orderBy: { sortOrder: 'asc' } },
} as const;

type Qator = EnsembleGetPayload<{ include: typeof toliq }>;

function moslash(e: Qator): Ensemble {
  return {
    slug: e.slug,
    name: loc(e.name),
    type: ensembleTypeFromDb[e.type],
    region: regionFromDb[e.region],
    city: loc(e.city),
    conductor: e.conductor,
    memberCount: e.memberCount ?? 0,
    foundedYear: e.foundedYear ?? 0,
    logo: e.logoUrl ?? '',
    banner: e.bannerUrl ?? '',
    shortDescription: loc(e.shortDescription),
    history: loc(e.history),
    members: e.members.map((m) => ({ name: m.name, role: loc(m.role) })),
    repertoire: e.repertoire.map((r) => ({ composer: r.composer, work: loc(r.work) })),
    gallery: e.gallery.map((g) => ({ src: g.src, caption: loc(g.caption) })),
    videos: e.videos.map((v) => ({ title: loc(v.title), youtubeId: v.youtubeId })),
    featured: e.featured,
  };
}

/**
 * Barcha e'lon qilingan jamoalar.
 * `cache()` — bitta so'rov ichida takroriy chaqiruvlar bazaga qayta bormaydi.
 */
export const getEnsembles = cache(async (): Promise<Ensemble[]> => {
  const rows = await db.ensemble.findMany({
    where: { published: true },
    include: toliq,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(moslash);
});

export const getEnsembleBySlug = cache(async (slug: string): Promise<Ensemble | undefined> => {
  const row = await db.ensemble.findFirst({
    where: { slug, published: true },
    include: toliq,
  });
  return row ? moslash(row) : undefined;
});

/** Bosh sahifa uchun — tanlangan jamoalar */
export const getFeaturedEnsembles = cache(async (limit = 3): Promise<Ensemble[]> => {
  const rows = await db.ensemble.findMany({
    where: { published: true, featured: true },
    include: toliq,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    take: limit,
  });
  return rows.map(moslash);
});

/** Statik sahifalarni oldindan yaratish uchun (generateStaticParams) */
export async function getEnsembleSlugs(): Promise<string[]> {
  const rows = await db.ensemble.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
