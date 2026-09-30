import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, Clock, Lock } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Button } from '@/components/ui/button';
import { ArizaQadamlari } from '@/components/features/ariza-qadamlari';
import { tanlovAnketasi } from '@/lib/anketa-andozalari';
import { pick } from '@/lib/utils';
import { getSettings } from '@/server/queries/settings';
import { getCompetitionBySlug, getCompetitionMeta } from '@/server/queries/competitions';

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const competition = await getCompetitionBySlug(params.slug);
  if (!competition) return {};
  const t = await getTranslations({ locale: params.locale, namespace: 'Competitions' });
  return {
    title: `${t('applyTitle')} — ${pick(competition.title, params.locale)}`,
    // Ariza shakli qidiruv natijalarida alohida sahifa bo'lib chiqmasin
    robots: { index: false },
  };
}

/** Tanlovga ariza — qadamma-qadam to'ldiriladigan alohida sahifa */
export default async function ArizaSahifasi({ params }: Props) {
  setRequestLocale(params.locale);
  if (!(await getSettings()).tanlovOpen) notFound();

  const [competition, meta] = await Promise.all([
    getCompetitionBySlug(params.slug),
    getCompetitionMeta(params.slug),
  ]);
  if (!competition || !meta) notFound();

  const [t, tk, tn] = await Promise.all([
    getTranslations({ locale: params.locale, namespace: 'Ariza' }),
    getTranslations({ locale: params.locale, namespace: 'Competitions' }),
    getTranslations({ locale: params.locale, namespace: 'Nav' }),
  ]);

  const nomi = pick(competition.title, params.locale);
  const ochiq = competition.status === 'ochiq';

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 pb-28 pt-28 md:pb-32 md:pt-36">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(201,162,39,0.22), transparent 45%)',
          }}
        />
        <div className="container relative max-w-3xl">
          <Breadcrumbs
            light
            crumbs={[
              { label: tn('home'), href: '/' },
              { label: tn('competitions'), href: '/loyihalar#tanlovlar' },
              { label: nomi, href: `/tanlovlar/${params.slug}` },
              { label: tk('applyTitle') },
            ]}
          />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {tk('applyTitle')}
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold leading-snug text-white md:text-3xl">
            {nomi}
          </h1>
        </div>
      </section>

      <section className="bg-navy-50/40 pb-20">
        <div className="container relative -mt-20 max-w-3xl">
          {ochiq ? (
            <ArizaQadamlari
              tanlovId={meta.id}
              slug={params.slug}
              anketa={tanlovAnketasi(meta.formFields)}
            />
          ) : (
            <div className="rounded-3xl border border-border bg-white px-6 py-14 text-center shadow-soft sm:px-12">
              <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy">
                {competition.status === 'tez-kunda' ? <Clock className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
              </span>
              <h2 className="font-serif text-3xl font-semibold text-navy-900">
                {competition.status === 'tez-kunda' ? t('soonTitle') : t('closedTitle')}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('closedText')}</p>
              <Button asChild size="lg" variant="outline" className="mt-8">
                <Link href={`/tanlovlar/${params.slug}`}>
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToCompetition')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
