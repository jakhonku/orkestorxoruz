'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

/**
 * Arizalarni Excel faylga yuklab olish.
 * SheetJS faqat tugma bosilganda yuklanadi — sahifa og'irlashmaydi.
 */
export function ExcelTugmasi({
  sarlavhalar,
  qatorlar,
  faylNomi,
}: {
  sarlavhalar: string[];
  qatorlar: string[][];
  faylNomi: string;
}) {
  const [kutilmoqda, setKutilmoqda] = useState(false);

  async function yukla() {
    setKutilmoqda(true);
    try {
      const XLSX = await import('xlsx');
      const varaq = XLSX.utils.aoa_to_sheet([sarlavhalar, ...qatorlar]);
      varaq['!cols'] = sarlavhalar.map((s, i) => ({
        wch: Math.min(
          50,
          Math.max(s.length, ...qatorlar.map((q) => (q[i] ?? '').length)) + 2,
        ),
      }));
      const kitob = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(kitob, varaq, 'Arizalar');
      XLSX.writeFile(kitob, faylNomi);
    } finally {
      setKutilmoqda(false);
    }
  }

  return (
    <button
      type="button"
      onClick={yukla}
      disabled={kutilmoqda || qatorlar.length === 0}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-gold/50 disabled:opacity-50"
    >
      {kutilmoqda ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Excel’ga yuklab olish
    </button>
  );
}
