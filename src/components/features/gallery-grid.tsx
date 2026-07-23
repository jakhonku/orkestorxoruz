'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Lightbox, type LightboxImage } from '@/components/shared/lightbox';
import { pick } from '@/lib/utils';
import type { GalleryPhoto } from '@/types';

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const locale = useLocale();
  const [active, setActive] = useState<number | null>(null);

  const images: LightboxImage[] = photos.map((p) => ({
    src: p.src,
    caption: pick(p.caption, locale),
  }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl"
          >
            <Image
              src={photo.src}
              alt={pick(photo.caption, locale)}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-900/0 transition-colors group-hover:bg-navy-900/20" />
          </button>
        ))}
      </div>
      <Lightbox
        images={images}
        index={active}
        onClose={() => setActive(null)}
        onNavigate={setActive}
      />
    </>
  );
}
