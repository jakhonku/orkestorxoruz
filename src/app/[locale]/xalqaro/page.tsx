import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Globe2, UserSearch } from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SectionTitle } from '@/components/shared/section-title';
import { Reveal } from '@/components/shared/reveal';
import { getInternationalPages } from '@/server/queries/xalqaro';
import type { InternationalPage } from '@/types';
import { pick } from '@/lib/utils';

/** Kodda belgilangan bo'limlar — bazadagi erkin sahifalardan oldin chiqadi */
const DOIMIY = [
  { href: '/xalqaro/loyihalar', icon: Globe2 },
  { href: '/ekspertlar', icon: UserSearch },
];

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'International' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function InternationalPage_({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const sahifalar = await getInternationalPages();
  return <Mazmun sahifalar={sahifalar} />;
}

function Mazmun({ sahifalar }: { sahifalar: InternationalPage[] }) {
  const locale = useLocale();
  const t = useTranslations('International');
  const te = useTranslations('Experts');
  const tn = useTranslations('Nav');

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('international') }]}
      />

      <section className="section bg-white">
        <div className="container">
          <SectionTitle title={t('pagesTitle')} />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/*
              Doimiy bo'limlar — bazadagi erkin sahifalardan oldin turadi.
              Ularning mazmuni o'z bo'limlarida tahrirlanadi:
              loyihalar «Loyihalar» da (Ko'lami = Xalqaro), ekspertlar «Ekspertlar» da.
            */}
            {DOIMIY.map((d, i) => {
              // Kalitlar aniq yozilgan: `npm run db:matnlar` ularni shu ko'rinishda
              // topadi va "Sahifa matnlari" bo'limiga chiqaradi.
              const ekspertlarmi = d.href === '/ekspertlar';
              const sarlavha = ekspertlarmi ? te('title') : t('projectsTitle');
              const tavsif = ekspertlarmi ? t('expertsCard') : t('projectsCard');

              return (
                <Reveal key={d.href} delay={i * 0.08}>
                  <Link
                    href={d.href}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
                  >
                    <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-navy-800 via-navy to-navy-900">
                      <d.icon className="h-16 w-16 text-gold/80" strokeWidth={1.4} />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-navy-600">
                        {sarlavha}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{tavsif}</p>
                      <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy">
                        <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}

            {sahifalar.map((p, i) => (
              <Reveal key={p.slug} delay={(DOIMIY.length + i) * 0.08}>
                <Link
                  href={`/xalqaro/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
                >
                  {p.cover ? (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={p.cover}
                        alt={pick(p.title, locale)}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-navy-700 via-navy to-navy-900" />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-navy-600">
                      {pick(p.title, locale)}
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {pick(p.summary, locale)}
                    </p>
                    <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy">
                      <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
