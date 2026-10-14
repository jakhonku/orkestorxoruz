import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Qidiruv robotlari va havola koʻrib chiquvchilar sanoqni oshirmaydi */
const ROBOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|telegram|whatsapp|headless/i;

/**
 * Yangilik sahifasining koʻrishlar soni.
 *
 * POST { slug, hisobla } — `hisobla: true` boʻlsa sanoq bittaga oshadi
 * (brauzer bir yangilikni sutkada bir marta hisoblaydi), har holda joriy son qaytadi.
 */
export async function POST(request: Request) {
  const tana = (await request.json().catch(() => null)) as {
    slug?: unknown;
    hisobla?: unknown;
  } | null;
  const slug = typeof tana?.slug === 'string' ? tana.slug.slice(0, 140) : '';
  if (!slug) return NextResponse.json({ xato: 'slug kerak' }, { status: 400 });

  const robotmi = ROBOT.test(request.headers.get('user-agent') ?? '');
  const oshir = tana?.hisobla === true && !robotmi;

  try {
    const tanla = { views: true, published: true } as const;
    const yozuv = oshir
      ? await db.newsArticle.update({
          where: { slug },
          data: { views: { increment: 1 } },
          select: tanla,
        })
      : await db.newsArticle.findUnique({ where: { slug }, select: tanla });

    if (!yozuv || !yozuv.published) return NextResponse.json({ xato: 'topilmadi' }, { status: 404 });
    return NextResponse.json({ views: yozuv.views });
  } catch {
    // Mavjud boʻlmagan slug yoki baza xatosi — sahifani buzmaymiz
    return NextResponse.json({ xato: 'topilmadi' }, { status: 404 });
  }
}
