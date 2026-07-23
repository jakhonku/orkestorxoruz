import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { ExpertCard } from '@/components/cards/expert-card';
import { experts } from '@/data/experts';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Experts' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function ExpertsPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Experts' });
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert, i) => (
              <Reveal key={expert.slug} delay={i * 0.1}>
                <ExpertCard expert={expert} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
