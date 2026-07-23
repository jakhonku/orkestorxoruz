import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, MapPin, ScrollText, Users } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Reveal } from '@/components/shared/reveal';
import { Badge } from '@/components/ui/badge';
import { ApplyModal } from '@/components/features/apply-modal';
import { pick, flagEmoji } from '@/lib/utils';
import { competitions, getCompetitionBySlug } from '@/data/competitions';
import type { CompetitionStatus } from '@/types';

const statusVariant: Record<CompetitionStatus, 'success' | 'danger' | 'gold'> = {
  ochiq: 'success',
  yopiq: 'danger',
  'tez-kunda': 'gold',
};

export function generateStaticParams() {
  return competitions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const competition = getCompetitionBySlug(params.slug);
  if (!competition) return {};
  return {
    title: pick(competition.title, params.locale),
    description: pick(competition.shortDescription, params.locale),
    openGraph: { images: [competition.cover] },
  };
}

export default function CompetitionDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  if (!getCompetitionBySlug(params.slug)) notFound();
  return <Detail slug={params.slug} />;
}

function Detail({ slug }: { slug: string }) {
  const competition = getCompetitionBySlug(slug)!;
  const locale = useLocale();
  const t = useTranslations('Competitions');
  const tn = useTranslations('Nav');

  return (
    <>
      <section className="relative h-[46vh] min-h-[340px] w-full overflow-hidden bg-navy">
        <Image
          src={competition.cover}
          alt={pick(competition.title, locale)}
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
              { label: tn('competitions'), href: '/tanlovlar' },
              { label: pick(competition.title, locale) },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/40 bg-white/90 text-navy">
              {t(`kind_${competition.kind}`)}
            </Badge>
            <Badge variant={statusVariant[competition.status]}>
              {t(`status_${competition.status}`)}
            </Badge>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold text-white md:text-5xl">
            {pick(competition.title, locale)}
          </h1>
        </div>
      </section>

      {/* Meta bar + apply */}
      <section className="border-b border-border bg-white">
        <div className="container flex flex-col items-start justify-between gap-6 py-6 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <span className="flex items-center gap-2 text-sm font-medium text-navy-900">
              <CalendarDays className="h-5 w-5 text-gold" />
              {pick(competition.date, locale)}
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-navy-900">
              <MapPin className="h-5 w-5 text-gold" />
              {pick(competition.location, locale)}
            </span>
          </div>
          <ApplyModal status={competition.status} />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {/* Regulations */}
            <Reveal>
              <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-navy">
                <ScrollText className="h-6 w-6 text-gold" />
                {t('regulationsTitle')}
              </h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {pick(competition.regulations, locale)}
              </p>
            </Reveal>

            {/* Timeline */}
            <Reveal delay={0.1}>
              <h2 className="mt-12 font-serif text-2xl font-semibold text-navy">
                {t('timelineTitle')}
              </h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
              <ol className="mt-8 space-y-0">
                {competition.timeline.map((stage, i) => (
                  <li key={i} className="relative flex gap-5 pb-8 last:pb-0">
                    {i < competition.timeline.length - 1 && (
                      <span className="absolute left-[15px] top-8 h-full w-px bg-border" />
                    )}
                    <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                        {pick(stage.date, locale)}
                      </p>
                      <p className="mt-1 font-serif text-lg font-semibold text-navy">
                        {pick(stage.title, locale)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pick(stage.description, locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          {/* Jury */}
          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-border bg-navy-50/50 p-6">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-navy">
                <Users className="h-5 w-5 text-gold" />
                {t('juryTitle')}
              </h2>
              <ul className="mt-5 space-y-4">
                {competition.jury.map((member, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 text-xl leading-none">
                      {flagEmoji(memberFlag(member.country))}
                    </span>
                    <div>
                      <p className="font-medium text-navy">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{pick(member.title, locale)}</p>
                      <p className="text-xs text-gold-700">{pick(member.country, locale)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// Small helper: map the (already localized) country to a flag via known names.
function memberFlag(country: { uz: string }): string {
  const map: Record<string, string> = {
    Germaniya: 'DE',
    'O‘zbekiston': 'UZ',
    AQSh: 'US',
    Qatar: 'QA',
  };
  return map[country.uz] ?? 'UZ';
}
