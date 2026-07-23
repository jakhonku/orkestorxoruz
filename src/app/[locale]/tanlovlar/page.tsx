import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { CompetitionCard } from '@/components/cards/competition-card';
import { competitions } from '@/data/competitions';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Competitions' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function CompetitionsPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Competitions' });
  const tn = await getTranslations({ locale: params.locale, namespace: 'Nav' });

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition, i) => (
              <Reveal key={competition.slug} delay={(i % 3) * 0.08}>
                <CompetitionCard competition={competition} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
