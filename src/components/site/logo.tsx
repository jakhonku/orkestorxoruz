'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/** Real emblem (from brand PDF) + wordmark lockup. */
export function Logo({ light = false }: { light?: boolean }) {
  const t = useTranslations('Nav');
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Orkestr va Xor">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-navy/10">
        <Image
          src="/logo.png"
          alt="Orkestr va Xor"
          width={48}
          height={48}
          className="h-full w-full object-contain p-0.5"
          priority
        />
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span
          className={cn(
            'font-serif text-lg font-semibold tracking-tight',
            light ? 'text-white' : 'text-navy'
          )}
        >
          Orkestr <span className="text-gold">&amp;</span> Xor
        </span>
        <span
          className={cn(
            'mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]',
            light ? 'text-white/60' : 'text-muted-foreground'
          )}
        >
          {t('home') === 'Home' ? 'Creative Union' : 'Ijodiy birlashma'}
        </span>
      </span>
    </Link>
  );
}
