'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

import { telegramAjrat } from '@/lib/telegram';
import type { PostManba } from '@/lib/post';
import { VideoEmbed } from './video-embed';

/**
 * Yangilik matni yonidagi ijtimoiy tarmoq posti.
 *
 * YouTube va Instagram — odatdagi pleyer (bosilganda o'sha yerda ochiladi),
 * Telegram esa postning o'zi bo'lib chiqadi: matni, rasmi va videosi bilan.
 */
export function PostEmbed({ manba, title }: { manba: PostManba; title: string }) {
  if (manba.tur === 'telegram') return <TelegramPost havola={manba.havola} />;

  return (
    <VideoEmbed
      youtubeId={manba.tur === 'youtube' ? manba.youtubeId : undefined}
      instagramUrl={manba.tur === 'instagram' ? manba.havola : undefined}
      title={title}
    />
  );
}

/** Telegram vidjeti yuklanmasa shuncha kutib, o'rniga havola ko'rsatiladi */
const KUTISH_MS = 6000;

/**
 * Telegram posti rasmiy vidjet skripti orqali qo'yiladi.
 *
 * Postni oddiy <iframe> bilan ham ko'rsatish mumkin, lekin balandligini
 * o'sha skript boshqaradi: ramka bilan Telegram o'zaro xabarlashadi va post
 * (rasm, video, matn) yuklangan sari balandlik yangilanadi. Skriptsiz post
 * kesilib qolardi.
 */
function TelegramPost({ havola }: { havola: string }) {
  const joy = useRef<HTMLDivElement>(null);
  const [xato, setXato] = useState(false);
  const post = telegramAjrat(havola);
  const yol = post ? `${post.kanal}/${post.post}` : '';

  useEffect(() => {
    const el = joy.current;
    if (!el || !yol) return;

    setXato(false);
    el.innerHTML = '';

    const skript = document.createElement('script');
    skript.async = true;
    skript.src = 'https://telegram.org/js/telegram-widget.js?22';
    skript.setAttribute('data-telegram-post', yol);
    skript.setAttribute('data-width', '100%');
    skript.setAttribute('data-userpic', 'true');
    // Post har doim oq fonda — sayt qorong'i mavzuni ishlatmaydi
    skript.setAttribute('data-dark', '0');
    skript.onerror = () => setXato(true);
    el.appendChild(skript);

    // Skript bloklangan bo'lsa (masalan reklama filtri) ramka paydo bo'lmaydi
    const kuzatuv = window.setTimeout(() => {
      if (!el.querySelector('iframe')) setXato(true);
    }, KUTISH_MS);

    return () => {
      window.clearTimeout(kuzatuv);
      el.innerHTML = '';
    };
  }, [yol]);

  // Havola tanilmasa (masalan yopiq kanal) yoki vidjet yuklanmasa — oddiy havola
  if (!post || xato) {
    return (
      <a
        href={havola}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 px-5 py-4 text-white transition-opacity hover:opacity-90"
      >
        <Send className="h-5 w-5" />
        <span className="text-sm font-medium">Telegramda ochish</span>
      </a>
    );
  }

  return (
    <div
      ref={joy}
      className="min-h-[220px] overflow-hidden rounded-xl [&_iframe]:!m-0 [&_iframe]:bg-white [&_iframe]:[color-scheme:light]"
    />
  );
}
