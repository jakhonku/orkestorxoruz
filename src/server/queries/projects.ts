import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { ProjectGetPayload } from '@/generated/prisma/models';
import type { Project } from '@/types';
import { projectScopeFromDb } from '@/server/enums';
import { loc } from '@/server/map';

const toliq = {
  results: { orderBy: { sortOrder: 'asc' } },
  gallery: { orderBy: { sortOrder: 'asc' } },
} as const;

type Qator = ProjectGetPayload<{ include: typeof toliq }>;

function moslash(p: Qator): Project {
  return {
    slug: p.slug,
    title: loc(p.title),
    scope: projectScopeFromDb[p.scope],
    cover: p.coverUrl ?? '',
    period: loc(p.period),
    location: loc(p.location),
    shortDescription: loc(p.shortDescription),
    description: loc(p.description),
    results: p.results.map((r) => ({ label: loc(r.label), value: r.value })),
    gallery: p.gallery.map((g) => ({ src: g.src, caption: loc(g.caption) })),
    featured: p.featured,
  };
}

export const getProjects = cache(async (): Promise<Project[]> => {
  const rows = await db.project.findMany({
    where: { published: true },
    include: toliq,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map(moslash);
});

export const getProjectBySlug = cache(async (slug: string): Promise<Project | undefined> => {
  const row = await db.project.findFirst({ where: { slug, published: true }, include: toliq });
  return row ? moslash(row) : undefined;
});

export async function getProjectSlugs(): Promise<string[]> {
  const rows = await db.project.findMany({ where: { published: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}
