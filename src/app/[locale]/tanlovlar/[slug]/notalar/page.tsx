import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { Download, Music } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { sahifaAlternates } from '@/lib/seo';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Reveal } from '@/components/shared/reveal';
import { getSettings } from '@/server/queries/settings';
import { getCompetitionBySlug } from '@/server/queries/competitions';
import { pick } from '@/lib/utils';
import type { Competition } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const competition = await getCompetitionBySlug(params.slug);
  if (!competition) return {};
  return {
    title: pick(competition.title, params.locale),
    alternates: sahifaAlternates(params.locale, `/tanlovlar/${params.slug}/notalar`),
  };
}

export default async function NotalarPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  const sozlamalar = await getSettings();
  if (!sozlamalar.tanlovOpen) notFound();
  const competition = await getCompetitionBySlug(params.slug);
  if (!competition || competition.detailOpen === false) notFound();

  return <Notalar competition={competition} />;
}

function Notalar({ competition }: { competition: Competition }) {
  const locale = useLocale();
  const t = useTranslations('Competitions');
  const tn = useTranslations('Nav');

  // Turlar boʻyicha guruhlash (kiritilgan tartibda)
  const guruhlar = new Map<string, { nom: string; royxat: NonNullable<Competition['notes']> }>();
  for (const n of competition.notes ?? []) {
    const kalit = n.category.uz.trim();
    const g = guruhlar.get(kalit) ?? { nom: pick(n.category, locale), royxat: [] };
    g.royxat.push(n);
    guruhlar.set(kalit, g);
  }

  return (
    <section className="section bg-white pt-32 md:pt-40">
      <div className="container max-w-3xl">
        <Breadcrumbs
          crumbs={[
            { label: tn('home'), href: '/' },
            { label: pick(competition.title, locale), href: `/tanlovlar/${competition.slug}` },
            { label: t('notesTitle') },
          ]}
        />
        <h1 className="mt-4 flex items-center gap-3 font-serif text-3xl font-semibold text-navy md:text-4xl">
          <Music className="h-7 w-7 text-gold" />
          {t('notesTitle')}
        </h1>
        <p className="mt-2 text-muted-foreground">{pick(competition.title, locale)}</p>
        <div className="mt-3 h-1 w-16 rounded-full bg-gold" />

        {guruhlar.size === 0 ? (
          <p className="mt-10 text-muted-foreground">{t('notesEmpty')}</p>
        ) : (
          [...guruhlar.values()].map((g, gi) => (
            <Reveal key={gi} delay={0.05}>
              <h2 className="mt-10 font-serif text-xl font-semibold text-navy">{g.nom}</h2>
              <ul className="mt-4 space-y-3">
                {g.royxat.map((n, i) => (
                  <li key={i}>
                    <a
                      href={n.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-soft transition-all hover:border-gold/40 hover:shadow-soft-lg"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy transition-colors group-hover:bg-gold group-hover:text-navy-900">
                        <Music className="h-5 w-5" />
                      </span>
                      <span className="flex-1 font-medium text-navy">{pick(n.title, locale)}</span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-gold-700">
                        {t('download')}
                        <Download className="h-4 w-4" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))
        )}
      </div>
    </section>
  );
}
