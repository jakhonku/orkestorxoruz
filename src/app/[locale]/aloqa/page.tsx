import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Send, Youtube } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { Reveal } from '@/components/shared/reveal';
import { ContactForm } from '@/components/features/contact-form';
import { pick } from '@/lib/utils';
import { getSettings, type SiteSettings } from '@/server/queries/settings';

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

export default async function ContactPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const settings = await getSettings();
  return <ContactContent settings={settings} />;
}

/** Kontakt ma'lumotlari va xarita nuqtasi bazadagi sozlamalardan olinadi */
function ContactContent({ settings }: { settings: SiteSettings }) {
  const t = useTranslations('Contact');
  const tn = useTranslations('Nav');
  const locale = useLocale();

  const { lat, lng } = settings.mapCoords;
  const chekka = 0.02;
  const xarita =
    'https://www.openstreetmap.org/export/embed.html?bbox=' +
    [lng - chekka, lat - chekka, lng + chekka, lat + chekka].map((n) => n.toFixed(4)).join('%2C') +
    `&layer=mapnik&marker=${lat.toFixed(5)}%2C${lng.toFixed(5)}`;

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
                {pick(settings.address, locale)}
              </InfoRow>
              <InfoRow icon={Phone} label={t('phoneLabel')}>
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-navy">
                  {settings.phone}
                </a>
              </InfoRow>
              <InfoRow icon={Mail} label={t('emailLabel')}>
                <a href={`mailto:${settings.email}`} className="hover:text-navy">
                  {settings.email}
                </a>
              </InfoRow>
              <InfoRow icon={Clock} label={t('hoursLabel')}>
                {pick(settings.workingHours, locale)}
              </InfoRow>
            </ul>

            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-navy">{t('socialLabel')}</p>
              <div className="flex gap-2">
                {settings.socials.map((s) => {
                  const Icon = socialIcons[s.platform] ?? Send;
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
              src={xarita}
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
