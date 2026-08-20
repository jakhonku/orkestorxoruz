'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, FileText, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  TILLAR,
  boshQiymat,
  boshYozuv,
  type KopTilli,
  type KopTilliRoyxat,
  type Maydon,
} from '@/server/admin/turlar';

export const INPUT =
  'h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-navy-900 transition-colors placeholder:text-muted-foreground focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15';

export const TEXTAREA =
  'min-h-[120px] w-full rounded-lg border border-input bg-white px-3 py-2 text-sm leading-relaxed text-navy-900 transition-colors placeholder:text-muted-foreground focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15';

/* ------------------------------------------------------------------ */
/* Bitta maydon                                                        */
/* ------------------------------------------------------------------ */

export function MaydonKiritish({
  maydon,
  qiymat,
  ozgartir,
}: {
  maydon: Maydon;
  qiymat: unknown;
  ozgartir: (yangi: unknown) => void;
}) {
  // "Ha / Yo'q" maydoni — yorliq yonida turadi
  if (maydon.tur === 'belgi') {
    return (
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={Boolean(qiymat)}
          onChange={(e) => ozgartir(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-navy"
        />
        <span>
          <span className="block text-sm font-medium text-navy">{maydon.yorliq}</span>
          {maydon.izoh && (
            <span className="mt-0.5 block text-xs text-muted-foreground">{maydon.izoh}</span>
          )}
        </span>
      </label>
    );
  }

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-navy">
        {maydon.yorliq}
        {maydon.talab && <span className="text-red-500">*</span>}
      </label>

      <Boshqaruv maydon={maydon} qiymat={qiymat} ozgartir={ozgartir} />

      {maydon.izoh && <p className="mt-1.5 text-xs text-muted-foreground">{maydon.izoh}</p>}
    </div>
  );
}

function Boshqaruv({
  maydon,
  qiymat,
  ozgartir,
}: {
  maydon: Maydon;
  qiymat: unknown;
  ozgartir: (yangi: unknown) => void;
}) {
  const matn = String(qiymat ?? '');

  switch (maydon.tur) {
    case 'matnKatta':
      return <textarea value={matn} onChange={(e) => ozgartir(e.target.value)} className={TEXTAREA} />;

    case 'slug':
      return (
        <input
          value={matn}
          onChange={(e) =>
            ozgartir(
              e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/-{2,}/g, '-'),
            )
          }
          placeholder="masalan-shu-korinishda"
          className={cn(INPUT, 'font-mono')}
        />
      );

    case 'raqam':
      return (
        <input
          type="number"
          value={qiymat === null || qiymat === undefined ? '' : String(qiymat)}
          onChange={(e) => ozgartir(e.target.value === '' ? null : Number(e.target.value))}
          className={INPUT}
        />
      );

    case 'tanlov':
      return (
        <select value={matn} onChange={(e) => ozgartir(e.target.value)} className={INPUT}>
          <option value="">— tanlanmagan —</option>
          {(maydon.variantlar ?? []).map((v) => (
            <option key={v.qiymat} value={v.qiymat}>
              {v.yorliq}
            </option>
          ))}
        </select>
      );

    case 'sana':
      return (
        <input
          type="date"
          value={matn.slice(0, 10)}
          onChange={(e) => ozgartir(e.target.value)}
          className={INPUT}
        />
      );

    case 'vaqt':
      return (
        <input type="time" value={matn} onChange={(e) => ozgartir(e.target.value)} className={INPUT} />
      );

    case 'havola':
      return (
        <input
          type="url"
          value={matn}
          onChange={(e) => ozgartir(e.target.value)}
          placeholder="https://..."
          className={INPUT}
        />
      );

    case 'rasm':
      return <Rasm qiymat={matn} ozgartir={ozgartir} />;

    case 'fayl':
      return <Fayl qiymat={matn} ozgartir={ozgartir} />;

    case 'video':
      return <Fayl qiymat={matn} ozgartir={ozgartir} tur="video" />;

    case 'kopTilli':
    case 'kopTilliKatta':
      return (
        <KopTilliKiritish
          katta={maydon.tur === 'kopTilliKatta'}
          qiymat={(qiymat as KopTilli) ?? { uz: '', ru: '', en: '' }}
          ozgartir={ozgartir}
        />
      );

    case 'kopTilliRoyxat':
      return (
        <KopTilliRoyxatKiritish
          qiymat={(qiymat as KopTilliRoyxat) ?? { uz: [], ru: [], en: [] }}
          ozgartir={ozgartir}
        />
      );

    case 'qatorlar':
      return (
        <Qatorlar
          maydon={maydon}
          qatorlar={(qiymat as Record<string, unknown>[]) ?? []}
          ozgartir={ozgartir}
        />
      );

    default:
      return <input value={matn} onChange={(e) => ozgartir(e.target.value)} className={INPUT} />;
  }
}

