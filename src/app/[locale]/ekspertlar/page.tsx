import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Ekspertlar } from '@/components/features/ekspertlar';
import { getExperts } from '@/server/queries/experts';

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
  const experts = await getExperts();
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
          <Ekspertlar experts={experts} />
        </div>
      </section>
    </>
  );
}
