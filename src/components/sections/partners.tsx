import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';
import type { Partner } from '@/types';
import { pick } from '@/lib/utils';

export function Partners({ partners }: { partners: Partner[] }) {
  const t = useTranslations('Home');
  const locale = useLocale();

  return (
    <section className="section bg-white">
      <div className="container">
        <SectionTitle eyebrow={t('partnersSubtitle')} title={t('partnersTitle')} />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {partners.map((partner, i) => {
            const ichki = (
              <>
                {partner.logo ? (
                  <span className="relative h-24 w-full sm:h-28">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                      className="object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                    />
                  </span>
                ) : (
                  <span className="flex h-24 items-center font-serif text-2xl font-bold tracking-tight text-navy transition-colors group-hover:text-gold-700 sm:h-28">
                    {partner.logoText}
                  </span>
                )}
                <span className="line-clamp-2 text-sm font-semibold leading-snug text-navy transition-colors group-hover:text-gold-700">
                  {partner.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pick(partner.country, locale)}
                </span>
              </>
            );
            const klass =
              'group flex h-full flex-col items-center justify-start gap-3 rounded-xl border border-border bg-white p-5 text-center shadow-soft transition-all hover:border-gold/40 hover:shadow-soft-lg';

            return (
              <Reveal key={partner.name} delay={i * 0.06}>
                {partner.url ? (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={partner.name}
                    className={klass}
                  >
                    {ichki}
                  </a>
                ) : (
                  <div className={klass}>{ichki}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