/* ------------------------------------------------------------------ */
/* Uch tilli matn                                                      */
/* ------------------------------------------------------------------ */

function TilTugmalari({
  faol,
  tanla,
  toldirilgan,
}: {
  faol: string;
  tanla: (t: 'uz' | 'ru' | 'en') => void;
  toldirilgan: Record<string, boolean>;
}) {
  return (
    <div className="mb-1.5 flex gap-1">
      {TILLAR.map((t) => (
        <button
          key={t.kalit}
          type="button"
          onClick={() => tanla(t.kalit)}
          title={t.nom}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors',
            faol === t.kalit ? 'bg-navy text-white' : 'bg-navy-50/70 text-muted-foreground hover:text-navy',
          )}
        >
          {t.qisqa}
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              toldirilgan[t.kalit] ? 'bg-emerald-500' : 'bg-navy/15',
            )}
          />
        </button>
      ))}
    </div>
  );
}

function KopTilliKiritish({
  qiymat,
  ozgartir,
  katta,
}: {
  qiymat: KopTilli;
  ozgartir: (yangi: KopTilli) => void;
  katta: boolean;
}) {
  const [til, setTil] = useState<'uz' | 'ru' | 'en'>('uz');
  const joriy = qiymat?.[til] ?? '';

  const yoz = (v: string) => ozgartir({ ...qiymat, [til]: v });

  return (
    <div>
      <TilTugmalari
        faol={til}
        tanla={setTil}
        toldirilgan={{
          uz: Boolean(qiymat?.uz?.trim()),
          ru: Boolean(qiymat?.ru?.trim()),
          en: Boolean(qiymat?.en?.trim()),
        }}
      />
      {katta ? (
        <textarea value={joriy} onChange={(e) => yoz(e.target.value)} className={TEXTAREA} />
      ) : (
        <input value={joriy} onChange={(e) => yoz(e.target.value)} className={INPUT} />
      )}
    </div>
  );
}

