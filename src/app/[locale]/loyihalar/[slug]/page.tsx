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
import { projects, getProjectBySlug } from '@/data/projects';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const project = getProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: pick(project.title, params.locale),
    description: pick(project.shortDescription, params.locale),
    openGraph: { images: [project.cover] },
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  if (!getProjectBySlug(params.slug)) notFound();
  return <Detail slug={params.slug} />;
}

function Detail({ slug }: { slug: string }) {
  const project = getProjectBySlug(slug)!;
  const locale = useLocale();
  const t = useTranslations('Projects');
  const tn = useTranslations('Nav');

  return (
    <>
      <section className="relative h-[46vh] min-h-[340px] w-full overflow-hidden bg-navy">
        <Image
          src={project.cover}
          alt={pick(project.title, locale)}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/50 to-navy-900/20" />
        <div className="container relative flex h-full flex-col justify-end pb-10">
          <Breadcrumbs
            light
            crumbs={[
              { label: tn('home'), href: '/' },
              { label: tn('projects'), href: '/loyihalar' },
              { label: pick(project.title, locale) },
            ]}
          />
          <Badge variant="gold" className="mt-4 w-fit">
            {t(`tab_${project.scope}`)}
          </Badge>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold text-white md:text-5xl">
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
