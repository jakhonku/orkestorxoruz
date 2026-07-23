import { useLocale, useTranslations } from 'next-intl';
import { Facebook, Instagram, Send, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';
import { NewsletterForm } from './newsletter-form';
import { SITE, SOCIALS } from '@/lib/constants';
import { pick } from '@/lib/utils';

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  telegram: Send,
  youtube: Youtube,
  x: Send,
} as const;

export function Footer() {
  const t = useTranslations('Footer');
  const tn = useTranslations('Nav');
  const locale = useLocale();

  const cols = [
    {
      title: t('aboutTitle'),
      links: [
        { label: tn('about'), href: '/haqida' },
        { label: tn('ensembles'), href: '/jamoalar' },
        { label: tn('experts'), href: '/ekspertlar' },
      ],
    },
    {
      title: t('activityTitle'),
      links: [
        { label: tn('projects'), href: '/loyihalar' },
        { label: tn('competitions'), href: '/tanlovlar' },
        { label: tn('talent'), href: '/talent' },
      ],
    },
    {
      title: t('mediaTitle'),
      links: [
        { label: tn('afisha'), href: '/afisha' },
        { label: tn('media'), href: '/media' },
        { label: tn('contact'), href: '/aloqa' },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-navy to-navy-900" />
      <div className="container relative">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="[&_span]:text-white">
              <Logo light />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">{t('tagline')}</p>
            <ul className="mt-6 space-y-2.5 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {pick(SITE.address, locale)}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                {SITE.phone}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                {SITE.email}
              </li>
            </ul>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-300">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-8 border-t border-white/10 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h4 className="font-serif text-xl font-semibold">{t('newsletterTitle')}</h4>
            <p className="mt-1 text-sm text-white/60">{t('newsletterText')}</p>
          </div>
          <NewsletterForm variant="dark" />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 md:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {pick(SITE.shortName, locale)}. {t('rights')}
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => {
              const Icon = socialIcons[s.platform];
              return (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-gold hover:text-navy-900"
                  aria-label={s.platform}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
