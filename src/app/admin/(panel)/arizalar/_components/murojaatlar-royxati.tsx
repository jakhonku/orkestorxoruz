'use client';

import { useMemo, useState, useTransition } from 'react';
import { AlertCircle, ChevronDown, Mail, Phone, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  eslatmaSaqlash,
  holatOzgartirish,
  murojaatOchirish,
  type MurojaatTuri,
} from '@/server/admin/murojaatlar';

export type Murojaat = {
  id: number;
  tur: MurojaatTuri;
  sarlavha: string;
  qisqa: string;
  status: string;
  sana: string;
  eslatma: string | null;
  email: string | null;
  telefon: string | null;
  tafsilotlar: { yorliq: string; qiymat: string }[];
};

const TURLAR: { kalit: MurojaatTuri | 'hammasi'; nom: string }[] = [
  { kalit: 'hammasi', nom: 'Hammasi' },
  { kalit: 'aloqa', nom: 'Aloqa xabarlari' },
  { kalit: 'jamoa', nom: 'Jamoa arizalari' },
  { kalit: 'tanlov', nom: 'Tanlov arizalari' },
  { kalit: 'talent', nom: 'Iste’dod arizalari' },
];

const HOLATLAR: { qiymat: string; nom: string; rang: string }[] = [
  { qiymat: 'YANGI', nom: 'Yangi', rang: 'bg-gold/20 text-navy-900' },
  { qiymat: 'KORIB_CHIQILMOQDA', nom: 'Ko‘rib chiqilmoqda', rang: 'bg-blue-50 text-blue-700' },
  { qiymat: 'JAVOB_BERILDI', nom: 'Javob berildi', rang: 'bg-emerald-50 text-emerald-700' },
  { qiymat: 'RAD_ETILDI', nom: 'Rad etildi', rang: 'bg-red-50 text-red-700' },
];

export function MurojaatlarRoyxati({ murojaatlar }: { murojaatlar: Murojaat[] }) {
  const router = useRouter();
  const [tur, setTur] = useState<MurojaatTuri | 'hammasi'>('hammasi');
  const [faqatYangi, setFaqatYangi] = useState(false);
  const [ochiq, setOchiq] = useState<string | null>(null);
  const [xato, setXato] = useState<string | null>(null);
  const [kutilmoqda, boshla] = useTransition();

  const korinadigan = useMemo(
    () =>
      murojaatlar.filter(
        (m) => (tur === 'hammasi' || m.tur === tur) && (!faqatYangi || m.status === 'YANGI'),
      ),
    [murojaatlar, tur, faqatYangi],
  );

  const yangiSoni = (t: MurojaatTuri | 'hammasi') =>
    murojaatlar.filter((m) => (t === 'hammasi' || m.tur === t) && m.status === 'YANGI').length;

  function holatni(m: Murojaat, holat: string) {
    setXato(null);
    boshla(async () => {
      const natija = await holatOzgartirish(m.tur, m.id, holat as never);
      if (!natija.ok) setXato(natija.xato);
      router.refresh();
    });
  }

  function ochir(m: Murojaat) {
    setXato(null);
    boshla(async () => {
      const natija = await murojaatOchirish(m.tur, m.id);
      if (!natija.ok) setXato(natija.xato);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Turlar */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TURLAR.map((t) => {
          const yangi = yangiSoni(t.kalit);
          return (
            <button
              key={t.kalit}
              type="button"
              onClick={() => setTur(t.kalit)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                tur === t.kalit
                  ? 'bg-navy text-white'
                  : 'border border-border bg-white text-navy hover:border-gold/50',
              )}
            >
              {t.nom}
              {yangi > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px]',
                    tur === t.kalit ? 'bg-gold text-navy-900' : 'bg-gold/25 text-navy-900',
                  )}
                >
                  {yangi}
                </span>
              )}
            </button>
          );
        })}

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={faqatYangi}
            onChange={(e) => setFaqatYangi(e.target.checked)}
            className="h-3.5 w-3.5 accent-navy"
          />
          Faqat yangilari
        </label>
      </div>

      {xato && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {xato}
        </p>
      )}

      {korinadigan.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center text-sm text-muted-foreground">
          Bu bo‘limda murojaat yo‘q.
        </div>
      ) : (
        <ul className="space-y-2">
          {korinadigan.map((m) => {
            const kalit = `${m.tur}-${m.id}`;
            const holat = HOLATLAR.find((h) => h.qiymat === m.status) ?? HOLATLAR[0];
            const yoyilgan = ochiq === kalit;

            return (
              <li key={kalit} className="overflow-hidden rounded-2xl border border-border bg-white">
                <button
                  type="button"
                  onClick={() => setOchiq(yoyilgan ? null : kalit)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-navy-50/40"
                >
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                      holat.rang,
                    )}
                  >
                    {holat.nom}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy">
                      {m.sarlavha}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{m.qisqa}</span>
                  </span>

                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {m.sana}
                  </span>

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      yoyilgan && 'rotate-180',
                    )}
                  />
                </button>

                {yoyilgan && (
                  <div className="border-t border-border bg-navy-50/20 px-4 py-4">
                    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                      {m.tafsilotlar.map((t) => (
                        <div key={t.yorliq} className={t.qiymat.length > 90 ? 'sm:col-span-2' : ''}>
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t.yorliq}
                          </dt>
                          <dd className="whitespace-pre-wrap text-sm text-navy-900">{t.qiymat}</dd>
                        </div>
                      ))}
                    </dl>

                    {/* Bog'lanish */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-medium text-navy transition-colors hover:border-gold/50"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Javob yozish
                        </a>
                      )}
                      {m.telefon && (
                        <a
                          href={`tel:${m.telefon}`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-medium text-navy transition-colors hover:border-gold/50"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {m.telefon}
                        </a>
                      )}

                      <select
                        value={m.status}
                        disabled={kutilmoqda}
                        onChange={(e) => holatni(m, e.target.value)}
                        className="h-9 rounded-lg border border-input bg-white px-2 text-xs text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15"
                      >
                        {HOLATLAR.map((h) => (
                          <option key={h.qiymat} value={h.qiymat}>
                            {h.nom}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => ochir(m)}
                        disabled={kutilmoqda}
                        className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        O‘chirish
                      </button>
                    </div>

                    <Eslatma tur={m.tur} id={m.id} boshlangich={m.eslatma ?? ''} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Eslatma({
  tur,
  id,
  boshlangich,
}: {
  tur: MurojaatTuri;
  id: number;
  boshlangich: string;
}) {
  const [matn, setMatn] = useState(boshlangich);
  const [holat, setHolat] = useState<'tinch' | 'saqlanmoqda' | 'saqlandi'>('tinch');

  async function saqla() {
    if (matn === boshlangich) return;
    setHolat('saqlanmoqda');
    await eslatmaSaqlash(tur, id, matn);
    setHolat('saqlandi');
  }

  return (
    <div className="mt-4">
      <label className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Ichki eslatma
        {holat === 'saqlanmoqda' && <span className="normal-case">saqlanmoqda...</span>}
        {holat === 'saqlandi' && <span className="normal-case text-emerald-600">saqlandi</span>}
      </label>
      <textarea
        value={matn}
        onChange={(e) => {
          setMatn(e.target.value);
          setHolat('tinch');
        }}
        onBlur={saqla}
        rows={2}
        placeholder="Faqat xodimlar ko‘radi — saytda chiqmaydi"
        className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-navy-900 focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15"
      />
    </div>
  );
}
