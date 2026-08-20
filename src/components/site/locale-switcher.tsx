'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * Tilni almashtirish.
 *
 * `inline` — uchala til yonma-yon tugma bo'lib turadi. Mobil menyu uchun shu
 * ko'rinish ishlatiladi: menyu `overflow-hidden` ichida bo'lgani uchun ochiladigan
 * ro'yxat ko'rinmay qolardi.
 */
export function LocaleSwitcher({
  light = false,
  inline = false,
}: {
  light?: boolean;
  inline?: boolean;
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function change(next: Locale) {
    setOpen(false);
    // @ts-expect-error -- pathname params are compatible across locales here
    router.replace({ pathname, params }, { locale: next });
  }

  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <Globe className={cn('h-4 w-4 shrink-0', light ? 'text-white/60' : 'text-muted-foreground')} />
        <div className="flex flex-1 gap-1.5">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => change(l)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-semibold uppercase transition-colors',
                l === locale
                  ? light
                    ? 'bg-white/15 text-white'
                    : 'bg-navy text-white'
                  : light
                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                    : 'text-muted-foreground hover:bg-navy/5 hover:text-navy',
              )}
              aria-current={l === locale}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold uppercase transition-colors',
          light ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-navy/5'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        {locale}
      </button>
      {open && (
        <ul
          className={cn(
            'absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border py-1.5 shadow-2xl backdrop-blur-xl',
            light
              ? 'border-white/20 bg-navy-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
              : 'border-border bg-white text-navy shadow-soft-lg'
          )}
          role="listbox"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                onClick={() => change(l)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-all',
                  light
                    ? l === locale
                      ? 'bg-white/15 font-semibold text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    : l === locale
                      ? 'bg-navy/5 font-semibold text-navy'
                      : 'text-muted-foreground hover:bg-navy/5 hover:text-navy'
                )}
                role="option"
                aria-selected={l === locale}
              >
                <span>{localeNames[l]}</span>
                {l === locale && <Check className="h-4 w-4 text-gold" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
