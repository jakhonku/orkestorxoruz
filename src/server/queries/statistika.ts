import 'server-only';

import { db } from '@/lib/db';
import { toshkentSanasi } from '@/server/statistika/yozish';

export const DAVRLAR = [7, 30, 90] as const;
export type Davr = (typeof DAVRLAR)[number];

export function davrniAniqla(v: unknown): Davr {
  const n = Number(v);
  return (DAVRLAR as readonly number[]).includes(n) ? (n as Davr) : 30;
}

export type KunlikNuqta = { kun: string; korishlar: number; tashrifchilar: number };
export type Statistika = {
  davr: Davr;
  jamiKorishlar: number;
  jamiTashrifchilar: number;
  ortachaDavomiylikSek: number;
  kunlik: KunlikNuqta[];
  davlatlar: { kod: string; nom: string; soni: number }[];
  sahifalar: { yol: string; soni: number }[];
  yaratilgan: string;
};

const TZ = 'Asia/Tashkent';
/** createdAt UTC sifatida saqlanadi — Toshkent kuniga oʻtkaziladi */
const KUN = `to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE '${TZ}', 'YYYY-MM-DD')`;

function kunlarRoyxati(davr: number): string[] {
  const chiqish: string[] = [];
  const hozir = Date.now();
  for (let i = davr - 1; i >= 0; i--) chiqish.push(toshkentSanasi(new Date(hozir - i * 86_400_000)));
  return chiqish;
}

function davlatNomi(kod: string): string {
  if (kod === '??') return 'Nomaʼlum';
  try {
    return new Intl.DisplayNames(['uz'], { type: 'region' }).of(kod) ?? kod;
  } catch {
    return kod;
  }
}

export async function getStatistika(davr: Davr): Promise<Statistika> {
  const kunlar = kunlarRoyxati(davr);
  const boshi = new Date(`${kunlar[0]}T00:00:00+05:00`);

  const [kunlikQator, jami, davlatQator, sahifaQator] = await Promise.all([
    db.$queryRawUnsafe<{ kun: string; korishlar: number; tashrifchilar: number }[]>(
      `SELECT ${KUN} AS kun, count(*)::int AS korishlar, count(DISTINCT "visitorHash")::int AS tashrifchilar
       FROM page_views WHERE "createdAt" >= $1 GROUP BY 1`,
      boshi,
    ),
    db.$queryRawUnsafe<{ korishlar: number; davomiylik: number | null }[]>(
      `SELECT count(*)::int AS korishlar,
              avg("durationSec") FILTER (WHERE "durationSec" > 0)::float AS davomiylik
       FROM page_views WHERE "createdAt" >= $1`,
      boshi,
    ),
    db.$queryRawUnsafe<{ kod: string; soni: number }[]>(
      `SELECT coalesce(country, '??') AS kod, count(*)::int AS soni
       FROM page_views WHERE "createdAt" >= $1 GROUP BY 1 ORDER BY 2 DESC`,
      boshi,
    ),
    db.$queryRawUnsafe<{ yol: string; soni: number }[]>(
      `SELECT regexp_replace(path, '^/(uz|ru|en)(/|$)', '/') AS yol, count(*)::int AS soni
       FROM page_views WHERE "createdAt" >= $1 GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      boshi,
    ),
  ]);

  // Davr boʻyicha noyob tashrifchilar (kunlik hash har kuni oʻzgargani uchun kunlar yigʻindisi emas,
  // balki alohida hisoblanadi — bir kishi turli kunlarda boshqa hash oladi, shuning uchun bu
  // "kunlik noyob tashrifchilar yigʻindisi")
  const tashrifchilarYigindisi = kunlikQator.reduce((a, q) => a + q.tashrifchilar, 0);

  const kunXaritasi = new Map(kunlikQator.map((q) => [q.kun, q]));
  const kunlik = kunlar.map((kun) => ({
    kun,
    korishlar: kunXaritasi.get(kun)?.korishlar ?? 0,
    tashrifchilar: kunXaritasi.get(kun)?.tashrifchilar ?? 0,
  }));

  const TOP = 10;
  const asosiy = davlatQator.slice(0, TOP).map((q) => ({ ...q, nom: davlatNomi(q.kod) }));
  const qolgan = davlatQator.slice(TOP).reduce((a, q) => a + q.soni, 0);
  if (qolgan > 0) asosiy.push({ kod: '--', nom: 'Boshqa', soni: qolgan });

  return {
    davr,
    jamiKorishlar: jami[0]?.korishlar ?? 0,
    jamiTashrifchilar: tashrifchilarYigindisi,
    ortachaDavomiylikSek: Math.round(jami[0]?.davomiylik ?? 0),
    kunlik,
    davlatlar: asosiy,
    sahifalar: sahifaQator,
    yaratilgan: new Date().toISOString(),
  };
}

export function davomiylikMatni(sek: number): string {
  if (sek < 60) return `${sek} soniya`;
  return `${Math.floor(sek / 60)} daq ${sek % 60} son`;
}
