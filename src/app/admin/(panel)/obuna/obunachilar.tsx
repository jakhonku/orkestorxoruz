'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Copy, Search, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { obunaAlmashtirish, obunaOchirish } from '@/server/admin/murojaatlar';

export type Obunachi = {
  id: number;
  email: string;
  locale: string;
  faol: boolean;
  sana: string;
};

export function Obunachilar({ obunachilar }: { obunachilar: Obunachi[] }) {
  const router = useRouter();
  const [qidiruv, setQidiruv] = useState('');
  const [xato, setXato] = useState<string | null>(null);
  const [nusxalandi, setNusxalandi] = useState(false);
  const [kutilmoqda, boshla] = useTransition();

  const korinadigan = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    return q ? obunachilar.filter((o) => o.email.toLowerCase().includes(q)) : obunachilar;
  }, [obunachilar, qidiruv]);

  const faolSoni = obunachilar.filter((o) => o.faol).length;

  async function nusxala() {
    const royxat = obunachilar
      .filter((o) => o.faol)
      .map((o) => o.email)
      .join(', ');
    try {
      await navigator.clipboard.writeText(royxat);
      setNusxalandi(true);
      setTimeout(() => setNusxalandi(false), 2000);
    } catch {
      setXato('Nusxalab bo‘lmadi — brauzer ruxsat bermadi.');
    }
  }

  function amal(ish: () => Promise<{ ok: boolean; xato?: string }>) {
    setXato(null);
    boshla(async () => {
      const natija = await ish();
      if (!natija.ok) setXato(natija.xato ?? 'Xatolik yuz berdi.');
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">Obunachilar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jami {obunachilar.length} ta · faol obuna: {faolSoni} ta
          </p>
        </div>

        {faolSoni > 0 && (
          <button
            type="button"
            onClick={nusxala}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-navy transition-colors hover:border-gold/50"
          >
            {nusxalandi ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {nusxalandi ? 'Nusxalandi' : 'Faol emaillarni nusxalash'}
          </button>
        )}
      </div>

      {xato && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {xato}
        </p>
      )}

      {obunachilar.length > 8 && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={qidiruv}
            onChange={(e) => setQidiruv(e.target.value)}
            placeholder="Email bo‘yicha qidirish..."
            className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-4 text-sm focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15"
          />
        </div>
      )}

      {korinadigan.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center text-sm text-muted-foreground">
          {obunachilar.length === 0 ? 'Hozircha obunachi yo‘q.' : 'Hech narsa topilmadi.'}
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
          {korinadigan.map((o) => (
            <li key={o.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={cn('min-w-0 flex-1 truncate text-sm', o.faol ? 'text-navy' : 'text-muted-foreground line-through')}>
                {o.email}
              </span>

              <span className="hidden shrink-0 rounded bg-navy-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-navy/60 sm:inline">
                {o.locale}
              </span>

              <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{o.sana}</span>

              <button
                type="button"
                disabled={kutilmoqda}
                onClick={() => amal(() => obunaAlmashtirish(o.id))}
                className={cn(
                  'h-8 shrink-0 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:opacity-60',
                  o.faol
                    ? 'border-border text-muted-foreground hover:text-navy'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
                )}
              >
                {o.faol ? 'Obunani to‘xtatish' : 'Qayta faollashtirish'}
              </button>

              <button
                type="button"
                disabled={kutilmoqda}
                onClick={() => amal(() => obunaOchirish(o.id))}
                title="O‘chirish"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
