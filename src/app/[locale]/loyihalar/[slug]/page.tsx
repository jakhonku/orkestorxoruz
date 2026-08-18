import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, MapPin } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Reveal } from '@/components/shared/reveal';
import { Badge } from '@/components/ui/badge';
import { GalleryGrid } from '@/components/features/gallery-grid';
import { pick } from '@/lib/utils';
import type { Project } from '@/types';
import { getProjectBySlug, getProjectSlugs } from '@/server/queries/projects';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: pick(project.title, params.locale),
    description: pick(project.shortDescription, params.locale),
    openGraph: { images: [project.cover] },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();
  return <Detail project={project} />;
}

function Detail({ project }: { project: Project }) {
  const locale = useLocale();
  const t = useTranslations('Projects');
  const tn = useTranslations('Nav');

  return (
    <>
      <section className="relative flex min-h-[420px] w-full flex-col justify-end overflow-hidden bg-navy-950 pt-28 pb-12 md:min-h-[460px] md:pt-36 md:pb-16">
        <Image
          src={project.cover}
          alt={pick(project.title, locale)}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Layered dark contrast overlays for guaranteed legibility */}
        <div className="absolute inset-0 bg-navy-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/40" />
        <div className="container relative z-10">
          <Breadcrumbs
            light
            crumbs={[
              { label: tn('home'), href: '/' },
              { label: tn('projects'), href: '/loyihalar' },
              { label: pick(project.title, locale) },
            ]}
          />
          <div className="mt-4">
            <Badge variant="gold" className="w-fit">
              {t(`tab_${project.scope}`)}
            </Badge>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight text-white drop-shadow-sm md:text-5xl">
            {pick(project.title, locale)}
          </h1>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {pick(project.description, locale)}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-6 rounded-2xl border border-border bg-navy-50/50 p-6">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
                  <CalendarDays className="h-4 w-4" />
                  {t('periodTitle')}
                </p>
                <p className="mt-1 font-medium text-navy">{pick(project.period, locale)}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
                  <MapPin className="h-4 w-4" />
                  {t('locationTitle')}
                </p>
                <p className="mt-1 font-medium text-navy">{pick(project.location, locale)}</p>
              </div>
              <div className="border-t border-border pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold-700">
                  {t('resultsTitle')}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {project.results.map((r, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{pick(r.label, locale)}</span>
                      <span className="font-serif text-2xl font-bold text-navy">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section className="section bg-navy-50/40">
          <div className="container">
            <h2 className="mb-8 font-serif text-2xl font-semibold text-navy">
              {t('galleryTitle')}
            </h2>
            <GalleryGrid photos={project.gallery} />
          </div>
        </section>
      )}
    </>
  );
}
