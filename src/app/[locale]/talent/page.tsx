import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { UserPlus, ClipboardCheck, Sparkles, Award, Users, GraduationCap, Globe } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';
import { TalentForm } from '@/components/features/talent-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Orchestra and Choir.uz Talent' };
}

export default function TalentPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  return <TalentContent />;
}

function TalentContent() {
  const t = useTranslations('Talent');
  const tn = useTranslations('Nav');

  const steps = [
    { icon: UserPlus, title: t('step1Title'), text: t('step1Text') },
    { icon: ClipboardCheck, title: t('step2Title'), text: t('step2Text') },
    { icon: Sparkles, title: t('step3Title'), text: t('step3Text') },
  ];

  const benefits = [
    { icon: Award, text: t('benefit1') },
    { icon: Users, text: t('benefit2') },
    { icon: GraduationCap, text: t('benefit3') },
    { icon: Globe, text: t('benefit4') },
  ];

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: tn('talent') }]}
      />

      {/* Intro */}
      <section className="section bg-white">
        <div className="container max-w-3xl text-center">
          <Reveal>
            <p className="text-xl leading-relaxed text-muted-foreground">{t('intro')}</p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-navy-50/40 pt-0">
        <div className="container">
          <SectionTitle title={t('howTitle')} />
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="relative h-full rounded-2xl border border-border bg-white p-7 shadow-soft">
                  <span className="absolute right-6 top-6 font-serif text-5xl font-bold text-navy/5">
                    0{i + 1}
                  </span>
                  <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
                    <step.icon className="h-7 w-7" />
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-navy">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white">
        <div className="container">
          <SectionTitle title={t('benefitsTitle')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-gradient-to-b from-white to-navy-50/40 p-6 text-center shadow-soft">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold-700">
                    <benefit.icon className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-medium text-navy-900">{benefit.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section bg-navy-50/40">
        <div className="container max-w-3xl">
          <SectionTitle title={t('formTitle')} />
          <Reveal>
            <TalentForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