function KopTilliRoyxatKiritish({
  qiymat,
  ozgartir,
}: {
  qiymat: KopTilliRoyxat;
  ozgartir: (yangi: KopTilliRoyxat) => void;
}) {
  const [til, setTil] = useState<'uz' | 'ru' | 'en'>('uz');
  const bandlar = qiymat?.[til] ?? [];

  return (
    <div>
      <TilTugmalari
        faol={til}
        tanla={setTil}
        toldirilgan={{
          uz: (qiymat?.uz ?? []).length > 0,
          ru: (qiymat?.ru ?? []).length > 0,
          en: (qiymat?.en ?? []).length > 0,
        }}
      />
      <textarea
        value={bandlar.join('\n')}
        onChange={(e) =>
          ozgartir({ ...qiymat, [til]: e.target.value.split('\n').map((s) => s.trimStart()) })
        }
        onBlur={(e) =>
          ozgartir({
            ...qiymat,
            [til]: e.target.value
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        placeholder="Har bir band — alohida qatorda"
        className={TEXTAREA}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rasm                                                                */
/* ------------------------------------------------------------------ */

function Rasm({ qiymat, ozgartir }: { qiymat: string; ozgartir: (yangi: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [xato, setXato] = useState<string | null>(null);

  async function yukla(fayl: File) {
    setXato(null);
    setYuklanmoqda(true);
    try {
      const forma = new FormData();
      forma.append('fayl', fayl);
      const javob = await fetch('/api/admin/yuklash', { method: 'POST', body: forma });
      const natija = (await javob.json()) as { url?: string; xato?: string };
      if (!javob.ok || !natija.url) throw new Error(natija.xato ?? 'Yuklab bo‘lmadi.');
      ozgartir(natija.url);
    } catch (e) {
      setXato(e instanceof Error ? e.message : 'Yuklab bo‘lmadi.');
    } finally {
      setYuklanmoqda(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-navy-50/50">
        {qiymat ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qiymat} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => ozgartir('')}
              title="Rasmni olib tashlash"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900/70 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            rasm yo‘q
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <input
          value={qiymat}
          onChange={(e) => ozgartir(e.target.value)}
          placeholder="/uploads/... yoki tashqi havola"
          className={cn(INPUT, 'font-mono text-xs')}
        />

        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            disabled={yuklanmoqda}
            onClick={() => input.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-navy transition-colors hover:border-gold/50 disabled:opacity-60"
          >
            {yuklanmoqda ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {yuklanmoqda ? 'Yuklanmoqda...' : 'Kompyuterdan yuklash'}
          </button>
          {xato && <span className="text-xs text-red-600">{xato}</span>}
        </div>

        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void yukla(f);
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hujjat (PDF, Word, Excel)                                           */
/* ------------------------------------------------------------------ */

/** Manzildan fayl nomini ajratib oladi */
function faylNomi(url: string): string {
  try {
    const yol = url.startsWith('http') ? new URL(url).pathname : url;
    return decodeURIComponent(yol.split('/').pop() ?? url);
  } catch {
    return url;
  }
}

/** Fayl turiga qarab: qaysi fayllar tanlanadi va foydalanuvchiga qanday izoh ko'rsatiladi */
const FAYL_TURLARI = {
  hujjat: {
    accept: '.pdf,.doc,.docx,.xls,.xlsx,application/pdf',
    izoh: 'PDF, Word, Excel — 20 MB gacha',
    papka: 'hujjatlar',
  },
  video: {
    accept: '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime',
    izoh: 'MP4, WEBM, MOV — 50 MB gacha',
    papka: 'videolar',
  },
} as const;

function Fayl({
  qiymat,
  ozgartir,
  tur = 'hujjat',
}: {
  qiymat: string;
  ozgartir: (yangi: string) => void;
  tur?: keyof typeof FAYL_TURLARI;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [xato, setXato] = useState<string | null>(null);
  const sozlama = FAYL_TURLARI[tur];

  async function yukla(fayl: File) {
    setXato(null);
    setYuklanmoqda(true);
    try {
      const forma = new FormData();
      forma.append('fayl', fayl);
      forma.append('papka', sozlama.papka);
      const javob = await fetch('/api/admin/yuklash', { method: 'POST', body: forma });
      const natija = (await javob.json()) as { url?: string; xato?: string };
      if (!javob.ok || !natija.url) throw new Error(natija.xato ?? 'Yuklab bo‘lmadi.');
      ozgartir(natija.url);
    } catch (e) {
      setXato(e instanceof Error ? e.message : 'Yuklab bo‘lmadi.');
    } finally {
      setYuklanmoqda(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="space-y-1.5">
      {qiymat ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-navy-50/40 px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-navy" />
          <a
            href={qiymat}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-sm text-navy underline-offset-2 hover:underline"
          >
            {faylNomi(qiymat)}
          </a>
          <button
            type="button"
            onClick={() => ozgartir('')}
            title="Faylni olib tashlash"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-white hover:text-navy"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <input
          value={qiymat}
          onChange={(e) => ozgartir(e.target.value)}
          placeholder="Fayl yuklang yoki tashqi havola qo‘ying"
          className={cn(INPUT, 'font-mono text-xs')}
        />
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={yuklanmoqda}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-navy transition-colors hover:border-gold/50 disabled:opacity-60"
        >
          {yuklanmoqda ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {yuklanmoqda ? 'Yuklanmoqda...' : qiymat ? 'Boshqa fayl yuklash' : 'Kompyuterdan yuklash'}
        </button>
        <span className="text-xs text-muted-foreground">{sozlama.izoh}</span>
        {xato && <span className="text-xs text-red-600">{xato}</span>}
      </div>

      <input
        ref={input}
        type="file"
        accept={sozlama.accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void yukla(f);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Takrorlanuvchi qatorlar                                             */
/* ------------------------------------------------------------------ */

function Qatorlar({
  maydon,
  qatorlar,
  ozgartir,
}: {
  maydon: Maydon;
  qatorlar: Record<string, unknown>[];
  ozgartir: (yangi: Record<string, unknown>[]) => void;
}) {
  const ichki = maydon.maydonlar ?? [];

  const yangilash = (i: number, nom: string, v: unknown) =>
    ozgartir(qatorlar.map((q, j) => (i === j ? { ...q, [nom]: v } : q)));

  const kochirish = (i: number, yon: -1 | 1) => {
    const j = i + yon;
    if (j < 0 || j >= qatorlar.length) return;
    const nusxa = [...qatorlar];
    [nusxa[i], nusxa[j]] = [nusxa[j], nusxa[i]];
    ozgartir(nusxa);
  };

  return (
    <div className="space-y-2.5">
      {qatorlar.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          Hozircha bo‘sh
        </p>
      )}

      {qatorlar.map((qator, i) => (
        <div key={i} className="rounded-xl border border-border bg-navy-50/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {i + 1}-qator
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => kochirish(i, -1)}
                disabled={i === 0}
                title="Yuqoriga"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-navy disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => kochirish(i, 1)}
                disabled={i === qatorlar.length - 1}
                title="Pastga"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-navy disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => ozgartir(qatorlar.filter((_, j) => j !== i))}
                title="O‘chirish"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ichki.map((im) => (
              <div key={im.nom} className={im.tur === 'rasm' ? 'sm:col-span-2' : undefined}>
                <MaydonKiritish
                  maydon={im}
                  qiymat={qator[im.nom] ?? boshQiymat(im)}
                  ozgartir={(v) => yangilash(i, im.nom, v)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => ozgartir([...qatorlar, boshYozuv(ichki)])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-navy/25 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-gold hover:bg-gold/5"
      >
        <Plus className="h-3.5 w-3.5" />
        Qator qo‘shish
      </button>
    </div>
  );
}
