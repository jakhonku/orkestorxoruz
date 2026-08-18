import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { PageHeader } from '@/components/shared/page-header';
import { MediaTabs } from '@/components/features/media-tabs';
import { getMediaPhotos, getMediaVideos, getNews } from '@/server/queries/news';
import { getDocuments } from '@/server/queries/experts';

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Media' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function MediaPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);
  const [news, mediaVideos, mediaPhotos, documents] = await Promise.all([
    getNews(),
    getMediaVideos(),
    getMediaPhotos(),
    getDocuments(),
  ]);
  const t = await getTranslations({ locale: params.locale, namespace: 'Media' });
  const tn = await getTranslations({ locale: params.locale, namespace: 'Nav' });

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        crumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="section bg-white">
        <div className="container">
          <MediaTabs news={news} videos={mediaVideos} photos={mediaPhotos} documents={documents} />
        </div>
      </section>
    </>
  );
}
