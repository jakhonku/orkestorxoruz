'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Check, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { sozlamalarSaqlash } from '@/server/admin/sozlamalar';
import { boshQiymat, type Maydon, type Qiymatlar } from '@/server/admin/turlar';
import { MaydonKiritish } from '../_components/maydon';

export function SozlamalarShakli({
  maydonlar,
  boshlangich,
}: {
  maydonlar: Maydon[];
  boshlangich: Qiymatlar;
}) {
  const router = useRouter();
  const [qiymatlar, setQiymatlar] = useState<Qiymatlar>(() => {
    const boshi: Qiymatlar = {};
    for (const m of maydonlar) boshi[m.nom] = boshlangich[m.nom] ?? boshQiymat(m);
    return boshi;
  });

  const [xato, setXato] = useState<string | null>(null);
  const [saqlandi, setSaqlandi] = useState(false);
  const [kutilmoqda, boshla] = useTransition();

  function saqla() {
    setXato(null);
    boshla(async () => {
      const natija = await sozlamalarSaqlash(JSON.stringify(qiymatlar));
      if (!natija.ok) {
        setXato(natija.xato);
        return;
      }
      setSaqlandi(true);
      router.refresh();
    });
  }

  return (
    <div className="pb-24">
      {xato && (
        <p className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {xato}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-border bg-white p-5 sm:grid-cols-2 sm:p-6">
        {maydonlar.map((m) => (
          <div key={m.nom} className={m.yarim ? 'sm:col-span-1' : 'sm:col-span-2'}>
            <MaydonKiritish
              maydon={m}
              qiymat={qiymatlar[m.nom]}
              ozgartir={(v) => {
                setSaqlandi(false);
                setQiymatlar((eski) => ({ ...eski, [m.nom]: v }));
              }}
            />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur lg:left-72">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
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
        </div>
      </div>
    </div>
  );
}
