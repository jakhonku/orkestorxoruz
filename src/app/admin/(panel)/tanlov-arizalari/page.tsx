import Link from 'next/link';
import { headers } from 'next/headers';
import { ExternalLink, FileEdit, ListChecks } from 'lucide-react';

import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { anketaniOqi, javobMatni, javoblarniOqi } from '@/lib/anketa';
import { sahifaRuxsati } from '@/server/admin/huquq';
import {
  arizaFayliHavolasi,
  sana,
  tanlovMurojaati,
  tanlovNomi,
} from '@/server/admin/tanlov-arizalari';
import { MurojaatlarRoyxati } from '../arizalar/_components/murojaatlar-royxati';
import { ExcelTugmasi } from './excel-tugmasi';

export const metadata = { title: 'Tanlov arizalari' };

/** Bitta sahifada ko'rsatiladigan eng ko'p ariza */
const CHEGARA = 1000;

const HOLAT: Record<string, { nom: string; rang: string }> = {
  OCHIQ: { nom: 'Ariza ochiq', rang: 'bg-emerald-50 text-emerald-700' },
  YOPIQ: { nom: 'Ariza yopiq', rang: 'bg-red-50 text-red-700' },
  TEZ_KUNDA: { nom: 'Tez kunda', rang: 'bg-gold/20 text-navy-900' },
};

const ARIZA_HOLATI: Record<string, string> = {
  YANGI: 'Yangi',
  KORIB_CHIQILMOQDA: 'Ko‘rib chiqilmoqda',
  JAVOB_BERILDI: 'Javob berildi',
  RAD_ETILDI: 'Rad etildi',
};

type Props = { searchParams: { tanlov?: string } };

/**
 * Tanlov va festivallarga tushgan arizalar — tanlov bo'yicha alohida.
 *
 * Tanlov admini uchun asosiy sahifa. Har bir tanlovning arizalari o'z
 * anketasidagi javoblar bilan ko'rinadi va Excel faylga yuklab olinadi.
 */
