'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';
import { Button } from '@/components/ui/button';
import { pick } from '@/lib/utils';
import type { SiteSettings } from '@/server/queries/settings';

export function MapSection({ settings }: { settings: SiteSettings }) {
  const t = useTranslations('Home');
  const tc = useTranslations('Contact');
  const locale = useLocale();

  const { lat, lng } = settings.mapCoords;
  const chekka = 0.02;
  const xarita =
    'https://www.openstreetmap.org/export/embed.html?bbox=' +
    [lng - chekka, lat - chekka, lng + chekka, lat + chekka].map((n) => n.toFixed(4)).join('%2C') +
    `&layer=mapnik&marker=${lat.toFixed(5)}%2C${lng.toFixed(5)}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <section className="section relative overflow-hidden bg-gradient-to-b from-white via-navy-50/40 to-white">
      {/* Decorative ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #0B3C7D 0%, transparent 70%)' }}
      />

      <div className="container relative">
        <SectionTitle
          eyebrow={t('locationBadge')}
          title={t('mapTitle')}
          subtitle={t('mapSubtitle')}
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr] lg:items-stretch">
          {/* Info Card */}
          <Reveal direction="right" className="flex">
            <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-3xl bg-navy p-8 text-white shadow-soft-lg md:p-10">
              {/* Gold gradient glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-25"
                style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }}
              />

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 text-gold-400" />
                  <span>{pick(settings.shortName, locale)}</span>
                </div>

                <h3 className="mt-4 font-serif text-2xl font-semibold text-white md:text-3xl">
                  {pick(settings.name, locale)}
                </h3>

                <div className="my-6 h-px w-full bg-white/15" />

                <ul className="space-y-5">
                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-300 ring-1 ring-white/15 backdrop-blur-sm">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {tc('addressLabel')}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-white/90">
                        {pick(settings.address, locale)}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-300 ring-1 ring-white/15 backdrop-blur-sm">
                      <Phone className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {tc('phoneLabel')}
                      </p>
                      <a
                        href={`tel:${settings.phone.replace(/\s/g, '')}`}
                        className="mt-0.5 inline-block text-sm font-medium text-white/90 transition-colors hover:text-gold-300"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-300 ring-1 ring-white/15 backdrop-blur-sm">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {tc('emailLabel')}
                      </p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="mt-0.5 inline-block text-sm font-medium text-white/90 transition-colors hover:text-gold-300"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-300 ring-1 ring-white/15 backdrop-blur-sm">
                      <Clock className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {tc('hoursLabel')}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-white/90">
                        {pick(settings.workingHours, locale)}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Button variant="gold" size="lg" className="w-full gap-2 text-sm" asChild>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {t('openInMaps')}
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Map Frame */}
          <Reveal direction="left" className="flex">
            <div className="relative min-h-[380px] w-full overflow-hidden rounded-3xl border border-navy-100/80 bg-white shadow-soft-lg lg:min-h-[500px]">
              <iframe
                title={t('mapTitle')}
                src={xarita}
                className="h-full min-h-[380px] w-full border-0 lg:min-h-[500px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
