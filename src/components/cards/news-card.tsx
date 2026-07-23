'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { pick, formatDate } from '@/lib/utils';
import type { NewsArticle } from '@/types';
import type { Locale } from '@/i18n/routing';

export function NewsCard({ article }: { article: NewsArticle }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Media');
  const tc = useTranslations('Common');

  return (
    <Link
      href={`/media/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={article.cover}
          alt={pick(article.title, locale)}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge variant="default" className="absolute left-4 top-4 bg-white/90">
          {t(`category_${article.category}`)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-gold" />
          {formatDate(article.date, locale)}
        </span>
        <h3 className="font-serif text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-navy-600">
          {pick(article.title, locale)}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {pick(article.excerpt, locale)}
        </p>
        <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-navy">
          {tc('readMore')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}