'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2, Paperclip, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  ARIZA_FAYL_CHEGARASI,
  FAYL_TURLARI,
  arizaFaylTuri,
  type FaylQabuli,
} from '@/lib/anketa';

/**
 * Anketadagi "fayl" savoli: ishtirokchi surat yoki hujjat biriktiradi.
 *
 * Fayl brauzerdan to'g'ridan-to'g'ri yopiq Storage bucket'iga ketadi (server
 * orqali o'tmaydi). Anketaga faqat fayl yo'li yoziladi.
 */

type Holat =
  | { tur: 'bosh' }
  | { tur: 'yuklanmoqda'; foiz: number; nom: string }
  | { tur: 'tayyor'; nom: string }
  | { tur: 'xato'; matn: string };

const XATO_KALITI: Record<string, string> = {
  'too-large': 'form_fileTooLarge',
  type: 'form_fileType',
  limit: 'form_fileLimit',
  closed: 'form_fileClosed',
};

/** Foydalanuvchiga tayyor (tarjima qilingan) matn bilan xato */
class TushunarliXato extends Error {}

function storagegaQoy(imzoUrl: string, fayl: File, jarayon: (foiz: number) => void) {
  return new Promise<void>((bajarildi, xato) => {
    const sorov = new XMLHttpRequest();
    sorov.open('PUT', imzoUrl);
    sorov.upload.onprogress = (h) => {
      if (h.lengthComputable) jarayon(Math.round((h.loaded / h.total) * 100));
    };
    sorov.onload = () =>
      sorov.status >= 200 && sorov.status < 300 ? bajarildi() : xato(new Error(String(sorov.status)));
    sorov.onerror = () => xato(new Error('network'));
    // Supabase imzolangan manzil faylni shu ko'rinishda kutadi
    const forma = new FormData();
    forma.append('cacheControl', '3600');
    forma.append('', fayl);
    sorov.send(forma);
  });
}

export function ArizaFayli({
  tanlovId,
  savolId,
  qabul,
  qiymat,
  ozgartir,
  yuklanmoqda,
}: {
  tanlovId?: number;
  savolId: string;
  qabul: FaylQabuli;
  /** Yuklangan faylning yo'li (bo'sh — hali yuklanmagan) */
  qiymat: string;
  ozgartir: (yol: string) => void;
  /** Yuklash boshlanganda/tugaganda xabar beradi — yuborish tugmasi kutib turadi */
  yuklanmoqda: (ha: boolean) => void;
}) {
  const t = useTranslations('Competitions');
  const input = useRef<HTMLInputElement>(null);
  // Qadamlar orasida qaytib kelinganda fayl nomi yo'lidan tiklanadi
  // (tanlov-2/2026-09/pasport-1a2b3c4d5e6f.pdf → pasport.pdf)
  const [holat, setHolat] = useState<Holat>(() =>
    qiymat
      ? {
          tur: 'tayyor',
          nom: (qiymat.split('/').pop() ?? '').replace(/-[0-9a-f]{12}(\.\w+)$/, '$1'),
        }
      : { tur: 'bosh' },
  );

  const turlar = FAYL_TURLARI[qabul];
  const accept = [...Object.keys(turlar), ...Object.values(turlar)].join(',');

  async function tanlandi(fayl: File) {
    const tur = arizaFaylTuri(fayl.name, fayl.type);
    if (!turlar[tur]) return setHolat({ tur: 'xato', matn: t('form_fileType') });
    if (fayl.size > ARIZA_FAYL_CHEGARASI) return setHolat({ tur: 'xato', matn: t('form_fileTooLarge') });
    if (!tanlovId) return setHolat({ tur: 'xato', matn: t('form_fileError') });

    ozgartir('');
    yuklanmoqda(true);
    setHolat({ tur: 'yuklanmoqda', foiz: 0, nom: fayl.name });

    try {
      const javob = await fetch('/api/ariza/yuklash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanlovId, savolId, nom: fayl.name, tur, hajm: fayl.size }),
      });
      const natija = (await javob.json().catch(() => ({}))) as {
        imzoUrl?: string;
        yol?: string;
        tur?: string;
        xato?: string;
      };
      if (!javob.ok || !natija.imzoUrl || !natija.yol) {
        throw new TushunarliXato(t(XATO_KALITI[natija.xato ?? ''] ?? 'form_fileError'));
      }

      const yuboriladigan =
        fayl.type === natija.tur ? fayl : new File([fayl], fayl.name, { type: natija.tur });
      await storagegaQoy(natija.imzoUrl, yuboriladigan, (foiz) =>
        setHolat({ tur: 'yuklanmoqda', foiz, nom: fayl.name }),
      );

      ozgartir(natija.yol);
      setHolat({ tur: 'tayyor', nom: fayl.name });
    } catch (e) {
      const matn = e instanceof TushunarliXato ? e.message : t('form_fileError');
      setHolat({ tur: 'xato', matn });
    } finally {
      yuklanmoqda(false);
      if (input.current) input.current.value = '';
    }
  }

  function olibTashla() {
    ozgartir('');
    setHolat({ tur: 'bosh' });
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void tanlandi(f);
        }}
      />

      {holat.tur === 'tayyor' ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          <Check className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{holat.nom || t('form_fileUploaded')}</span>
          <button
            type="button"
            onClick={olibTashla}
            aria-label={t('form_fileRemove')}
            className="rounded-md p-1 text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={holat.tur === 'yuklanmoqda'}
          onClick={() => input.current?.click()}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl border border-dashed bg-white px-3.5 py-3 text-left text-sm transition-colors',
            holat.tur === 'xato' ? 'border-red-300' : 'border-input hover:border-navy/40',
          )}
        >
          {holat.tur === 'yuklanmoqda' ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-navy" />
          ) : (
            <Paperclip className="h-4 w-4 shrink-0 text-gold" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-navy">
              {holat.tur === 'yuklanmoqda' ? t('form_fileUploading') : t('form_fileChoose')}
            </span>
            {holat.tur === 'yuklanmoqda' ? (
              <>
                <span className="block truncate text-xs text-muted-foreground">{holat.nom}</span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-navy-50" aria-hidden="true">
                  <span className="block h-full w-full animate-pulse rounded-full bg-gold" />
                </span>
              </>
            ) : (
              <span className="block text-xs text-muted-foreground">{t(`form_fileTypes_${qabul}`)}</span>
            )}
          </span>
        </button>
      )}

      {holat.tur === 'xato' && <span className="mt-1 block text-xs text-red-600">{holat.matn}</span>}
    </div>
  );
}
