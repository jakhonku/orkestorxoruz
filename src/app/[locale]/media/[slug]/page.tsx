import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, UserRound } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Reveal } from '@/components/shared/reveal';
import { Badge } from '@/components/ui/badge';
import { NewsCard } from '@/components/cards/news-card';
import { PostEmbed } from '@/components/features/post-embed';
import { cn, pick, formatDate } from '@/lib/utils';
import { postManbasi } from '@/lib/post';
import type { NewsArticle } from '@/types';
import { getNewsBySlug, getNewsSlugs, getRelatedNews } from '@/server/queries/news';

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const article = await getNewsBySlug(params.slug);
  if (!article) return {};
  return {
    title: pick(article.title, params.locale),
    description: pick(article.excerpt, params.locale),
    openGraph: {
      images: article.cover ? [article.cover] : undefined,
      type: 'article',
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  const article = await getNewsBySlug(params.slug);
  if (!article) notFound();
  const related = await getRelatedNews(params.slug, 3);
  return <Article article={article} related={related} />;
}

function Article({ article, related }: { article: NewsArticle; related: NewsArticle[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Media');
  const tn = useTranslations('Nav');

  // Admin panelda qo'yilgan havola YouTube, Instagram yoki Telegram niki —
  // qaysi biri ekani shu yerda aniqlanadi
  const post = postManbasi(article.video ?? '');
  const muqova = article.cover.trim();

  return (
    <>
      <article className="bg-white">
        {/*
          Muqovali yangilik: oq fonda sarlavha, ostida keng rasm.
          Muqovasiz yangilik (masalan oddiy Telegram posti): sarlavha saytning
          odatdagi to'q ko'k bannerida chiqadi — bo'sh oq sahifa qolmaydi.
        */}
        {muqova ? (
          <>
            <div className="container max-w-3xl pt-28 md:pt-36">
              <Breadcrumbs
                crumbs={[
                  { label: tn('home'), href: '/' },
                  { label: tn('media'), href: '/media' },
                  { label: pick(article.title, locale) },
                ]}
              />
              <Reveal>
                <Badge variant="gold" className="mt-6">
                  {t(`category_${article.category}`)}
                </Badge>
                <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-navy md:text-4xl">
                  {pick(article.title, locale)}
                </h1>
                <Malumot article={article} />
              </Reveal>
            </div>

            <div className="container max-w-4xl">
              <Reveal delay={0.1}>
                <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-soft-lg">
                  <Image
                    src={muqova}
                    alt={pick(article.title, locale)}
                    fill
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
          </>
        ) : (
          <header className="relative overflow-hidden bg-navy">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy to-navy-900" />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 20%, rgba(201,162,39,0.25), transparent 40%)',
              }}
            />
            {/* Birlashma emblemasi — shaffof suv belgisi sifatida */}
            <div className="pointer-events-none absolute -right-10 top-1/2 hidden h-72 w-72 -translate-y-1/2 opacity-[0.14] md:block lg:right-10 lg:h-80 lg:w-80">
              <Image src="/logo.png" alt="" fill sizes="320px" className="object-contain" />
            </div>
            <div className="container relative max-w-3xl pt-28 pb-12 md:pt-36 md:pb-14">
              <Breadcrumbs
                light
                crumbs={[
                  { label: tn('home'), href: '/' },
                  { label: tn('media'), href: '/media' },
                  { label: pick(article.title, locale) },
                ]}
              />
              <Reveal>
                <Badge variant="gold" className="mt-6">
                  {t(`category_${article.category}`)}
                </Badge>
                <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white drop-shadow-sm md:text-4xl">
                  {pick(article.title, locale)}
                </h1>
                <Malumot article={article} light />
                <div className="mt-6 h-1 w-20 rounded-full bg-gold" />
              </Reveal>
            </div>
          </header>
        )}

        {/* Video yoki ijtimoiy tarmoq posti — admin panelda havola qo'yilgan bo'lsa */}
        {post && (
          <div className="container max-w-4xl">
            <Reveal delay={0.15}>
              {/* Instagram reeli va Telegram posti tik turadi — kengligi cheklanadi */}
              <div
                className={
                  post.tur === 'youtube'
                    ? 'mt-8'
                    : post.tur === 'telegram'
                      ? 'mx-auto mt-8 max-w-xl'
                      : 'mx-auto mt-8 max-w-md'
                }
              >
                <PostEmbed manba={post} title={pick(article.title, locale)} />
              </div>
            </Reveal>
          </div>
        )}

        <div className="container max-w-3xl py-10">
          <div className="prose-custom space-y-5">
            {pick(article.body, locale).map((para, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className="text-lg leading-relaxed text-navy-900/80">{para}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section bg-navy-50/40">
          <div className="container">
            <h2 className="mb-8 font-serif text-2xl font-semibold text-navy">
              {t('relatedTitle')}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.slug} delay={i * 0.1}>
                  <NewsCard article={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/** Sana va muallif qatori — oq fonda ham, to'q ko'k bannerda ham ishlaydi */
function Malumot({ article, light = false }: { article: NewsArticle; light?: boolean }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Media');

  return (
    <div
      className={cn(
        'mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm',
        light ? 'text-white/70' : 'text-muted-foreground',
      )}
    >
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4 text-gold" />
        {formatDate(article.date, locale)}
      </span>
      <span className="flex items-center gap-1.5">
        <UserRound className="h-4 w-4 text-gold" />
        {t('author')}: {pick(article.author, locale)}
      </span>
    </div>
  );
}
