'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Check, Loader2, Save, Trash2 } from 'lucide-react';

import { yozuvOchirish, yozuvSaqlash } from '@/server/admin/amallar';
import { boshQiymat, type Maydon, type Qiymatlar } from '@/server/admin/turlar';
import { MaydonKiritish } from './maydon';

/** Shaklga kerak bo'ladigan bo'lim ma'lumoti (klientga uzatiladigan qismi) */
export type ShaklBolim = {
  kalit: string;
  nom: string;
  birlik: string;
  izoh?: string;
  maydonlar: Maydon[];
};

export function Shakl({
  bolim,
  id,
  boshlangich,
}: {
  bolim: ShaklBolim;
  id: number | null;
  boshlangich: Qiymatlar;
}) {
  const router = useRouter();
  const [qiymatlar, setQiymatlar] = useState<Qiymatlar>(() => {
    const boshi: Qiymatlar = {};
    for (const m of bolim.maydonlar) {
      boshi[m.nom] = boshlangich[m.nom] ?? boshQiymat(m);
    }
    return boshi;
  });

  const [xato, setXato] = useState<string | null>(null);
  const [saqlandi, setSaqlandi] = useState(false);
  const [ochirishTasdiq, setOchirishTasdiq] = useState(false);
  const [kutilmoqda, boshla] = useTransition();

  const ozgartir = (nom: string, qiymat: unknown) => {
    setSaqlandi(false);
    setQiymatlar((eski) => ({ ...eski, [nom]: qiymat }));
  };

  function saqla() {
    setXato(null);
    boshla(async () => {
      const natija = await yozuvSaqlash(bolim.kalit, id, JSON.stringify(qiymatlar));
      if (!natija.ok) {
        setXato(natija.xato);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setSaqlandi(true);
      if (id === null) {
        router.replace(`/admin/${bolim.kalit}/${natija.id}`);
      }
      router.refresh();
    });
  }

  function ochir() {
    if (id === null) return;
    setXato(null);
    boshla(async () => {
      const natija = await yozuvOchirish(bolim.kalit, id);
      if (!natija.ok) {
        setXato(natija.xato);
        setOchirishTasdiq(false);
        return;
      }
      router.push(`/admin/${bolim.kalit}`);
      router.refresh();
    });
  }

  return (
    <div className="pb-24">
      {/* Sarlavha */}
      <div className="mb-6">
        <Link
          href={`/admin/${bolim.kalit}`}
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          {bolim.nom}
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-navy">
          {id === null ? `Yangi ${bolim.birlik} qo‘shish` : `${bolim.birlik} — tahrirlash`}
        </h1>
        {bolim.izoh && <p className="mt-1 text-sm text-muted-foreground">{bolim.izoh}</p>}
      </div>

      {xato && (
        <p className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {xato}
        </p>
      )}

      {/* Maydonlar */}
      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-border bg-white p-5 sm:grid-cols-2 sm:p-6">
        {bolim.maydonlar.map((m) => (
          <div key={m.nom} className={m.yarim ? 'sm:col-span-1' : 'sm:col-span-2'}>
            <MaydonKiritish
              maydon={m}
              qiymat={qiymatlar[m.nom]}
              ozgartir={(v) => ozgartir(m.nom, v)}
            />
          </div>
        ))}
      </div>

      {/* Pastda turadigan amallar paneli */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur lg:left-72">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={saqla}
            disabled={kutilmoqda}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
          >
            {kutilmoqda ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saqlandi ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {kutilmoqda ? 'Saqlanmoqda...' : saqlandi ? 'Saqlandi' : 'Saqlash'}
          </button>

          <Link
            href={`/admin/${bolim.kalit}`}
            className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
          >
            Ro‘yxatga qaytish
          </Link>

          {id !== null && (
            <div className="ml-auto">
              {ochirishTasdiq ? (
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-muted-foreground sm:inline">Ishonchingiz komilmi?</span>
                  <button
                    type="button"
                    onClick={ochir}
                    disabled={kutilmoqda}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                  >
                    Ha, o‘chirilsin
                  </button>
                  <button
                    type="button"
                    onClick={() => setOchirishTasdiq(false)}
                    className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-medium text-navy"
                  >
                    Bekor
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setOchirishTasdiq(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  O‘chirish
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
