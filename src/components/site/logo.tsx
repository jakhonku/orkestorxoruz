'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/** Real emblem (from brand PDF) + wordmark lockup. */
export function Logo({ light = false }: { light?: boolean }) {
  const t = useTranslations('Nav');
  const locale = useLocale();

  const brandName =
    locale === 'ru'
      ? 'Оркестр и Хор'
      : locale === 'en'
      ? 'Orchestra and Choir'
      : 'Orkestr va Xor';

  const subline =
    locale === 'ru'
      ? 'Творческое объединение'
      : locale === 'en'
      ? 'Creative Union'
      : 'Ijodiy birlashma';

  return (
    <Link href="/" className="group flex items-center gap-3.5" aria-label="Orkestr va Xor">
      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-navy/10">
        <Image
          src="/logo.png"
          alt="Orkestr va Xor"
          width={56}
          height={56}
          className="h-full w-full object-contain p-0.5"
          priority
        />
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span
          className={cn(
            'font-serif text-xl font-semibold tracking-tight',
            light ? 'text-white' : 'text-navy'
          )}
        >
          {brandName}
        </span>
        <span
          className={cn(
            'mt-1 text-[11px] font-medium uppercase tracking-[0.18em]',
            light ? 'text-white/60' : 'text-muted-foreground'
          )}
        >
          {subline}
        </span>
      </span>
    </Link>
  );
}
