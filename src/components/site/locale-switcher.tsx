'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LocaleSwitcher({ light = false }: { light?: boolean }) {
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
            'absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border py-1 shadow-soft-lg',
            light ? 'border-white/10 bg-navy-950/95' : 'border-border bg-white'
          )}
          role="listbox"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                onClick={() => change(l)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors',
                  light ? 'hover:bg-white/10' : 'hover:bg-navy/5',
                  l === locale
                    ? (light ? 'font-semibold text-white' : 'font-semibold text-navy')
                    : (light ? 'text-white/60' : 'text-muted-foreground')
                )}
                role="option"
                aria-selected={l === locale}
              >
                {localeNames[l]}
                {l === locale && <Check className="h-4 w-4 text-gold" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
