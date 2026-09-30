'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { ADMIN_TIL_KUKISI, type AdminTil } from '@/lib/admin-tarjima';

/** O'zbekcha / ruscha almashtirgich. Til cookie'da saqlanadi, sahifa qayta yuklanadi. */
export function TilTugmasi({ className }: { className?: string }) {
  // Server bergan til (html[data-til]); mount'gacha belgilanmaydi — gidratsiya mos kelishi uchun
  const [til, setTil] = useState<AdminTil | null>(null);

  useEffect(() => {
    setTil(document.documentElement.getAttribute('data-til') === 'ru' ? 'ru' : 'uz');
  }, []);

  function tanla(yangi: AdminTil) {
    if (yangi === til) return;
    try {
      document.cookie = `${ADMIN_TIL_KUKISI}=${yangi}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    } catch {
      // cookie yozib bo'lmasa til o'zgarmaydi
    }
    window.location.reload();
  }

  return (
    <div
      data-tarjima-yoq
      className={cn(
        'inline-flex rounded-lg border border-border bg-white p-0.5 text-xs font-semibold',
        className,
      )}
      role="group"
      aria-label="Til / Язык"
    >
      {(['uz', 'ru'] as const).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => tanla(k)}
          aria-pressed={til === k}
          className={cn(
            'rounded-md px-2.5 py-1 uppercase transition-colors',
            til === k ? 'bg-navy text-white' : 'text-navy hover:bg-navy/5',
          )}
        >
          {k}
        </button>
      ))}
    </div>
  );
}
