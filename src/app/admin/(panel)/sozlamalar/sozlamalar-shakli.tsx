'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Check, Loader2, Save, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { sozlamalarSaqlash } from '@/server/admin/sozlamalar';
import { telegramSinov } from '@/server/admin/telegram-sinov';
import { boshQiymat, type Maydon, type Qiymatlar } from '@/server/admin/turlar';
import { MaydonKiritish } from '../_components/maydon';

export function SozlamalarShakli({
  toplam,
  maydonlar,
  boshlangich,
}: {
  /** Qaysi shakl saqlanayotgani — server maydonlarni shu kalitdan topadi */
  toplam: string;
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
      const natija = await sozlamalarSaqlash(toplam, JSON.stringify(qiymatlar));
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
                // `v` funksiya bo'lsa — maydonning eng oxirgi qiymatidan
                // hisoblanadi (rasm yuklash kabi uzoq ishlar uchun kerak)
                setQiymatlar((eski) => ({
                  ...eski,
                  [m.nom]: typeof v === 'function' ? (v as (e: unknown) => unknown)(eski[m.nom]) : v,
                }));
              }}
            />
          </div>
        ))}
      </div>

      {toplam === 'sayt' && <TelegramSinovi />}

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

/**
 * Telegram xabarnomasini tekshirish.
 *
 * Sozlash uch qismdan iborat — bot tokeni (Vercel'da), chat ID (yuqorida) va
 * botga /start bosilgani. Qaysi biri yetishmayotganini haqiqiy ariza kelishini
 * kutmasdan bilib olish uchun shu tugma.
 */
function TelegramSinovi() {
  const [holat, setHolat] = useState<'tinch' | 'yuborilmoqda' | 'yuborildi'>('tinch');
  const [xato, setXato] = useState<string | null>(null);

  async function sinab() {
    setXato(null);
    setHolat('yuborilmoqda');
    const natija = await telegramSinov();
    if (natija.ok) {
      setHolat('yuborildi');
    } else {
      setHolat('tinch');
      setXato(natija.xato);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-navy">Telegram xabarnomasi</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Yangi ariza kelganda yuqoridagi chat ID ga xabar boradi. Sozlanganini shu
        yerda tekshirib ko‘ring — chat ID ni o‘zgartirgan bo‘lsangiz, avval Saqlang.
      </p>

      <button
        type="button"
        onClick={sinab}
        disabled={holat === 'yuborilmoqda'}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-navy/25 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-gold hover:bg-gold/5 disabled:opacity-60"
      >
        {holat === 'yuborilmoqda' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : holat === 'yuborildi' ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {holat === 'yuborilmoqda'
          ? 'Yuborilmoqda...'
          : holat === 'yuborildi'
            ? 'Yuborildi — Telegramni tekshiring'
            : 'Sinov xabari yuborish'}
      </button>

      {xato && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-relaxed text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {xato}
        </p>
      )}
    </div>
  );
}
