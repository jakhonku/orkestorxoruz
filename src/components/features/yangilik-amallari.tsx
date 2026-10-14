'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Eye, Link2, Send, Share2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Bir brauzerdan bir yangilik sutkada bir marta hisoblanadi */
const SUTKA = 24 * 60 * 60 * 1000;

function hisoblansinmi(slug: string): boolean {
  try {
    const kalit = `korildi:${slug}`;
    const oxirgi = Number(localStorage.getItem(kalit) ?? 0);
    if (Date.now() - oxirgi < SUTKA) return false;
    localStorage.setItem(kalit, String(Date.now()));
    return true;
  } catch {
    // Xotira yopiq (maxfiy oyna) — sahifa ochilganda bir marta hisoblanadi
    return true;
  }
}

/** Koʻrishlar soni: sahifa ochilganda sanaladi va yangilangan son chiqadi */
export function KorishlarSoni({
  slug,
  boshlangich,
  hisoblash = true,
}: {
  slug: string;
  boshlangich: number;
  /** false — faqat koʻrsatadi (roʻyxat kartochkasi), sanamaydi va serverga soʻrov yubormaydi */
  hisoblash?: boolean;
}) {
  const t = useTranslations('Media');
  const [soni, setSoni] = useState(boshlangich);
  const yuborildi = useRef(false);

  useEffect(() => {
    if (!hisoblash) return;
    // Dev rejimidagi qayta ishga tushirish ikki marta sanamasin
    if (yuborildi.current) return;
    yuborildi.current = true;

    fetch('/api/yangilik/korish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, hisobla: hisoblansinmi(slug) }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { views?: number } | null) => {
        if (d && typeof d.views === 'number') setSoni(d.views);
      })
      .catch(() => {});
  }, [slug, hisoblash]);

  // Roʻyxatda yangi son kelganda (sahifa yangilanganda) u ham yangilansin
  useEffect(() => setSoni(boshlangich), [boshlangich]);

  return (
    <span className="flex items-center gap-1.5">
      <Eye className="h-4 w-4 text-gold" />
      {soni.toLocaleString('ru-RU')} {t('news_views')}
    </span>
  );
}

/** "Ulashish" tugmasi: telefonda tizim oynasi, kompyuterda Telegram/Facebook/WhatsApp/havola */
export function UlashishTugmasi({
  sarlavha,
  light = false,
  yol,
  kichik = false,
}: {
  sarlavha: string;
  light?: boolean;
  /** Ulashiladigan sahifa yoʻli (/uz/media/...). Berilmasa — joriy sahifa */
  yol?: string;
  /** Kartochka uchun: faqat belgi, menyu yuqoriga ochiladi */
  kichik?: boolean;
}) {
  const t = useTranslations('Media');
  const [ochiq, setOchiq] = useState(false);
  const [nusxalandi, setNusxalandi] = useState(false);
  const quti = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ochiq) return;
    const yop = (e: MouseEvent) => {
      if (!quti.current?.contains(e.target as Node)) setOchiq(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOchiq(false);
    document.addEventListener('mousedown', yop);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', yop);
      document.removeEventListener('keydown', esc);
    };
  }, [ochiq]);

  const manzil = () => (yol ? window.location.origin + yol : window.location.href);

  function bosildi() {
    const havola = manzil();
    // Telefonda tizimning oʻz ulashish oynasi qulayroq
    if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      navigator.share({ title: sarlavha, url: havola }).catch(() => {});
      return;
    }
    setOchiq((o) => !o);
  }

  async function nusxala() {
    try {
      await navigator.clipboard.writeText(manzil());
    } catch {
      // Eski brauzer: vaqtincha maydon orqali
      const m = document.createElement('textarea');
      m.value = manzil();
      document.body.appendChild(m);
      m.select();
      document.execCommand('copy');
      m.remove();
    }
    setNusxalandi(true);
    setTimeout(() => setNusxalandi(false), 2000);
  }

  const u = () => encodeURIComponent(manzil());
  const s = encodeURIComponent(sarlavha);
  const ochish = (manzil: string) => {
    window.open(manzil, '_blank', 'noopener,noreferrer');
    setOchiq(false);
  };

  const element =
    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-navy transition-colors hover:bg-navy-50';

  return (
    <div ref={quti} className="relative">
      <button
        type="button"
        onClick={bosildi}
        aria-haspopup="menu"
        aria-expanded={ochiq}
        aria-label={t('news_share')}
        title={t('news_share')}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border font-semibold transition-colors',
          kichik ? 'h-8 w-8 justify-center text-xs' : 'h-9 px-4 text-sm',
          light
            ? 'border-white/30 text-white hover:bg-white/10'
            : 'border-border text-navy hover:border-gold/50 hover:bg-navy-50',
        )}
      >
        <Share2 className="h-4 w-4 text-gold" />
        {!kichik && t('news_share')}
      </button>

      {ochiq && (
        <div
          role="menu"
          aria-label={t('news_shareTitle')}
          className={cn(
            'absolute z-30 w-60 rounded-xl border border-border bg-white p-1.5 shadow-soft-lg',
            kichik ? 'bottom-full right-0 mb-2' : 'left-0 top-full mt-2',
          )}
        >
          <button
            type="button"
            role="menuitem"
            className={element}
            onClick={() => ochish(`https://t.me/share/url?url=${u()}&text=${s}`)}
          >
            <Send className="h-4 w-4 text-[#229ED9]" />
            Telegram
          </button>
          <button
            type="button"
            role="menuitem"
            className={element}
            onClick={() => ochish(`https://www.facebook.com/sharer/sharer.php?u=${u()}`)}
          >
            <span className="flex h-4 w-4 items-center justify-center text-[15px] font-bold leading-none text-[#1877F2]">
              f
            </span>
            Facebook
          </button>
          <button
            type="button"
            role="menuitem"
            className={element}
            onClick={() => ochish(`https://wa.me/?text=${s}%20${u()}`)}
          >
            <span className="flex h-4 w-4 items-center justify-center text-[11px] font-bold leading-none text-[#25D366]">
              WA
            </span>
            WhatsApp
          </button>
          <button type="button" role="menuitem" className={element} onClick={nusxala}>
            {nusxalandi ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Link2 className="h-4 w-4 text-gold" />
            )}
            {nusxalandi ? t('news_copied') : t('news_copyLink')}
          </button>
        </div>
      )}
    </div>
  );
}
