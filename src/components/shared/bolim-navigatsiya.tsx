'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type NavBolim = { id: string; nom: string; ikonka?: ReactNode };

/**
 * Sahifa bo'limlariga tez o'tish paneli. Sahifa aylantirilganda hozirgi bo'lim
 * belgilanadi, bosilganda esa shu bo'limga silliq o'tadi.
 */
export function BolimNavigatsiya({ bolimlar }: { bolimlar: NavBolim[] }) {
  const [faol, setFaol] = useState(bolimlar[0]?.id ?? '');

  useEffect(() => {
    const elementlar = bolimlar
      .map((b) => document.getElementById(b.id))
      .filter((e): e is HTMLElement => Boolean(e));

    const kuzatuvchi = new IntersectionObserver(
      (yozuvlar) => {
        // Ekranning yuqori qismiga kelgan bo'lim faol hisoblanadi
        const korinadigan = yozuvlar.filter((y) => y.isIntersecting);
        if (korinadigan.length > 0) setFaol(korinadigan[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    elementlar.forEach((e) => kuzatuvchi.observe(e));
    return () => kuzatuvchi.disconnect();
  }, [bolimlar]);

  return (
    <nav
      aria-label="Bo‘limlar"
      className="sticky top-20 z-30 border-b border-border/70 bg-white/85 backdrop-blur-md"
    >
      <div className="container no-scrollbar flex gap-2 overflow-x-auto py-3.5">
        {bolimlar.map((b, i) => {
          const joriy = faol === b.id;
          return (
            <a
              key={b.id}
              href={`#${b.id}`}
              aria-current={joriy ? 'true' : undefined}
              className={cn(
                'group flex shrink-0 items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-5 text-sm font-semibold transition-all duration-300',
                joriy
                  ? 'border-navy bg-navy text-white shadow-soft'
                  : 'border-border bg-white text-navy hover:border-gold/60 hover:bg-gold/10'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300',
                  joriy
                    ? 'bg-gold text-navy'
                    : 'bg-navy/5 text-navy group-hover:bg-gold/30'
                )}
              >
                {b.ikonka ?? String(i + 1).padStart(2, '0')}
              </span>
              {b.nom}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
