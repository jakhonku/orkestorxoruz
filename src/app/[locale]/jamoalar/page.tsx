import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { EnsemblesExplorer } from '@/components/features/ensembles-explorer';
import { JoinEnsemble } from '@/components/features/join-ensemble';
import { getEnsembles } from '@/server/queries/ensembles';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Ensembles' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function EnsemblesPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const ensembles = await getEnsembles();
  const t = await getTranslations({ locale: params.locale, namespace: 'Ensembles' });
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
          <EnsemblesExplorer ensembles={ensembles} />
          <JoinEnsemble />
        </div>
      </section>
    </>
  );
}
