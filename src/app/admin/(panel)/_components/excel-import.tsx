'use client';

import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Loader2, X } from 'lucide-react';

import type { Maydon } from '@/server/admin/turlar';
import {
  KOP_TILLI,
  jadvalniOqi,
  sarlavhalarRoyxati,
  type OqishNatijasi,
} from './excel-jadval';

/**
 * Takrorlanuvchi qatorlarni (tarkib, repertuar va h.k.) Excel fayldan yuklash.
 *
 * Maydon ta'rifida `excel: true` turgan bo'lsa shakl ostida ikki tugma chiqadi:
 * namuna faylni yuklab olish va to'ldirilgan faylni qaytib yuklash. Kutubxona
 * (SheetJS) faqat shu tugmalar bosilganda `import()` orqali yuklanadi — admin
 * panelning qolgan qismi undan og'irlashmaydi.
 */
export function ExcelYuklash({
  maydon,
  mavjudSoni,
  qoshish,
  almashtirish,
}: {
  maydon: Maydon;
  mavjudSoni: number;
  qoshish: (qatorlar: Record<string, unknown>[]) => void;
  almashtirish: (qatorlar: Record<string, unknown>[]) => void;
}) {
  const ichki = maydon.maydonlar ?? [];
  const sarlavhalar = sarlavhalarRoyxati(ichki);
  const faylRef = useRef<HTMLInputElement>(null);

  const [band, setBand] = useState(false);
  const [xato, setXato] = useState<string | null>(null);
  const [natija, setNatija] = useState<OqishNatijasi | null>(null);

  async function namunaYuklab() {
    setXato(null);
    setBand(true);
    try {
      const XLSX = await import('xlsx');
      const varaq = XLSX.utils.aoa_to_sheet([sarlavhalar]);
      varaq['!cols'] = sarlavhalar.map((s) => ({ wch: Math.max(16, s.length + 4) }));

      const kitob = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(kitob, varaq, 'Namuna');
      XLSX.writeFile(kitob, `${maydon.yorliq.toLowerCase()}-namuna.xlsx`);
    } catch (e) {
      setXato(e instanceof Error ? e.message : String(e));
    } finally {
      setBand(false);
    }
  }

  async function faylOqi(fayl: File) {
    setXato(null);
    setNatija(null);
    setBand(true);
    try {
      const XLSX = await import('xlsx');
      const kitob = XLSX.read(await fayl.arrayBuffer(), { type: 'array' });
      const varaqNomi = kitob.SheetNames[0];
      if (!varaqNomi) throw new Error('Faylda varaq topilmadi.');

      const jadval = XLSX.utils.sheet_to_json<Record<string, unknown>>(kitob.Sheets[varaqNomi], {
        defval: '',
        raw: false,
      });
      if (jadval.length === 0) {
        throw new Error('Fayl bo‘sh — birinchi satrda ustun sarlavhalari bo‘lishi kerak.');
      }

      const oqildi = jadvalniOqi(ichki, jadval);

      if (oqildi.qatorlar.length === 0 && oqildi.ogohlantirishlar.length === 0) {
        throw new Error(
          'Bironta ham qator o‘qilmadi. Ustun sarlavhalari mos kelmayotgan bo‘lishi mumkin — namuna faylni yuklab olib tekshiring.',
        );
      }

      setNatija(oqildi);
    } catch (e) {
      setXato(e instanceof Error ? e.message : String(e));
    } finally {
      setBand(false);
      if (faylRef.current) faylRef.current.value = '';
    }
  }

  function yop() {
    setNatija(null);
    setXato(null);
  }

  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-navy-50/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => faylRef.current?.click()}
          disabled={band}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
        >
          {band ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-3.5 w-3.5" />
          )}
          Excel’dan yuklash
        </button>

        <button
          type="button"
          onClick={namunaYuklab}
          disabled={band}
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/25 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-gold hover:bg-gold/5 disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          Namuna fayl
        </button>

        <input
          ref={faylRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void faylOqi(f);
          }}
        />
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Birinchi satr — ustun sarlavhalari: {sarlavhalar.join(' · ')}. Tilsiz ustun (masalan «
        {ichki[0]?.yorliq}») o‘zbekcha deb olinadi.
      </p>

      {xato && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{xato}</p>}

      {natija && (
        <div className="mt-3 rounded-xl border border-border bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-navy">
              {natija.qatorlar.length} ta qator o‘qildi
            </p>
            <button
              type="button"
              onClick={yop}
              title="Bekor qilish"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-navy-50 hover:text-navy"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {natija.topilmaganUstunlar.length > 0 && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Bu ustunlar faylda topilmadi va bo‘sh qoladi: {natija.topilmaganUstunlar.join(', ')}
            </p>
          )}

          {natija.ogohlantirishlar.length > 0 && (
            <ul className="mt-2 space-y-0.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {natija.ogohlantirishlar.slice(0, 8).map((o, i) => (
                <li key={i}>{o}</li>
              ))}
              {natija.ogohlantirishlar.length > 8 && (
                <li>... va yana {natija.ogohlantirishlar.length - 8} ta</li>
              )}
            </ul>
          )}

          {natija.qatorlar.length > 0 && (
            <>
              <Korish ichki={ichki} qatorlar={natija.qatorlar} />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    qoshish(natija.qatorlar);
                    yop();
                  }}
                  className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-900"
                >
                  Mavjudlariga qo‘shish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    almashtirish(natija.qatorlar);
                    yop();
                  }}
                  disabled={mavjudSoni === 0}
                  className="rounded-lg border border-navy/25 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-gold hover:bg-gold/5 disabled:opacity-40"
                >
                  Mavjud {mavjudSoni} qatorni almashtirish
                </button>
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground">
                O‘zgarish shakl saqlangandan keyin bazaga yoziladi.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** O'qilgan qatorlarning dastlabki beshtasi — nima yuklanayotganini ko'rish uchun */
function Korish({ ichki, qatorlar }: { ichki: Maydon[]; qatorlar: Record<string, unknown>[] }) {
  const korsat = ichki.slice(0, 3);

  const katak = (im: Maydon, qiymat: unknown): string => {
    if (KOP_TILLI.includes(im.tur)) {
      const v = (qiymat ?? {}) as Record<string, unknown>;
      const uz = v.uz;
      return Array.isArray(uz) ? uz.join(', ') : String(uz ?? '');
    }
    return String(qiymat ?? '');
  };

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {korsat.map((im) => (
              <th key={im.nom} className="py-1 pr-4 font-semibold">
                {im.yorliq}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-navy-900">
          {qatorlar.slice(0, 5).map((q, i) => (
            <tr key={i} className="border-t border-border">
              {korsat.map((im) => (
                <td key={im.nom} className="max-w-[220px] truncate py-1.5 pr-4">
                  {katak(im, q[im.nom])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {qatorlar.length > 5 && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          ... va yana {qatorlar.length - 5} ta qator
        </p>
      )}
    </div>
  );
}
