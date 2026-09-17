import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { InternationalPageGetPayload } from '@/generated/prisma/models';
import type { InternationalPage } from '@/types';
import { loc } from '@/server/map';

const toliq = { links: { orderBy: { sortOrder: 'asc' } } } as const;

type Qator = InternationalPageGetPayload<{ include: typeof toliq }>;

function moslash(p: Qator): InternationalPage {
  return {
    slug: p.slug,
    title: loc(p.title),
    summary: loc(p.summary),
    body: loc(p.body),
    cover: p.coverUrl ?? '',
    links: p.links.map((l) => ({ label: loc(l.label), url: l.url })),
  };
}

/**
 * "Xalqaro" bo'limidagi barcha ochiq sahifalar.
 *
 * Menyu har bir sahifada quriladi, shuning uchun so'rov `cache()` ichida:
 * bitta so'rov davomida bazaga faqat bir marta boriladi.
 */
export const getInternationalPages = cache(async (): Promise<InternationalPage[]> => {
  try {
    const rows = await db.internationalPage.findMany({
      where: { published: true },
      include: toliq,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map(moslash);
  } catch {
    // Jadval hali yaratilmagan bo'lsa ham sayt ishlashda davom etadi
    return [];
  }
});

export const getInternationalPageBySlug = cache(
  async (slug: string): Promise<InternationalPage | undefined> => {
    const row = await db.internationalPage.findFirst({
      where: { slug, published: true },
      include: toliq,
    });
    return row ? moslash(row) : undefined;
  },
);
