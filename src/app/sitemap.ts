import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/constants';
import { ensembles } from '@/data/ensembles';
import { projects } from '@/data/projects';
import { competitions } from '@/data/competitions';
import { news } from '@/data/news';

const staticPaths = [
  '',
  '/haqida',
  '/jamoalar',
  '/loyihalar',
  '/tanlovlar',
  '/talent',
  '/afisha',
  '/media',
  '/ekspertlar',
  '/aloqa',
];

const dynamicPaths = [
  ...ensembles.map((e) => `/jamoalar/${e.slug}`),
  ...projects.map((p) => `/loyihalar/${p.slug}`),
  ...competitions.map((c) => `/tanlovlar/${c.slug}`),
  ...news.map((n) => `/media/${n.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const all = [...staticPaths, ...dynamicPaths];
  const now = new Date();

  return all.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE.url}/${locale}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE.url}/${l}${path}`])
        ),
      },
    }))
  );
}
