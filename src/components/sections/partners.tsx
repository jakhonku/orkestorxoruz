import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';
import { partners } from '@/data/kpi';
import { pick } from '@/lib/utils';

export function Partners() {
  const t = useTranslations('Home');
  const locale = useLocale();

  return (
    <section className="section bg-white">
      <div className="container">
        <SectionTitle eyebrow={t('partnersSubtitle')} title={t('partnersTitle')} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner, i) => (
            <Reveal key={partner.name} delay={i * 0.06}>
              <div className="group flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-center shadow-soft transition-all hover:border-gold/40 hover:shadow-soft-lg">
                {partner.logo ? (
                  <span className="relative h-12 w-full">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      sizes="160px"
                      className="object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                    />
                  </span>
                ) : (
                  <span className="font-serif text-lg font-bold tracking-tight text-navy transition-colors group-hover:text-gold-700">
                    {partner.logoText}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {pick(partner.country, locale)}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
