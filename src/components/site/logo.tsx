'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SITE } from '@/lib/constants';
import { cn, pick } from '@/lib/utils';
import type { Localized } from '@/types';

/**
 * Emblema + yozuv.
 *
 * Ikkala yozuv ham "Sayt sozlamalari" bo'limidan keladi: qisqa nom va uning
 * ostidagi mayda yozuv. Sozlama bo'sh qoldirilsa standart matn ishlatiladi,
 * shunda logotip hech qachon yarim bo'sh ko'rinmaydi.
 */
export function Logo({
  light = false,
  nom,
  ostidagi,
}: {
  light?: boolean;
  nom?: Localized;
  ostidagi?: Localized;
}) {
  const locale = useLocale();

  const brandName = (nom && pick(nom, locale)) || pick(SITE.shortName, locale);
  const subline = (ostidagi && pick(ostidagi, locale)) || pick(SITE.logoSubline, locale);

  return (
    <Link href="/" className="group flex items-center gap-4" aria-label={brandName}>
      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-navy/10 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/logo.png"
          alt={brandName}
          width={64}
          height={64}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span
          className={cn(
            'font-serif text-[22px] font-bold tracking-tight md:text-2xl',
            light ? 'text-white' : 'text-navy'
          )}
        >
          {brandName}
        </span>
        {subline && (
          <span
            className={cn(
              'mt-1 text-xs font-semibold uppercase tracking-[0.2em]',
              light ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {subline}
          </span>
        )}
      </span>
    </Link>
  );
}
