import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  Globe2,
  GraduationCap,
  Radio,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { SectionTitle } from '@/components/shared/section-title';
import { Reveal } from '@/components/shared/reveal';
import { Abzatslar } from '@/components/shared/abzatslar';
import { getFaoliyat, type FaoliyatSahifasi } from '@/server/queries/faoliyat';
import { getSettings } from '@/server/queries/settings';
import { pick } from '@/lib/utils';

/** Admin paneldagi "Ikonka" tanlovi — shu ro'yxatdan chizma tanlanadi */
const IKONKALAR: Record<string, LucideIcon> = {
  'folder-kanban': FolderKanban,
  trophy: Trophy,
  'graduation-cap': GraduationCap,
  users: Users,
  'calendar-days': CalendarDays,
  radio: Radio,
  globe: Globe2,
};

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const [f, t] = await Promise.all([
    getFaoliyat(),
    getTranslations({ locale: params.locale, namespace: 'Activity' }),
  ]);
  return {
    title: pick(f.title, params.locale) || t('title'),
    description: pick(f.subtitle, params.locale) || t('subtitle'),
  };
}

export default async function ActivityPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const [faoliyat, sozlamalar] = await Promise.all([getFaoliyat(), getSettings()]);

  // Talent platformasi yopilgan bo'lsa — unga olib boradigan kartochka ham
  // chiqmaydi, aks holda havola 404 ga olib borardi
  const bloklar = sozlamalar.talentOpen
    ? faoliyat.blocks
    : faoliyat.blocks.filter((b) => b.href !== '/talent');

  return <ActivityContent faoliyat={{ ...faoliyat, blocks: bloklar }} />;
}

function ActivityContent({ faoliyat }: { faoliyat: FaoliyatSahifasi }) {
  const locale = useLocale();
  const t = useTranslations('Activity');
  const tn = useTranslations('Nav');

  const sarlavha = pick(faoliyat.title, locale) || t('title');
  const jumla = pick(faoliyat.subtitle, locale) || t('subtitle');
  const kirish = pick(faoliyat.intro, locale);

  return (
    <>
      <PageHeader
        title={sarlavha}
        subtitle={jumla}
        crumbs={[{ label: tn('home'), href: '/' }, { label: sarlavha }]}
      />

      {/* Kirish matni — bo'sh bo'lsa butun blok chizilmaydi */}
      {kirish.trim() !== '' && (
        <section className="section bg-white">
          <div
            className={
              faoliyat.image
                ? 'container grid items-center gap-10 lg:grid-cols-2'
                : 'container max-w-3xl'
            }
          >
            <Reveal>
              <SectionTitle align="left" title={t('introTitle')} className="mb-6" />
              <Abzatslar matn={kirish} />
            </Reveal>

            {faoliyat.image && (
              <Reveal delay={0.1}>
                <div className="relative aspect-[9/7] overflow-hidden rounded-2xl shadow-soft-lg">
                  <Image
                    src={faoliyat.image}
                    alt={sarlavha}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Yo'nalish kartochkalari */}
      <section className="section bg-navy-50/40">
        <div className="container">
          <SectionTitle title={t('blocksTitle')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {faoliyat.blocks.map((blok, i) => {
              const Icon = IKONKALAR[blok.icon] ?? FolderKanban;
              return (
                <Reveal key={`${blok.href}-${i}`} delay={i * 0.08}>
                  <Link
                    href={blok.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
                  >
                    <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white transition-colors group-hover:bg-gold group-hover:text-navy-900">
                      <Icon className="h-7 w-7" />
                    </span>
                    <h3 className="font-serif text-xl font-semibold text-navy">
                      {pick(blok.title, locale)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {pick(blok.text, locale)}
                    </p>
                    <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy">
                      <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
