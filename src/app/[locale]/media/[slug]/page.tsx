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
import { pick, formatDate } from '@/lib/utils';
import { news, getNewsBySlug } from '@/data/news';

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const article = getNewsBySlug(params.slug);
  if (!article) return {};
  return {
    title: pick(article.title, params.locale),
    description: pick(article.excerpt, params.locale),
    openGraph: { images: [article.cover], type: 'article' },
  };
}

export default function NewsDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  setRequestLocale(params.locale);
  if (!getNewsBySlug(params.slug)) notFound();
  return <Article slug={params.slug} />;
}

function Article({ slug }: { slug: string }) {
  const article = getNewsBySlug(slug)!;
  const locale = useLocale() as Locale;
  const t = useTranslations('Media');
  const tn = useTranslations('Nav');

  const related = news.filter((n) => n.slug !== slug).slice(0, 3);

  return (
    <>
      <article className="bg-white">
        <div className="container max-w-3xl pt-10">
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
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-gold" />
                {formatDate(article.date, locale)}
              </span>
              <span className="flex items-center gap-1.5">
                <UserRound className="h-4 w-4 text-gold" />
                {t('author')}: {pick(article.author, locale)}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="container max-w-4xl">
          <Reveal delay={0.1}>
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-soft-lg">
              <Image
                src={article.cover}
                alt={pick(article.title, locale)}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

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
