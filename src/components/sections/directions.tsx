import { useTranslations } from 'next-intl';
import { FolderKanban, Trophy, Radio, GraduationCap, ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/shared/reveal';
import { SectionTitle } from '@/components/shared/section-title';

interface Direction {
  key: string;
  href: string;
  icon: LucideIcon;
}

const directions: Direction[] = [
  { key: 'projects', href: '/loyihalar', icon: FolderKanban },
  { key: 'competitions', href: '/tanlovlar', icon: Trophy },
  { key: 'media', href: '/media', icon: Radio },
  { key: 'education', href: '/talent', icon: GraduationCap },
];

export function Directions() {
  const t = useTranslations('Home');

  return (
    <section className="section bg-navy-50/40">
      <div className="container">
        <SectionTitle eyebrow={t('directionsSubtitle')} title={t('directionsTitle')} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {directions.map((dir, i) => {
            const Icon = dir.icon;
            return (
              <Reveal key={dir.key} delay={i * 0.08}>
                <Link
                  href={dir.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
                >
                  <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white transition-colors group-hover:bg-gold group-hover:text-navy-900">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-navy">
                    {t(`dir_${dir.key}`)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {t(`dir_${dir.key}_desc`)}
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
  );
}
