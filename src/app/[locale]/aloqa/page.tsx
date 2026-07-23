import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Facebook, Instagram, Send, Youtube } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { ContactForm } from '@/components/features/contact-form';
import { SITE, SOCIALS } from '@/lib/constants';
import { pick } from '@/lib/utils';

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  telegram: Send,
  youtube: Youtube,
  x: Send,
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Aloqa' };
}

export default function ContactPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations('Contact');
  const tn = useTranslations('Nav');
  const locale = useLocale();

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />

      <section className="section bg-white">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Info */}
          <Reveal direction="right">
            <h2 className="font-serif text-2xl font-semibold text-navy">{t('infoTitle')}</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
            <ul className="mt-8 space-y-6">
              <InfoRow icon={MapPin} label={t('addressLabel')}>
                {pick(SITE.address, locale)}
              </InfoRow>
              <InfoRow icon={Phone} label={t('phoneLabel')}>
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="hover:text-navy">
                  {SITE.phone}
                </a>
              </InfoRow>
              <InfoRow icon={Mail} label={t('emailLabel')}>
                <a href={`mailto:${SITE.email}`} className="hover:text-navy">
                  {SITE.email}
                </a>
              </InfoRow>
            </ul>

            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-navy">{t('socialLabel')}</p>
              <div className="flex gap-2">
                {SOCIALS.map((s) => {
                  const Icon = socialIcons[s.platform];
                  return (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-gold hover:text-navy-900"
                      aria-label={s.platform}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal direction="left">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-navy">{t('formTitle')}</h2>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Map */}
      <section className="bg-navy-50/40 pb-16">
        <div className="container">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-navy">{t('mapTitle')}</h2>
          <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
            <iframe
              title={t('mapTitle')}
              src="https://www.openstreetmap.org/export/embed.html?bbox=69.24%2C41.29%2C69.31%2C41.33&layer=mapnik&marker=41.311%2C69.279"
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-navy-900">{children}</p>
      </div>
    </li>
  );
}
