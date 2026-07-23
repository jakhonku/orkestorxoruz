'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Newspaper, Video, Images, Download, FileText } from 'lucide-react';
import { NewsCard } from '@/components/cards/news-card';
import { VideoEmbed } from '@/components/features/video-embed';
import { Pagination } from '@/components/shared/pagination';
import { Lightbox, type LightboxImage } from '@/components/shared/lightbox';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/shared/reveal';
import { cn, pick } from '@/lib/utils';
import { documents } from '@/data/experts';
import type { MediaPhoto, MediaVideo, NewsArticle } from '@/types';

type Tab = 'news' | 'video' | 'photo' | 'press';
const PER_PAGE = 6;

export function MediaTabs({
  news,
  videos,
  photos,
}: {
  news: NewsArticle[];
  videos: MediaVideo[];
  photos: MediaPhoto[];
}) {
  const t = useTranslations('Media');
  const [tab, setTab] = useState<Tab>('news');

  const tabs: { key: Tab; icon: typeof Newspaper }[] = [
    { key: 'news', icon: Newspaper },
    { key: 'video', icon: Video },
    { key: 'photo', icon: Images },
    { key: 'press', icon: FileText },
  ];

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-1 rounded-full border border-border bg-white p-1 shadow-soft">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                'relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
                active ? 'text-white' : 'text-navy/70 hover:text-navy'
              )}
            >
              {active && (
                <motion.span
                  layoutId="mediaTab"
                  className="absolute inset-0 rounded-full bg-navy"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{t(`tab_${item.key}`)}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 'news' && <NewsTab news={news} />}
          {tab === 'video' && <VideoTab videos={videos} />}
          {tab === 'photo' && <PhotoTab photos={photos} />}
          {tab === 'press' && <PressTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function NewsTab({ news }: { news: NewsArticle[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(news.length / PER_PAGE);
  const visible = news.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((article) => (
          <NewsCard key={article.slug} article={article} />
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </>
  );
}

function VideoTab({ videos }: { videos: MediaVideo[] }) {
  const locale = useLocale();
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, i) => (
        <Reveal key={video.id} delay={(i % 3) * 0.08}>
          <VideoEmbed youtubeId={video.youtubeId} title={pick(video.title, locale)} />
          <p className="mt-3 font-medium text-navy">{pick(video.title, locale)}</p>
        </Reveal>
      ))}
    </div>
  );
}

function PhotoTab({ photos }: { photos: MediaPhoto[] }) {
  const locale = useLocale();
  const [active, setActive] = useState<number | null>(null);
  const images: LightboxImage[] = photos.map((p) => ({ src: p.src, caption: pick(p.caption, locale) }));

  return (
    <>
      <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setActive(i)}
            className="group relative block w-full overflow-hidden rounded-xl"
          >
            <Image
              src={photo.src}
              alt={pick(photo.caption, locale)}
              width={photo.ratio === 'portrait' ? 800 : photo.ratio === 'landscape' ? 1100 : 900}
              height={photo.ratio === 'portrait' ? 1100 : photo.ratio === 'landscape' ? 800 : 900}
              sizes="(max-width: 768px) 50vw, 33vw"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-900/0 transition-colors group-hover:bg-navy-900/20" />
          </button>
        ))}
      </div>
      <Lightbox images={images} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </>
  );
}

function PressTab() {
  const t = useTranslations('Media');
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-border bg-navy-50/50 p-8 text-center shadow-soft">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-gold">
          <FileText className="h-7 w-7" />
        </span>
        <h3 className="font-serif text-2xl font-semibold text-navy">{t('pressTitle')}</h3>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('pressText')}</p>
        <Button variant="gold" size="lg" className="mt-6" asChild>
          <a href="#">
            <Download className="h-4 w-4" />
            {t('pressKit')}
          </a>
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {documents.map((doc, i) => (
          <a
            key={i}
            href={doc.href}
            className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-soft transition-all hover:border-gold/40 hover:shadow-soft-lg"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy transition-colors group-hover:bg-gold group-hover:text-navy-900">
              <FileText className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-medium text-navy">{pick(doc.title, locale)}</p>
              <p className="text-xs text-muted-foreground">{doc.meta}</p>
            </div>
            <Download className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-gold" />
          </a>
        ))}
      </div>
    </div>
  );
}
