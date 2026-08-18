import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

type Natija = { label: string; href: string; group: string };

/**
 * Sayt bo'ylab qidiruv.
 *
 * Jamoalar, loyihalar, tadbirlar va yangiliklar sarlavhasi bo'yicha qidiradi.
 * Qidiruv jsonb ustunning joriy til kaliti bo'yicha ILIKE bilan bajariladi
 * (katta-kichik harf farqlanmaydi).
 *
 * GET /api/search?q=orkestr&locale=uz
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  const localeParam = searchParams.get('locale') ?? routing.defaultLocale;

  // Til kaliti to'g'ridan-to'g'ri SQL ga tushadi — faqat ruxsat etilganlari
  const locale = (routing.locales as readonly string[]).includes(localeParam)
    ? localeParam
    : routing.defaultLocale;

  if (q.length < 2) {
    return NextResponse.json({ results: [] as Natija[] });
  }

  const pattern = `%${q}%`;

  const [ensembles, projects, events, news] = await Promise.all([
    db.$queryRaw<{ slug: string; label: string }[]>`
      SELECT slug, name->>${locale} AS label FROM ensembles
      WHERE published = true AND name->>${locale} ILIKE ${pattern} LIMIT 5`,
    db.$queryRaw<{ slug: string; label: string }[]>`
      SELECT slug, title->>${locale} AS label FROM projects
      WHERE published = true AND title->>${locale} ILIKE ${pattern} LIMIT 5`,
    db.$queryRaw<{ slug: string; label: string }[]>`
      SELECT slug, title->>${locale} AS label FROM events
      WHERE published = true AND title->>${locale} ILIKE ${pattern} LIMIT 5`,
    db.$queryRaw<{ slug: string; label: string }[]>`
      SELECT slug, title->>${locale} AS label FROM news
      WHERE published = true AND title->>${locale} ILIKE ${pattern} LIMIT 5`,
  ]);

  const results: Natija[] = [
    ...ensembles.map((r) => ({ label: r.label, href: `/jamoalar/${r.slug}`, group: 'ensembles' })),
    ...projects.map((r) => ({ label: r.label, href: `/loyihalar/${r.slug}`, group: 'projects' })),
    ...events.map((r) => ({ label: r.label, href: '/afisha', group: 'afisha' })),
    ...news.map((r) => ({ label: r.label, href: `/media/${r.slug}`, group: 'media' })),
  ].slice(0, 8);

  return NextResponse.json({ results });
}
