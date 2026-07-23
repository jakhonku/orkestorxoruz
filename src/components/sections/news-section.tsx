import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/shared/reveal';
import { NewsCard } from '@/components/cards/news-card';
import { news } from '@/data/news';

export function NewsSection() {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');

  const latest = news.slice(0, 3);

  return (
    <section className="section bg-navy-50/40">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t('newsSubtitle')}
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-navy md:text-4xl">
              {t('newsTitle')}
            </h2>
          </div>
          <Link
            href="/media"
            className="flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-gold-700"
          >
            {tc('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {latest.map((article, i) => (
            <Reveal key={article.slug} delay={i * 0.1}>
              <NewsCard article={article} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
