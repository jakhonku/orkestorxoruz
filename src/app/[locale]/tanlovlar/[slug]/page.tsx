import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  Clock,
  FileCheck2,
  Lock,
  ScrollText,
  SendHorizontal,
  Users,
} from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { BoyMatn } from '@/components/shared/boy-matn';
import { Reveal } from '@/components/shared/reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn, pick, flagEmoji } from '@/lib/utils';
import { qadamlargaBol, tilda, type Savol } from '@/lib/anketa';
import { tanlovAnketasi } from '@/lib/anketa-andozalari';
import type { Competition } from '@/types';
import {
  getCompetitionBySlug,
  getCompetitionMeta,
  getCompetitionSlugs,
} from '@/server/queries/competitions';
import type { CompetitionStatus } from '@/types';

const statusVariant: Record<CompetitionStatus, 'success' | 'danger' | 'gold'> = {
  ochiq: 'success',
  yopiq: 'danger',
  'tez-kunda': 'gold',
};

export async function generateStaticParams() {
  const slugs = await getCompetitionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const competition = await getCompetitionBySlug(params.slug);
  if (!competition) return {};
  return {
    title: pick(competition.title, params.locale),
    description: pick(competition.shortDescription, params.locale),
    openGraph: { images: [competition.cover] },
  };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  const competition = await getCompetitionBySlug(params.slug);
  if (!competition) notFound();

  // Ariza qaysi tanlovga tegishli ekanini bilish uchun bazadagi id kerak
  const meta = await getCompetitionMeta(params.slug);

  return <Detail competition={competition} anketa={tanlovAnketasi(meta?.formFields)} />;
}

function Detail({ competition, anketa }: { competition: Competition; anketa: Savol[] }) {
  const locale = useLocale();
  const t = useTranslations('Competitions');
  const tn = useTranslations('Nav');

  return (
    <>
      <section className="relative flex min-h-[420px] w-full flex-col justify-end overflow-hidden bg-navy-950 pt-28 pb-12 md:min-h-[460px] md:pt-36 md:pb-16">
        <Image
          src={competition.cover}
          alt={pick(competition.title, locale)}
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
              { label: tn('competitions'), href: '/loyihalar#tanlovlar' },
              { label: pick(competition.title, locale) },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/30 bg-white/15 text-white backdrop-blur-sm">
              {t(`kind_${competition.kind}`)}
            </Badge>
            <Badge variant={statusVariant[competition.status]}>
              {t(`status_${competition.status}`)}
            </Badge>
          </div>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight text-white drop-shadow-sm md:text-5xl">
            {pick(competition.title, locale)}
          </h1>
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
              <BoyMatn matn={pick(competition.regulations, locale)} className="mt-6" />
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

          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <Ishtirok competition={competition} anketa={anketa} />

            {/* Jury */}
            {competition.jury.length > 0 && (
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
                          <p className="font-medium text-navy">{pick(member.name, locale)}</p>
                          <p className="text-xs text-muted-foreground">{pick(member.title, locale)}</p>
                          <p className="text-xs text-gold-700">{pick(member.country, locale)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Telefonda ariza tugmasi doim ko'rinib tursin */}
      {competition.status === 'ochiq' && <div className="h-20 lg:hidden" aria-hidden="true" />}
      {competition.status === 'ochiq' && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 backdrop-blur-md lg:hidden">
          <ArizaTugmasi slug={competition.slug} status={competition.status} toliq />
        </div>
      )}
    </>
  );
}

/**
 * Ariza tugmasi — holatga qarab:
 *   ochiq     → ariza sahifasiga havola
 *   tez-kunda → "Ariza qabuli tez kunda" (bosilmaydi)
 *   yopiq     → "Ariza qabuli yopilgan" (bosilmaydi)
 */
function ArizaTugmasi({
  slug,
  status,
  toliq,
}: {
  slug: string;
  status: CompetitionStatus;
  /** Butun kenglikda */
  toliq?: boolean;
}) {
  const t = useTranslations('Competitions');

  if (status !== 'ochiq') {
    return (
      <span
        className={cn(
          'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-navy-50/60 px-7 text-sm font-semibold text-muted-foreground',
          toliq && 'w-full',
        )}
      >
        {status === 'tez-kunda' ? <Clock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        {status === 'tez-kunda' ? t('btnSoon') : t('btnClosed')}
      </span>
    );
  }

  return (
    <Button asChild variant="gold" size="lg" className={cn('group', toliq && 'w-full')}>
      <Link href={`/tanlovlar/${slug}/ariza`}>
        <SendHorizontal className="h-4 w-4 transition-transform duration-200 group-hover:-rotate-12" />
        {t('applyButton')}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}

/** "Ishtirok etish" kartasi: necha qadam, nimalarni tayyorlash kerak va ariza tugmasi */
function Ishtirok({ competition, anketa }: { competition: Competition; anketa: Savol[] }) {
  const locale = useLocale();
  const t = useTranslations('Competitions');

  const { bolimlar } = qadamlargaBol(anketa);
  // Ishtirokchi + aloqa + anketa bo'limlari (yoki oddiy shakl) + tasdiqlash
  const qadamlar = 2 + (anketa.length > 0 ? bolimlar.length : 1) + 1;
  const tayyorlash = anketa.filter((s) => s.tur === 'fayl' || s.tur === 'matnKatta');

  return (
    <Reveal delay={0.1}>
      <div className="overflow-hidden rounded-2xl border border-gold/30 bg-white shadow-soft">
        <div className="bg-navy-950 px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            {t('steps', { n: qadamlar })}
          </p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-white">{t('participateTitle')}</h2>
          <p className="mt-1 text-sm text-white/70">{t('participateText')}</p>
        </div>

        <div className="space-y-5 p-6">
          {tayyorlash.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('prepareTitle')}
              </p>
              <ul className="space-y-2.5">
                {tayyorlash.map((s) => (
                  <li key={s.id} className="flex items-start gap-2.5 text-sm text-navy-900">
                    <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {tilda(s.savol, locale)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ArizaTugmasi slug={competition.slug} status={competition.status} toliq />
        </div>
      </div>
    </Reveal>
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