export default async function TanlovArizalariSahifasi({ searchParams }: Props) {
  await sahifaRuxsati('tanlov-arizalari');

  const [tanlovlar, sanoq, yangiSanoq] = await Promise.all([
    db.competition.findMany({
      select: { id: true, slug: true, title: true, kind: true, status: true, formFields: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
    db.competitionApplication.groupBy({ by: ['competitionId'], _count: { _all: true } }),
    db.competitionApplication.groupBy({
      by: ['competitionId'],
      where: { status: 'YANGI' },
      _count: { _all: true },
    }),
  ]);

  const soni = (id: number | null) =>
    sanoq.find((s) => s.competitionId === id)?._count._all ?? 0;
  const yangiSoni = (id: number | null) =>
    yangiSanoq.find((s) => s.competitionId === id)?._count._all ?? 0;

  const tanlanganId = Number(searchParams.tanlov);
  const tanlangan = tanlovlar.find((t) => t.id === tanlanganId) ?? null;

  const arizalar = await db.competitionApplication.findMany({
    where: tanlangan ? { competitionId: tanlangan.id } : undefined,
    orderBy: { createdAt: 'desc' },
    take: CHEGARA,
    include: { competition: { select: { title: true } } },
  });

  // Excel ustunlari: avval joriy anketa savollari, keyin anketadan keyinroq
  // olib tashlangan savollarga berilgan javoblar (eski arizalarda qolgan)
  const anketa = tanlangan ? anketaniOqi(tanlangan.formFields) : [];
  const ustunlar = new Map<string, string>(anketa.map((s) => [s.id, s.savol.uz]));
  for (const a of arizalar) {
    for (const j of javoblarniOqi(a.answers)) {
      if (!ustunlar.has(j.id)) ustunlar.set(j.id, j.savol);
    }
  }

  const sarlavhalar = [
    '№',
    'Sana',
    'Holat',
    ...(tanlangan ? [] : ['Tanlov']),
    'F.I.SH.',
    'Email',
    'Telefon',
    'Jamoa',
    'Yo‘nalish',
    ...ustunlar.values(),
    'Qo‘shimcha ma’lumot',
    'Til',
    'Ichki eslatma',
  ];

  // Excel'dagi fayl havolalari to'liq manzil bo'lishi kerak
  const h = headers();
  const asos = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host') ?? ''}`;

  const jadval = arizalar.map((a, i) => {
    const javob = new Map(
      javoblarniOqi(a.answers).map((j) => [
        j.id,
        j.tur === 'fayl' ? arizaFayliHavolasi(String(j.javob), asos) : javobMatni(j.javob),
      ]),
    );
    return [
      String(arizalar.length - i),
      sana(a.createdAt),
      ARIZA_HOLATI[a.status] ?? a.status,
      ...(tanlangan ? [] : [tanlovNomi(a) ?? '']),
      a.fullName,
      a.email,
      a.phone,
      a.ensembleName ?? '',
      a.category ?? '',
      ...[...ustunlar.keys()].map((id) => javob.get(id) ?? ''),
      a.message ?? '',
      a.locale.toUpperCase(),
      a.adminNote ?? '',
    ];
  });

  const faylNomi = tanlangan
    ? `${tanlangan.slug}-arizalar.xlsx`
    : 'tanlov-arizalari.xlsx';

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">Tanlov arizalari</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tanlov va festivallarga saytdan tushgan arizalar. Tanlovni tanlang — uning anketasi
            bo‘yicha javoblar ko‘rinadi.
          </p>
        </div>
        <ExcelTugmasi sarlavhalar={sarlavhalar} qatorlar={jadval} faylNomi={faylNomi} />
      </div>

      {/* Tanlovlar */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <Chip href="/admin/tanlov-arizalari" faol={!tanlangan} yangi={0}>
          Barchasi · {sanoq.reduce((s, x) => s + x._count._all, 0)}
        </Chip>
        {tanlovlar.map((t) => (
          <Chip
            key={t.id}
            href={`/admin/tanlov-arizalari?tanlov=${t.id}`}
            faol={tanlangan?.id === t.id}
            yangi={yangiSoni(t.id)}
          >
            {(t.title as { uz?: string })?.uz || `#${t.id}`} · {soni(t.id)}
          </Chip>
        ))}
      </div>

      {tanlangan && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              HOLAT[tanlangan.status]?.rang,
            )}
          >
            {HOLAT[tanlangan.status]?.nom}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-navy">
            <ListChecks className="h-4 w-4 text-gold" />
            {anketa.length > 0
              ? `Anketada ${anketa.length} ta savol`
              : 'Anketa tuzilmagan — oddiy ariza shakli ishlatilmoqda'}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Link
              href={`/admin/tanlovlar/${tanlangan.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-semibold text-white transition-colors hover:bg-navy-900"
            >
              <FileEdit className="h-3.5 w-3.5" />
              Anketa va holatni tahrirlash
            </Link>
            <a
              href={`/uz/tanlovlar/${tanlangan.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-medium text-navy transition-colors hover:border-gold/50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Saytda ko‘rish
            </a>
          </div>
        </div>
      )}

      {arizalar.length >= CHEGARA && (
        <p className="mb-3 text-xs text-amber-700">
          Eng so‘nggi {CHEGARA} ta ariza ko‘rsatilmoqda.
        </p>
      )}

      <MurojaatlarRoyxati turlarsiz murojaatlar={arizalar.map(tanlovMurojaati)} />
    </div>
  );
}

function Chip({
  href,
  faol,
  yangi,
  children,
}: {
  href: string;
  faol: boolean;
  yangi: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
        faol ? 'bg-navy text-white' : 'border border-border bg-white text-navy hover:border-gold/50',
      )}
    >
      {children}
      {yangi > 0 && (
        <span className={cn('rounded-full px-1.5 text-[10px]', faol ? 'bg-gold text-navy-900' : 'bg-gold/25 text-navy-900')}>
          {yangi} yangi
        </span>
      )}
    </Link>
  );
}
