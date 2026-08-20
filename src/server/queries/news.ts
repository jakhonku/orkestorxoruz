import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type {
  MediaPhotoModel as FotoQator,
  MediaVideoModel as VideoQator,
  NewsArticleModel as NewsQator,
} from '@/generated/prisma/models';
import type { MediaPhoto, MediaVideo, NewsArticle } from '@/types';
import { newsCategoryFromDb, photoRatioFromDb } from '@/server/enums';
import { isoDate, loc, locList } from '@/server/map';

function moslashNews(n: NewsQator): NewsArticle {
  return {
    slug: n.slug,
    title: loc(n.title),
    category: newsCategoryFromDb[n.category],
    cover: n.coverUrl ?? '',
    date: isoDate(n.date),
    author: loc(n.author),
    excerpt: loc(n.excerpt),
    body: locList(n.body),
    featured: n.featured,
  };
}

export const getNews = cache(async (): Promise<NewsArticle[]> => {
  const rows = await db.newsArticle.findMany({
    where: { published: true },
    orderBy: { date: 'desc' },
  });
  return rows.map(moslashNews);
});

export const getNewsBySlug = cache(async (slug: string): Promise<NewsArticle | undefined> => {
  const row = await db.newsArticle.findFirst({ where: { slug, published: true } });
  return row ? moslashNews(row) : undefined;
});

/** Bosh sahifa uchun — so'nggi yangiliklar */
export const getLatestNews = cache(async (limit = 3): Promise<NewsArticle[]> => {
  const rows = await db.newsArticle.findMany({
    where: { published: true },
    orderBy: [{ featured: 'desc' }, { date: 'desc' }],
    take: limit,
  });
  return rows.map(moslashNews);
});

/** Maqola sahifasidagi "Boshqa yangiliklar" bloki */
export const getRelatedNews = cache(async (slug: string, limit = 3): Promise<NewsArticle[]> => {
  const rows = await db.newsArticle.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: { date: 'desc' },
    take: limit,
  });
  return rows.map(moslashNews);
});

export const getMediaVideos = cache(async (): Promise<MediaVideo[]> => {
  const rows = await db.mediaVideo.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
  });
  return (
    rows
      .map((v: VideoQator) => ({
        id: String(v.id),
        title: loc(v.title),
        youtubeId: v.youtubeId ?? '',
        instagramUrl: v.instagramUrl ?? '',
        fileUrl: v.fileUrl ?? '',
        coverUrl: v.coverUrl ?? '',
        date: isoDate(v.date),
      }))
      // Uch manbadan hech biri to'ldirilmagan yozuv saytda ko'rsatilmaydi
      .filter((v) => v.youtubeId || v.instagramUrl || v.fileUrl)
  );
});

export const getMediaPhotos = cache(async (): Promise<MediaPhoto[]> => {
  const rows = await db.mediaPhoto.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((p: FotoQator) => ({
    id: String(p.id),
    src: p.src,
    caption: loc(p.caption),
    ratio: photoRatioFromDb[p.ratio],
  }));
});

export async function getNewsSlugs(): Promise<string[]> {
  const rows = await db.newsArticle.findMany({ where: { published: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}
