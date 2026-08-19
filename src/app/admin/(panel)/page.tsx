import Link from 'next/link';
import { ArrowRight, Inbox, Mail, Music4, Users2 } from 'lucide-react';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import { BOLIMLAR } from '@/server/admin/registr';

export const metadata = { title: 'Bosh sahifa' };

/** Prisma modellari dinamik chaqiriladi — bo'lim registridagi `model` nomi bo'yicha */
type Sanovchi = { count: (a?: unknown) => Promise<number> };

async function bolimSanoqlari() {
  const juftlar = await Promise.all(
    BOLIMLAR.map(async (b) => {
      const delegat = (db as unknown as Record<string, Sanovchi>)[b.model];
      try {
        const [jami, nashr] = await Promise.all([
          delegat.count(),
          delegat.count({ where: { published: true } }),
        ]);
        return [b.kalit, { jami, nashr }] as const;
      } catch {
        return [b.kalit, { jami: 0, nashr: 0 }] as const;
      }
    }),
  );
  return Object.fromEntries(juftlar);
}

export default async function AdminBoshSahifa() {
  const sessiya = await joriySessiya();

  const [sanoqlar, xabar, jamoaAriza, tanlovAriza, talent, obuna] = await Promise.all([
    bolimSanoqlari(),
    db.contactMessage.count({ where: { status: 'YANGI' } }),
    db.ensembleApplication.count({ where: { status: 'YANGI' } }),
    db.competitionApplication.count({ where: { status: 'YANGI' } }),
    db.talentApplication.count({ where: { status: 'YANGI' } }),
    db.subscriber.count({ where: { active: true } }),
  ]);

  const arizalar = [
    { nom: 'Aloqa xabarlari', son: xabar, ikonka: Mail },
    { nom: 'Jamoa arizalari', son: jamoaAriza, ikonka: Users2 },
    { nom: 'Tanlov arizalari', son: tanlovAriza, ikonka: Inbox },
    { nom: 'Iste’dod arizalari', son: talent, ikonka: Music4 },
  ];

  const jamiYangi = xabar + jamoaAriza + tanlovAriza + talent;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-2xl font-semibold text-navy">
          Assalomu alaykum, {sessiya?.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saytdagi barcha kontentni shu yerdan boshqarasiz. O‘zgarish saqlangan zahoti saytda
          ko‘rinadi.
        </p>
      </div>

      {/* Yangi murojaatlar */}
      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Yangi murojaatlar
          </h2>
          <Link
            href="/admin/arizalar"
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy transition-colors hover:text-gold"
          >
            Hammasi
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {arizalar.map((a) => (
            <Link
              key={a.nom}
              href="/admin/arizalar"
              className="rounded-2xl border border-border bg-white p-4 transition-colors hover:border-gold/50"
            >
              <a.ikonka className="mb-2 h-5 w-5 text-navy/40" />
              <p className="font-serif text-2xl font-semibold text-navy">{a.son}</p>
              <p className="text-xs text-muted-foreground">{a.nom}</p>
            </Link>
          ))}
        </div>

        {jamiYangi === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Yangi, ko‘rilmagan murojaat yo‘q. Obunachilar soni: {obuna} ta.
          </p>
        )}
      </section>

      {/* Kontent bo'limlari */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Kontent bo‘limlari
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BOLIMLAR.map((b) => {
            const s = sanoqlar[b.kalit] ?? { jami: 0, nashr: 0 };
            const qoralama = s.jami - s.nashr;
            return (
              <Link
                key={b.kalit}
                href={`/admin/${b.kalit}`}
                className="group rounded-2xl border border-border bg-white p-4 transition-colors hover:border-gold/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-navy">{b.nom}</p>
                  <ArrowRight className="h-4 w-4 shrink-0 text-navy/25 transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                </div>
                <p className="mt-2 font-serif text-2xl font-semibold text-navy">{s.jami}</p>
                <p className="text-xs text-muted-foreground">
                  {qoralama > 0 ? `${qoralama} ta qoralama` : 'hammasi saytda ko‘rinadi'}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
