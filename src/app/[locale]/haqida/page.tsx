import Image from 'next/image';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { Target, FileText, Download } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';
import { leaders, documents } from '@/data/experts';
import { pick } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'About' });
  return { title: t('title'), description: t('subtitle') };
}

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations('About');
  const tn = useTranslations('Nav');
  const locale = useLocale();

  const tasks = ['task1', 'task2', 'task3', 'task4', 'task5', 'task6'] as const;

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />

      {/* Mission */}
      <section className="section bg-white">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <Reveal direction="right">
            <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <Target className="h-4 w-4" />
              {t('missionTitle')}
            </span>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-navy md:text-4xl">
              {t('missionTitle')}
            </h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-gold" />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t('missionText')}
            </p>
          </Reveal>
          <Reveal direction="left">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft-lg">
              <Image
                src="https://picsum.photos/seed/about-mission/900/700"
                alt={t('missionTitle')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tasks */}
      <section className="section bg-navy-50/40">
        <div className="container">
          <SectionTitle title={t('tasksTitle')} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task, i) => (
              <Reveal key={task} delay={i * 0.07}>
                <div className="flex h-full gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy font-serif text-lg font-bold text-gold">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-navy-900">{t(task)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section bg-white">
        <div className="container">
          <SectionTitle title={t('leadershipTitle')} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map((leader, i) => (
              <Reveal key={leader.name} delay={i * 0.08}>
                <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={leader.photo}
                      alt={leader.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-navy">{leader.name}</h3>
                    <p className="mt-1 text-sm font-medium text-gold-700">
                      {pick(leader.role, locale)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{pick(leader.bio, locale)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="section bg-navy-50/40">
        <div className="container max-w-3xl">
          <SectionTitle title={t('documentsTitle')} align="left" />
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <a
                  href={doc.href}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-soft transition-all hover:border-gold/40 hover:shadow-soft-lg"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy transition-colors group-hover:bg-gold group-hover:text-navy-900">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-navy">{pick(doc.title, locale)}</p>
                    <p className="text-xs text-muted-foreground">{doc.meta}</p>
                  </div>
                  <Download className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-gold" />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
