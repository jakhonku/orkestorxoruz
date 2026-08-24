import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

type Natija = { label: string; href: string; group: string };

/** Bazadan qaytadigan qator — sarlavha hech bir tilda bo'lmasa NULL bo'lishi mumkin */
type Qator = { slug: string; label: string | null };

/**
 * Sayt bo'ylab qidiruv.
 *
 * Jamoalar, loyihalar, tadbirlar va yangiliklar sarlavhasi bo'yicha qidiradi.
 * Qidiruv uchala tilda ham bajariladi (katta-kichik harf farqlanmaydi) —
 * sarlavha faqat o'zbekcha to'ldirilgan bo'lsa ham yozuv inglizcha/ruscha
 * sahifada topiladi. Ko'rsatiladigan matn: joriy til, bo'sh bo'lsa zaxirasi.
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
    db.$queryRaw<Qator[]>`
      SELECT slug, COALESCE(
               NULLIF(btrim(name->>${locale}), ''), NULLIF(btrim(name->>'uz'), ''),
               NULLIF(btrim(name->>'ru'), ''), NULLIF(btrim(name->>'en'), '')
             ) AS label
      FROM ensembles
      WHERE published = true AND (
        name->>'uz' ILIKE ${pattern} OR name->>'ru' ILIKE ${pattern} OR name->>'en' ILIKE ${pattern}
      ) LIMIT 5`,
    db.$queryRaw<Qator[]>`
      SELECT slug, COALESCE(
               NULLIF(btrim(title->>${locale}), ''), NULLIF(btrim(title->>'uz'), ''),
               NULLIF(btrim(title->>'ru'), ''), NULLIF(btrim(title->>'en'), '')
             ) AS label
      FROM projects
      WHERE published = true AND (
        title->>'uz' ILIKE ${pattern} OR title->>'ru' ILIKE ${pattern} OR title->>'en' ILIKE ${pattern}
      ) LIMIT 5`,
    db.$queryRaw<Qator[]>`
      SELECT slug, COALESCE(
               NULLIF(btrim(title->>${locale}), ''), NULLIF(btrim(title->>'uz'), ''),
               NULLIF(btrim(title->>'ru'), ''), NULLIF(btrim(title->>'en'), '')
             ) AS label
      FROM events
      WHERE published = true AND (
        title->>'uz' ILIKE ${pattern} OR title->>'ru' ILIKE ${pattern} OR title->>'en' ILIKE ${pattern}
      ) LIMIT 5`,
    db.$queryRaw<Qator[]>`
      SELECT slug, COALESCE(
               NULLIF(btrim(title->>${locale}), ''), NULLIF(btrim(title->>'uz'), ''),
               NULLIF(btrim(title->>'ru'), ''), NULLIF(btrim(title->>'en'), '')
             ) AS label
      FROM news
      WHERE published = true AND (
        title->>'uz' ILIKE ${pattern} OR title->>'ru' ILIKE ${pattern} OR title->>'en' ILIKE ${pattern}
      ) LIMIT 5`,
  ]);

  const results: Natija[] = [
    ...ensembles.map((r) => ({ label: r.label, href: `/jamoalar/${r.slug}`, group: 'ensembles' })),
    ...projects.map((r) => ({ label: r.label, href: `/loyihalar/${r.slug}`, group: 'projects' })),
    ...events.map((r) => ({ label: r.label, href: '/afisha', group: 'afisha' })),
    ...news.map((r) => ({ label: r.label, href: `/media/${r.slug}`, group: 'media' })),
  ]
    // Hech bir tilda sarlavhasi yo'q yozuv ro'yxatda ko'rsatilmaydi
    .filter((r): r is Natija => Boolean(r.label))
    .slice(0, 8);

  return NextResponse.json({ results });
}
