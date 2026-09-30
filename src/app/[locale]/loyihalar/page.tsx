import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Globe2, UserSearch } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SectionTitle } from '@/components/shared/section-title';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { ProjectCard } from '@/components/cards/project-card';
import { CompetitionCard } from '@/components/cards/competition-card';
import { getProjects } from '@/server/queries/projects';
import { getCompetitions } from '@/server/queries/competitions';
import { getInternationalPages } from '@/server/queries/xalqaro';
import { pick } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Projects' });
  return { title: t('title'), description: t('subtitle') };
}

/**
 * Loyihalar — bitta sahifada ketma-ket uch bo'lim:
 *   1. Respublika loyihalari
 *   2. Xalqaro loyihalar va hamkorlik (xalqaro sahifalar, ekspertlar)
 *   3. Festival va ko'rik-tanlovlar
 * Ilgari "Faoliyat", "Xalqaro" va "Tanlov va festivallar" alohida sahifalar edi.
 */
export default async function ProjectsPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const [loyihalar, tanlovlar, xalqaroSahifalar, t, tn, te, ti, tc] = await Promise.all([
    getProjects(),
    getCompetitions(),
    getInternationalPages(),
    getTranslations({ locale: params.locale, namespace: 'Projects' }),
    getTranslations({ locale: params.locale, namespace: 'Nav' }),
    getTranslations({ locale: params.locale, namespace: 'Experts' }),
    getTranslations({ locale: params.locale, namespace: 'International' }),
    getTranslations({ locale: params.locale, namespace: 'Common' }),
  ]);

  const respublika = loyihalar.filter((p) => p.scope === 'respublika');
  const xalqaro = loyihalar.filter((p) => p.scope === 'xalqaro');

  const bolimlar = [
    { id: 'respublika', nom: t('sectionRepublic') },
    { id: 'xalqaro', nom: t('sectionInternational') },
    { id: 'tanlovlar', nom: t('sectionCompetitions') },
  ];

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />

      {/* Bo'limlarga tez o'tish */}
      <nav className="border-b border-border bg-white">
        <div className="container no-scrollbar flex gap-2 overflow-x-auto py-4">
          {bolimlar.map((b) => (
            <a
              key={b.id}
              href={`#${b.id}`}
              className="shrink-0 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold/60 hover:bg-gold/10"
            >
              {b.nom}
            </a>
          ))}
        </div>
      </nav>

      {/* 1. Respublika loyihalari */}
      <section id="respublika" className="section scroll-mt-20 bg-white">
        <div className="container">
          <SectionTitle title={t('sectionRepublic')} subtitle={t('subRepublic')} />
          {respublika.length === 0 ? (
            <EmptyState title={tc('emptyTitle')} text={tc('emptyText')} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {respublika.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 0.08}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Xalqaro */}
      <section id="xalqaro" className="section scroll-mt-20 bg-navy-50/40">
        <div className="container">
          <SectionTitle title={t('sectionInternational')} subtitle={t('subInternational')} />

          {xalqaro.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {xalqaro.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 0.08}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          )}

          {/* Xalqaro sahifalar (admin paneldan qo'shiladi) va ekspertlar */}
          <div className={xalqaro.length > 0 ? 'mt-12' : ''}>
            {xalqaro.length === 0 && xalqaroSahifalar.length === 0 && (
              <EmptyState title={tc('emptyTitle')} text={tc('emptyText')} />
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Reveal>
                <XalqaroKarta
                  href="/ekspertlar"
                  sarlavha={te('title')}
                  matn={ti('expertsCard')}
                  ikonka={<UserSearch className="h-14 w-14 text-gold/80" strokeWidth={1.4} />}
                />
              </Reveal>
              {xalqaroSahifalar.map((p, i) => (
                <Reveal key={p.slug} delay={(i + 1) * 0.08}>
                  <XalqaroKarta
                    href={`/xalqaro/${p.slug}`}
                    sarlavha={pick(p.title, params.locale)}
                    matn={pick(p.summary, params.locale)}
                    rasm={p.cover || undefined}
                    ikonka={<Globe2 className="h-14 w-14 text-gold/80" strokeWidth={1.4} />}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Festival va ko'rik-tanlovlar */}
      <section id="tanlovlar" className="section scroll-mt-20 bg-white">
        <div className="container">
          <SectionTitle title={t('sectionCompetitions')} subtitle={t('subCompetitions')} />
          {tanlovlar.length === 0 ? (
            <EmptyState title={tc('emptyTitle')} text={tc('emptyText')} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tanlovlar.map((c, i) => (
                <Reveal key={c.slug} delay={(i % 3) * 0.08}>
                  <CompetitionCard competition={c} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function XalqaroKarta({
  href,
  sarlavha,
  matn,
  rasm,
  ikonka,
}: {
  href: string;
  sarlavha: string;
  matn: string;
  rasm?: string;
  ikonka: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      {rasm ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={rasm}
            alt={sarlavha}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-navy-800 via-navy to-navy-900">
          {ikonka}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-navy-600">
          {sarlavha}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{matn}</p>
        <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy">
          <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
