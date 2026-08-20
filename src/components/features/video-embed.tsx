'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Instagram, Play } from 'lucide-react';

/**
 * Video ko'rsatkich — uch manbani biladi:
 *   YouTube ID, Instagram havolasi yoki saytga yuklangan video fayl.
 *
 * Barchasi "fasad" bo'lib ishlaydi: sahifa ochilganda faqat rasm yuklanadi,
 * og'ir iframe yoki video esa foydalanuvchi bosgandan keyin qo'shiladi.
 */

/** Instagram havolasidan o'rnatiladigan (embed) manzil yasaydi */
export function instagramEmbed(havola: string): string | null {
  const m = havola.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  // "reels" -> "reel": Instagram embed faqat shu ko'rinishni tushunadi
  const tur = m[1] === 'reels' ? 'reel' : m[1];
  return `https://www.instagram.com/${tur}/${m[2]}/embed`;
}

function Tugma({
  onClick,
  title,
  children,
  nisbat,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  nisbat: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative block w-full overflow-hidden rounded-xl bg-navy-900 ${nisbat}`}
      aria-label={title}
    >
      {children}
      <div className="absolute inset-0 flex items-center justify-center bg-navy-900/30 transition-colors group-hover:bg-navy-900/20">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy-900 shadow-gold transition-transform group-hover:scale-110">
          <Play className="ml-1 h-7 w-7 fill-current" />
        </span>
      </div>
    </button>
  );
}

export function VideoEmbed({
  youtubeId,
  instagramUrl = '',
  fileUrl = '',
  coverUrl = '',
  title,
}: {
  youtubeId?: string;
  instagramUrl?: string;
  fileUrl?: string;
  coverUrl?: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  /* ---------------- Saytga yuklangan video ---------------- */
  if (fileUrl) {
    if (playing) {
      return (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-navy-900">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={fileUrl}
            poster={coverUrl || undefined}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full bg-navy-900 object-contain"
          />
        </div>
      );
    }

    return (
      <Tugma onClick={() => setPlaying(true)} title={title} nisbat="aspect-video">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950" />
        )}
      </Tugma>
    );
  }

  /* ---------------- Instagram ---------------- */
  if (instagramUrl) {
    const embed = instagramEmbed(instagramUrl);

    // Havola tanilmasa — oddiy havola ko'rinishida beriladi
    if (!embed) {
      return (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="flex aspect-video items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 text-white transition-opacity hover:opacity-90"
        >
          <Instagram className="h-6 w-6" />
          <span className="text-sm font-medium">Instagram’da ochish</span>
        </a>
      );
    }

    if (playing) {
      return (
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy-900">
          <iframe
            src={embed}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      );
    }

    return (
      <Tugma onClick={() => setPlaying(true)} title={title} nisbat="aspect-[4/5]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#833AB4] via-[#C13584] to-[#F77737]">
            <Instagram className="h-10 w-10 text-white/80" />
          </span>
        )}
      </Tugma>
    );
  }

  /* ---------------- YouTube ---------------- */
  if (!youtubeId) return null;

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
    <Tugma onClick={() => setPlaying(true)} title={title} nisbat="aspect-video">
      <Image
        src={coverUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
      />
    </Tugma>
  );
}
