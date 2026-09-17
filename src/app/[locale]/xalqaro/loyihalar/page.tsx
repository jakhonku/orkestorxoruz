import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { ProjectCard } from '@/components/cards/project-card';
import { getInternationalProjects } from '@/server/queries/projects';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'International' });
  return { title: t('projectsTitle'), description: t('projectsSubtitle') };
}

export default async function InternationalProjectsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  setRequestLocale(params.locale);
  const projects = await getInternationalProjects();
  const t = await getTranslations({ locale: params.locale, namespace: 'International' });
  const tn = await getTranslations({ locale: params.locale, namespace: 'Nav' });
  const tc = await getTranslations({ locale: params.locale, namespace: 'Common' });

  return (
    <>
      <PageHeader
        title={t('projectsTitle')}
        subtitle={t('projectsSubtitle')}
        crumbs={[
          { label: tn('home'), href: '/' },
          { label: tn('international'), href: '/xalqaro' },
          { label: t('projectsTitle') },
        ]}
      />
      <section className="section bg-white">
        <div className="container">
          {projects.length === 0 ? (
            <EmptyState title={tc('emptyTitle')} text={tc('emptyText')} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.slug} delay={(i % 3) * 0.08}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
