import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { ProjectsTabs } from '@/components/features/projects-tabs';
import { projects } from '@/data/projects';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Projects' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function ProjectsPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Projects' });
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
          <ProjectsTabs projects={projects} />
        </div>
      </section>
    </>
  );
}
