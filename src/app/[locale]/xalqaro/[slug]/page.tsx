import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { Abzatslar } from '@/components/shared/abzatslar';
import {
  getInternationalPageBySlug,
  getInternationalPages,
} from '@/server/queries/xalqaro';
import type { InternationalPage } from '@/types';
import { pick } from '@/lib/utils';

export async function generateStaticParams() {
  const sahifalar = await getInternationalPages();
  return sahifalar.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const sahifa = await getInternationalPageBySlug(params.slug);
  if (!sahifa) return {};
  return {
    title: pick(sahifa.title, params.locale),
    description: pick(sahifa.summary, params.locale),
    ...(sahifa.cover ? { openGraph: { images: [sahifa.cover] } } : {}),
  };
}

export default async function InternationalDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  const sahifa = await getInternationalPageBySlug(params.slug);
  if (!sahifa) notFound();
  return <Detail sahifa={sahifa} />;
}

function Detail({ sahifa }: { sahifa: InternationalPage }) {
  const locale = useLocale();
  const t = useTranslations('International');
  const tn = useTranslations('Nav');

  const sarlavha = pick(sahifa.title, locale);
  const matn = pick(sahifa.body, locale);

  return (
    <>
      <PageHeader
        title={sarlavha}
        subtitle={pick(sahifa.summary, locale)}
        crumbs={[
          { label: tn('home'), href: '/' },
          { label: tn('international'), href: '/xalqaro' },
          { label: sarlavha },
        ]}
      />

      <section className="section bg-white">
        <div className="container max-w-3xl">
          {sahifa.cover && (
            <Reveal>
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl shadow-soft-lg">
                <Image
                  src={sahifa.cover}
                  alt={sarlavha}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}

          <Reveal delay={0.05}>
            <Abzatslar matn={matn} />
          </Reveal>

          {sahifa.links.length > 0 && (
            <Reveal delay={0.1}>
              <h2 className="mt-12 font-serif text-2xl font-semibold text-navy">
                {t('linksTitle')}
              </h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
              <ul className="mt-6 space-y-2">
                {sahifa.links.map((havola, i) => (
                  <li key={i}>
                    <a
                      href={havola.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border bg-navy-50/40 px-4 py-3 text-sm font-medium text-navy transition-colors hover:border-gold/50 hover:bg-gold/5"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0 text-gold" />
                      <span className="flex-1">{pick(havola.label, locale)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
