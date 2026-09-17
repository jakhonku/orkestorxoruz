import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/constants';
import { getEnsembleSlugs } from '@/server/queries/ensembles';
import { getProjectSlugs } from '@/server/queries/projects';
import { getCompetitionSlugs } from '@/server/queries/competitions';
import { getNewsSlugs } from '@/server/queries/news';
import { getInternationalPages } from '@/server/queries/xalqaro';

const staticPaths = [
  '',
  '/haqida',
  '/jamoalar',
  '/faoliyat',
  '/loyihalar',
  '/tanlovlar',
  '/talent',
  '/afisha',
  '/media',
  '/xalqaro',
  '/xalqaro/loyihalar',
  '/ekspertlar',
  '/aloqa',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ensembleSlugs, projectSlugs, competitionSlugs, newsSlugs, xalqaro] = await Promise.all([
    getEnsembleSlugs(),
    getProjectSlugs(),
    getCompetitionSlugs(),
    getNewsSlugs(),
    getInternationalPages(),
  ]);

  const dynamicPaths = [
    ...ensembleSlugs.map((slug) => `/jamoalar/${slug}`),
    ...projectSlugs.map((slug) => `/loyihalar/${slug}`),
    ...competitionSlugs.map((slug) => `/tanlovlar/${slug}`),
    ...newsSlugs.map((slug) => `/media/${slug}`),
    ...xalqaro.map((p) => `/xalqaro/${p.slug}`),
  ];

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
