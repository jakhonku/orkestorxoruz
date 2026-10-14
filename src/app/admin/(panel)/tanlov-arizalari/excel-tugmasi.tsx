'use client';

import { useState } from 'react';
import { AlertCircle, Download, Loader2 } from 'lucide-react';

/**
 * Arizalarni Excel faylga yuklab olish.
 * Fayl serverda yasaladi — rasm turidagi javoblar katak ichida rasm boʻlib chiqadi.
 * Rasmlar koʻp boʻlsa bir necha soniya ketadi.
 */
export function ExcelTugmasi({
  tanlovId,
  bosh,
}: {
  /** Bitta tanlov arizalari; berilmasa — hammasi */
  tanlovId?: number;
  /** Arizalar yoʻq — tugma ochilmaydi */
  bosh: boolean;
}) {
  const [kutilmoqda, setKutilmoqda] = useState(false);
  const [xato, setXato] = useState<string | null>(null);
  const [ogoh, setOgoh] = useState<string | null>(null);

  async function yukla() {
    setKutilmoqda(true);
    setXato(null);
    setOgoh(null);
    try {
      const javob = await fetch(`/api/admin/tanlov-excel${tanlovId ? `?tanlov=${tanlovId}` : ''}`);
      if (!javob.ok) {
        const m = await javob.json().catch(() => null);
        throw new Error(m?.xato ?? `Xatolik (${javob.status})`);
      }
      const nomi =
        /filename="([^"]+)"/.exec(javob.headers.get('content-disposition') ?? '')?.[1] ??
        'tanlov-arizalari.xlsx';
      const url = URL.createObjectURL(await javob.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = nomi;
      a.click();
      URL.revokeObjectURL(url);

      const soni = Number(javob.headers.get('x-rasm-xatolari-soni') ?? 0);
      if (soni > 0) {
        const sabab = decodeURIComponent(javob.headers.get('x-rasm-xatolari') ?? '');
        setOgoh(`${soni} ta rasm Excelʼga qoʻshilmadi (katakda havola qoldi). Sabab: ${sabab}`);
      }
    } catch (e) {
      setXato(e instanceof Error ? e.message : 'Yuklab boʻlmadi.');
    } finally {
      setKutilmoqda(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={yukla}
        disabled={kutilmoqda || bosh}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-gold/50 disabled:opacity-50"
      >
        {kutilmoqda ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {kutilmoqda ? 'Tayyorlanmoqda...' : 'Excelʼga yuklab olish'}
      </button>
      {ogoh && (
        <p className="flex max-w-md items-start gap-1.5 text-right text-xs text-amber-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {ogoh}
        </p>
      )}
      {xato && (
        <p className="flex items-center gap-1.5 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5" />
          {xato}
        </p>
      )}
    </div>
  );
}
