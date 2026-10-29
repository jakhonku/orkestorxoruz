'use client';

import { useRef, useState } from 'react';
import { AlertCircle, FileArchive, Loader2 } from 'lucide-react';

import { boshYozuv, type Maydon, type Qiymatlar } from '@/server/admin/turlar';
import { faylYukla } from '../_lib/yuklash';
import { INPUT } from './maydon';

/**
 * ZIP ichidagi PDF notalarni birdaniga qoʻshadi.
 *
 * ZIP brauzerning oʻzida ochiladi, har bir PDF alohida Storageʼga yuklanadi va
 * roʻyxatga yangi qator boʻlib qoʻshiladi. Nota nomi PDF fayl nomidan olinadi,
 * shuning uchun nomlarni qoʻlda yozish shart emas.
 */

/** "Б. Снетков_Звёзды.pdf" -> "Б. Снетков Звёзды" */
function notaNomi(yol: string): string {
  const fayl = yol.split('/').pop() ?? yol;
  return fayl
    .replace(/\.pdf$/i, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ZipdanNota({
  ichki,
  qoshish,
}: {
  ichki: Maydon[];
  qoshish: (yangi: Qiymatlar[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [tur, setTur] = useState('');
  const [holat, setHolat] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  async function ish(zipFayl: File) {
    setXato(null);
    setYuklanmoqda(true);
    const yangi: Qiymatlar[] = [];
    const xatolar: string[] = [];

    try {
      setHolat('ZIP ochilmoqda…');
      // Kamdan-kam kerak boʻladi — sahifa ochilganda yuklanmasin
      const { default: JSZip } = await import('jszip');
      const zip = await JSZip.loadAsync(zipFayl);

      const yozuvlar = Object.values(zip.files)
        .filter(
          (f) =>
            !f.dir &&
            /\.pdf$/i.test(f.name) &&
            !f.name.startsWith('__MACOSX/') &&
            !(f.name.split('/').pop() ?? '').startsWith('._'),
        )
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      if (yozuvlar.length === 0) {
        throw new Error('ZIP ichida PDF fayl topilmadi.');
      }

      for (let i = 0; i < yozuvlar.length; i++) {
        const y = yozuvlar[i];
        const nom = notaNomi(y.name);
        setHolat(`${i + 1} / ${yozuvlar.length} — ${nom}`);
        try {
          const blob = await y.async('blob');
          const fayl = new File([blob], y.name.split('/').pop() ?? 'nota.pdf', {
            type: 'application/pdf',
          });
          const url = await faylYukla(fayl, 'notalar');

          const qator = boshYozuv(ichki);
          qator.category = { uz: tur.trim(), ru: tur.trim(), en: tur.trim() };
          qator.title = { uz: nom, ru: nom, en: nom };
          qator.fileUrl = url;
          yangi.push(qator);
        } catch (e) {
          xatolar.push(`${nom}: ${e instanceof Error ? e.message : 'yuklanmadi'}`);
        }
      }

      if (yangi.length > 0) qoshish(yangi);
      setHolat(`${yangi.length} ta nota qoʻshildi. Oxirida «Saqlash» ni bosing.`);
      if (xatolar.length > 0) setXato(xatolar.join('\n'));
    } catch (e) {
      setHolat(null);
      setXato(e instanceof Error ? e.message : 'ZIPni ochib boʻlmadi.');
    } finally {
      setYuklanmoqda(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-gold/50 bg-gold/5 p-3">
      <p className="text-xs font-semibold text-navy">ZIP dan notalarni birdaniga qoʻshish</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Turini yozing, shu turning PDF notalari solingan ZIPni tanlang — har bir PDF alohida nota
        boʻlib qoʻshiladi, nomi fayl nomidan olinadi.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          value={tur}
          onChange={(e) => setTur(e.target.value)}
          placeholder="Tur, masalan: 1-tur"
          className={`${INPUT} max-w-[200px]`}
        />
        <button
          type="button"
          disabled={yuklanmoqda || tur.trim() === ''}
          onClick={() => input.current?.click()}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-50"
        >
          {yuklanmoqda ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileArchive className="h-3.5 w-3.5" />
          )}
          ZIP tanlash
        </button>
      </div>

      {holat && <p className="mt-2 text-xs text-navy">{holat}</p>}
      {xato && (
        <p className="mt-2 flex items-start gap-1.5 whitespace-pre-line rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{xato}</span>
        </p>
      )}

      <input
        ref={input}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void ish(f);
        }}
      />
    </div>
  );
}
