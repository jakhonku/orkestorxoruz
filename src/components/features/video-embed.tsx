'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

/** Facade YouTube embed — loads the iframe only after the user clicks. */
export function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl bg-navy-900">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-navy-900"
      aria-label={title}
    >
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-navy-900/30 transition-colors group-hover:bg-navy-900/20">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy-900 shadow-gold transition-transform group-hover:scale-110">
          <Play className="ml-1 h-7 w-7 fill-current" />
        </span>
      </div>
    </button>
  );
}
