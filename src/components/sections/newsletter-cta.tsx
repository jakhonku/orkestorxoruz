import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { NewsletterForm } from '@/components/site/newsletter-form';

export function NewsletterCta() {
  const t = useTranslations('Home');

  return (
    <section className="section bg-navy-50/40">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center shadow-soft-lg md:px-16 md:py-20">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 80% 20%, rgba(201,162,39,0.22), transparent 45%)',
              }}
            />
            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-navy-900">
                <Mail className="h-6 w-6" />
              </span>
              <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl">
                {t('newsletterTitle')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/70">{t('newsletterText')}</p>
              <div className="mx-auto mt-8 max-w-md">
                <NewsletterForm variant="dark" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
