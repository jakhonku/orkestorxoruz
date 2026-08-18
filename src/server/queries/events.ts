import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { ConcertEventModel as Qator } from '@/generated/prisma/models';
import type { ConcertEvent } from '@/types';
import { eventCategoryFromDb } from '@/server/enums';
import { isoDate, loc, locOpt } from '@/server/map';

function moslash(e: Qator): ConcertEvent {
  return {
    slug: e.slug,
    title: loc(e.title),
    category: eventCategoryFromDb[e.category],
    poster: e.posterUrl ?? '',
    date: isoDate(e.date),
    time: e.time,
    venue: loc(e.venue),
    city: loc(e.city),
    ticketUrl: e.ticketUrl ?? undefined,
    price: locOpt(e.price),
    shortDescription: loc(e.shortDescription),
    featured: e.featured,
  };
}

export const getEvents = cache(async (): Promise<ConcertEvent[]> => {
  const rows = await db.concertEvent.findMany({
    where: { published: true },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });
  return rows.map(moslash);
});

export const getEventBySlug = cache(async (slug: string): Promise<ConcertEvent | undefined> => {
  const row = await db.concertEvent.findFirst({ where: { slug, published: true } });
  return row ? moslash(row) : undefined;
});

/**
 * Bosh sahifadagi "Yaqin tadbirlar" — bugundan keyingi konsertlar.
 * Yaqin tadbir qolmasa, oxirgi tadbirlar ko'rsatiladi (blok bo'sh qolmasligi uchun).
 */
export const getUpcomingEvents = cache(async (limit = 3): Promise<ConcertEvent[]> => {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const kelayotgan = await db.concertEvent.findMany({
    where: { published: true, date: { gte: bugun } },
    orderBy: { date: 'asc' },
    take: limit,
  });

  if (kelayotgan.length > 0) return kelayotgan.map(moslash);

  const oxirgilar = await db.concertEvent.findMany({
    where: { published: true },
    orderBy: { date: 'desc' },
    take: limit,
  });
  return oxirgilar.reverse().map(moslash);
});
