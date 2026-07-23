import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { AfishaView } from '@/components/features/afisha-view';
import { events } from '@/data/events';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Afisha' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function AfishaPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Afisha' });
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
          <AfishaView events={events} />
        </div>
      </section>
    </>
  );
}
