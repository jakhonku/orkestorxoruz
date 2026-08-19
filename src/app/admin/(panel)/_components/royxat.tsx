'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { nashrAlmashtirish, yozuvOchirish } from '@/server/admin/amallar';
import type { RoyxatQatori } from '@/server/admin/turlar';

export function Royxat({
  kalit,
  nom,
  birlik,
  izoh,
  qatorlar,
  qoshishMumkin = true,
}: {
  kalit: string;
  nom: string;
  birlik: string;
  izoh?: string;
  qatorlar: RoyxatQatori[];
  qoshishMumkin?: boolean;
}) {
  const router = useRouter();
  const [qidiruv, setQidiruv] = useState('');
  const [xato, setXato] = useState<string | null>(null);
  const [ochiriladigan, setOchiriladigan] = useState<number | null>(null);
  const [kutilmoqda, boshla] = useTransition();

  const korinadigan = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    if (!q) return qatorlar;
    return qatorlar.filter((r) =>
      `${r.sarlavha} ${r.tavsif ?? ''} ${r.belgi ?? ''}`.toLowerCase().includes(q),
    );
  }, [qatorlar, qidiruv]);

  const nashrEtilgan = qatorlar.filter((r) => r.ochiqmi !== false).length;

  function nashrni(id: number) {
    setXato(null);
    boshla(async () => {
      const natija = await nashrAlmashtirish(kalit, id);
      if (!natija.ok) setXato(natija.xato);
      router.refresh();
    });
  }

  function ochir(id: number) {
    setXato(null);
    boshla(async () => {
      const natija = await yozuvOchirish(kalit, id);
      if (!natija.ok) setXato(natija.xato);
      setOchiriladigan(null);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Sarlavha */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">{nom}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {izoh ?? `Jami ${qatorlar.length} ta · saytda ko‘rinadi: ${nashrEtilgan} ta`}
          </p>
        </div>

        {qoshishMumkin && (
          <Link
            href={`/admin/${kalit}/yangi`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-900"
          >
            <Plus className="h-4 w-4" />
            Yangi {birlik}
          </Link>
        )}
      </div>

      {xato && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {xato}
        </p>
      )}

      {/* Qidiruv */}
      {qatorlar.length > 5 && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={qidiruv}
            onChange={(e) => setQidiruv(e.target.value)}
            placeholder="Ro‘yxatdan qidirish..."
            className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-4 text-sm focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15"
          />
        </div>
      )}

      {/* Qatorlar */}
      {korinadigan.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            {qatorlar.length === 0
              ? `Hozircha birorta ${birlik} qo‘shilmagan.`
              : 'Qidiruv bo‘yicha hech narsa topilmadi.'}
          </p>
          {qatorlar.length === 0 && qoshishMumkin && (
            <Link
              href={`/admin/${kalit}/yangi`}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Birinchisini qo‘shish
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
          {korinadigan.map((r) => (
            <li
              key={r.id}
              className={cn(
                'flex items-center gap-3 px-3 py-3 transition-colors hover:bg-navy-50/40 sm:px-4',
                r.ochiqmi === false && 'bg-navy-50/20',
              )}
            >
              {/* Rasm */}
              <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-navy-50/60 sm:block">
                {r.rasm ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.rasm} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-sm text-navy/30">
                    {r.sarlavha.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Matn */}
              <Link href={`/admin/${kalit}/${r.id}`} className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-navy">
                  {r.sarlavha || '(nomsiz)'}
                  {r.belgi && (
                    <span className="shrink-0 rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-navy/70">
                      {r.belgi}
                    </span>
                  )}
                </p>
                {r.tavsif && <p className="truncate text-xs text-muted-foreground">{r.tavsif}</p>}
              </Link>

              {/* Amallar */}
              {ochiriladigan === r.id ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => ochir(r.id)}
                    disabled={kutilmoqda}
                    className="h-8 rounded-lg bg-red-600 px-2.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    O‘chirilsin
                  </button>
                  <button
                    type="button"
                    onClick={() => setOchiriladigan(null)}
                    className="h-8 rounded-lg border border-border px-2.5 text-xs font-medium text-navy"
                  >
                    Bekor
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => nashrni(r.id)}
                    disabled={kutilmoqda}
                    title={r.ochiqmi === false ? 'Saytda ko‘rsatish' : 'Qoralamaga olish'}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50',
                      r.ochiqmi === false
                        ? 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600'
                        : 'text-emerald-600 hover:bg-navy-50',
                    )}
                  >
                    {r.ochiqmi === false ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                  <Link
                    href={`/admin/${kalit}/${r.id}`}
                    title="Tahrirlash"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-navy-50 hover:text-navy"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setOchiriladigan(r.id)}
                    title="O‘chirish"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
