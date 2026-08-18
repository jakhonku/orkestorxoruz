import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { Users, MapPin, CalendarDays, Music2, UserRound } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Reveal } from '@/components/shared/reveal';
import { Badge } from '@/components/ui/badge';
import { GalleryGrid } from '@/components/features/gallery-grid';
import { VideoEmbed } from '@/components/features/video-embed';
import { REGION_NAMES } from '@/lib/constants';
import { pick } from '@/lib/utils';
import type { Ensemble } from '@/types';
import { getEnsembleBySlug, getEnsembleSlugs } from '@/server/queries/ensembles';

export async function generateStaticParams() {
  const slugs = await getEnsembleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const ensemble = await getEnsembleBySlug(params.slug);
  if (!ensemble) return {};
  return {
    title: pick(ensemble.name, params.locale),
    description: pick(ensemble.shortDescription, params.locale),
    openGraph: { images: [ensemble.banner] },
  };
}

export default async function EnsembleProfilePage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  const ensemble = await getEnsembleBySlug(params.slug);
  if (!ensemble) notFound();
  return <Profile ensemble={ensemble} />;
}

function Profile({ ensemble }: { ensemble: Ensemble }) {
  const locale = useLocale();
  const t = useTranslations('Ensembles');
  const tn = useTranslations('Nav');

  return (
    <>
      {/* Banner */}
      <section className="relative flex min-h-[420px] w-full flex-col justify-end overflow-hidden bg-navy-950 pt-28 pb-12 md:min-h-[460px] md:pt-36 md:pb-16">
        <Image
          src={ensemble.banner}
          alt={pick(ensemble.name, locale)}
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
              { label: tn('ensembles'), href: '/jamoalar' },
              { label: pick(ensemble.name, locale) },
            ]}
          />
          <div className="mt-4">
            <Badge variant="gold" className="w-fit">
              {t(`type_${ensemble.type}`)}
            </Badge>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight text-white drop-shadow-sm md:text-5xl">
            {pick(ensemble.name, locale)}
          </h1>
        </div>
      </section>

      {/* Quick facts */}
      <section className="border-b border-border bg-white">
        <div className="container grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
          {[
            { icon: MapPin, label: pick(REGION_NAMES[ensemble.region], locale) },
            { icon: UserRound, label: `${t('conductor')}: ${ensemble.conductor}` },
            { icon: Users, label: `${ensemble.memberCount} ${t('members')}` },
            { icon: CalendarDays, label: `${t('founded')}: ${ensemble.foundedYear}` },
          ].map((fact, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
                <fact.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-navy-900">{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-white">
        <div className="container grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* History */}
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-navy">{t('historyTitle')}</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {pick(ensemble.history, locale)}
            </p>

            {/* Repertoire */}
            <h2 className="mt-12 font-serif text-2xl font-semibold text-navy">
              {t('repertoireTitle')}
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
            <ul className="mt-6 space-y-3">
              {ensemble.repertoire.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-soft"
                >
                  <Music2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div>
                    <p className="font-medium text-navy">{pick(item.work, locale)}</p>
                    <p className="text-sm text-muted-foreground">{item.composer}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Members */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-navy-50/50 p-6">
              <h2 className="font-serif text-xl font-semibold text-navy">{t('membersTitle')}</h2>
              <ul className="mt-4 divide-y divide-border">
                {ensemble.members.map((member, i) => (
                  <li key={i} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-navy-900">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{pick(member.role, locale)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="section bg-navy-50/40">
        <div className="container">
          <h2 className="mb-8 font-serif text-2xl font-semibold text-navy">{t('galleryTitle')}</h2>
          <GalleryGrid photos={ensemble.gallery} />
        </div>
      </section>

      {/* Videos */}
      {ensemble.videos.length > 0 && (
        <section className="section bg-white">
          <div className="container">
            <h2 className="mb-8 font-serif text-2xl font-semibold text-navy">{t('videoTitle')}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {ensemble.videos.map((video, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <VideoEmbed youtubeId={video.youtubeId} title={pick(video.title, locale)} />
                  <p className="mt-3 font-medium text-navy">{pick(video.title, locale)}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
