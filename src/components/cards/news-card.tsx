'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { pick, formatDate } from '@/lib/utils';
import { postYorligiKaliti } from '@/lib/post';
import type { NewsArticle } from '@/types';
import type { Locale } from '@/i18n/routing';

export function NewsCard({ article }: { article: NewsArticle }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Media');
  const tc = useTranslations('Common');

  /**
   * Sarlavha yozilmagan bo'lsa (faqat post havolasi qo'yilgan yangilik)
   * uning o'rniga manba yozuvi chiqadi: "Telegram post", "Video"...
   */
  const yorliq = postYorligiKaliti(article.video);
  const sarlavha = pick(article.title, locale).trim();
  const korinadiganSarlavha = sarlavha || t(yorliq ?? `category_${article.category}`);
  const qisqacha = pick(article.excerpt, locale).trim();

  return (
    <Link
      href={`/media/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {article.cover ? (
          <Image
            src={article.cover}
            alt={korinadiganSarlavha}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /*
            Muqovasiz yangilik. Bo'sh joy o'rniga saytning o'z uslubidagi
            fon: to'q ko'k gradient, oltin nur va o'rtada birlashma emblemasi.
            Shu tufayli oddiy post ham bir xil, tayyor ko'rinishda chiqadi.
          */
          <span className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy to-navy-950">
            <span
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 25% 20%, rgba(201,162,39,0.35), transparent 55%)',
              }}
            />
            {/* Emblema — shaffof oq doira ichida, mayin va bosiqroq */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 p-2 shadow-soft ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-contain opacity-90"
                />
              </span>
            </span>
          </span>
        )}
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
          {korinadiganSarlavha}
        </h3>
        {qisqacha && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{qisqacha}</p>
        )}
        <span className="mt-4 flex flex-1 items-end gap-1.5 text-sm font-semibold text-navy">
          {tc('readMore')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}