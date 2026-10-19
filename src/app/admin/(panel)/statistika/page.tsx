import Link from 'next/link';
import { Download } from 'lucide-react';

import { sahifaRuxsati } from '@/server/admin/huquq';
import {
  DAVRLAR,
  davomiylikMatni,
  davrniAniqla,
  getStatistika,
} from '@/server/queries/statistika';
import { DavlatGrafik, Izoh, KunlikGrafik } from './grafiklar';

export const metadata = { title: 'Sayt statistikasi' };
export const dynamic = 'force-dynamic';

export default async function StatistikaSahifasi({
  searchParams,
}: {
  searchParams: { davr?: string };
}) {
  await sahifaRuxsati('statistika');
  const davr = davrniAniqla(searchParams.davr);
  const s = await getStatistika(davr);
  const bosh = s.jamiKorishlar === 0;

  const kartochkalar = [
    { nom: 'Jami koʻrishlar', qiymat: s.jamiKorishlar.toLocaleString('ru-RU') },
    { nom: 'Tashrifchilar (jami)', qiymat: s.jamiTashrifchilar.toLocaleString('ru-RU') },
    {
      nom: 'Kuniga oʻrtacha tashrifchi',
      qiymat: String(Math.round(s.jamiTashrifchilar / s.davr)),
    },
    { nom: 'Oʻrtacha turish vaqti', qiymat: s.ortachaDavomiylikSek ? davomiylikMatni(s.ortachaDavomiylikSek) : '—' },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">Sayt statistikasi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Haqiqiy tashriflar asosida. IP manzil va cookie saqlanmaydi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-navy/15 text-sm">
            {DAVRLAR.map((d) => (
              <Link
                key={d}
                href={`/admin/statistika?davr=${d}`}
                className={`px-3 py-1.5 ${d === davr ? 'bg-navy text-white' : 'text-navy hover:bg-navy/5'}`}
              >
                {d} kun
              </Link>
            ))}
          </div>
          <a
            href={`/api/admin/statistika-pdf?davr=${davr}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-navy px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            <Download className="h-4 w-4" /> PDF yuklab olish
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kartochkalar.map((k) => (
          <div key={k.nom} className="rounded-lg border border-navy/10 bg-white p-4">
            <div className="text-xs text-muted-foreground">{k.nom}</div>
            <div className="mt-1 font-serif text-2xl font-semibold text-navy">{k.qiymat}</div>
          </div>
        ))}
      </div>

      {bosh ? (
        <p className="mt-6 rounded-lg border border-dashed border-navy/20 p-8 text-center text-sm text-muted-foreground">
          Hozircha maʼlumot yoʻq. Sayt ochilgan sari statistika shu yerda paydo boʻladi.
        </p>
      ) : (
        <>
          <section className="mt-5 rounded-lg border border-navy/10 bg-white p-4 text-navy">
            <h2 className="mb-2 font-medium">Kunlik dinamika</h2>
            <KunlikGrafik kunlik={s.kunlik} />
            <Izoh />
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border border-navy/10 bg-white p-4">
              <h2 className="mb-3 font-medium text-navy">Qaysi davlatlardan</h2>
              <DavlatGrafik davlatlar={s.davlatlar} />
            </section>
            <section className="rounded-lg border border-navy/10 bg-white p-4">
              <h2 className="mb-3 font-medium text-navy">Eng koʻp koʻrilgan sahifalar</h2>
              <ul className="divide-y divide-navy/10 text-sm">
                {s.sahifalar.map((p) => (
                  <li key={p.yol} className="flex justify-between py-1.5">
                    <span className="truncate pr-3 text-navy">{p.yol}</span>
                    <span className="tabular-nums text-muted-foreground">{p.soni}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
