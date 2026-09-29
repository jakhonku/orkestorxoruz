import { db } from '@/lib/db';
import { VILOYATLAR } from '@/server/admin/registr';
import { sahifaRuxsati } from '@/server/admin/huquq';
import { qatorlar, sana, tanlovMurojaati } from '@/server/admin/tanlov-arizalari';
import { MurojaatlarRoyxati, type Murojaat } from './_components/murojaatlar-royxati';

export const metadata = { title: 'Arizalar va xabarlar' };

/** Har bir turdan eng so'nggi shuncha yozuv ko'rsatiladi */
const CHEGARA = 200;

const VILOYAT_NOMI = Object.fromEntries(VILOYATLAR.map((v) => [v.qiymat, v.yorliq]));

const JAMOA_TURI: Record<string, string> = {
  ORKESTR: 'Orkestr',
  XOR: 'Xor',
  ANSAMBL: 'Ansambl',
};

export default async function ArizalarSahifasi() {
  await sahifaRuxsati('arizalar');

  const [aloqa, jamoa, tanlov, talent] = await Promise.all([
    db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: CHEGARA }),
    db.ensembleApplication.findMany({ orderBy: { createdAt: 'desc' }, take: CHEGARA }),
    db.competitionApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: CHEGARA,
      include: { competition: { select: { title: true } } },
    }),
    db.talentApplication.findMany({ orderBy: { createdAt: 'desc' }, take: CHEGARA }),
  ]);

  const murojaatlar: Murojaat[] = [
    ...aloqa.map((r) => ({
      id: r.id,
      tur: 'aloqa' as const,
      sarlavha: r.subject,
      qisqa: `${r.name} · ${r.email}`,
      status: r.status,
      sana: sana(r.createdAt),
      eslatma: r.adminNote,
      email: r.email,
      telefon: null,
      tafsilotlar: qatorlar([
        ['Kimdan', r.name],
        ['Email', r.email],
        ['Til', r.locale.toUpperCase()],
        ['Mavzu', r.subject],
        ['Xabar', r.message],
      ]),
    })),

    ...jamoa.map((r) => ({
      id: r.id,
      tur: 'jamoa' as const,
      sarlavha: r.ensembleName,
      qisqa: `${JAMOA_TURI[r.type] ?? r.type} · ${VILOYAT_NOMI[r.region] ?? r.region} · ${r.contactName}`,
      status: r.status,
      sana: sana(r.createdAt),
      eslatma: r.adminNote,
      email: r.email,
      telefon: r.phone,
      tafsilotlar: qatorlar([
        ['Jamoa nomi', r.ensembleName],
        ['Turi', JAMOA_TURI[r.type] ?? r.type],
        ['Viloyat', VILOYAT_NOMI[r.region] ?? r.region],
        ['Shahar / tuman', r.city],
        ['Rahbar / dirijyor', r.conductor],
        ["A'zolar soni", r.memberCount],
        ["Bog'lanuvchi shaxs", r.contactName],
        ['Email', r.email],
        ['Telefon', r.phone],
        ['Til', r.locale.toUpperCase()],
        ['Xabar', r.message],
      ]),
    })),

    ...tanlov.map(tanlovMurojaati),

    ...talent.map((r) => ({
      id: r.id,
      tur: 'talent' as const,
      sarlavha: r.fullName,
      qisqa: `${r.age} yosh · ${r.instrument}`,
      status: r.status,
      sana: sana(r.createdAt),
      eslatma: r.adminNote,
      email: r.email,
      telefon: r.phone,
      tafsilotlar: qatorlar([
        ['F.I.SH.', r.fullName],
        ['Yoshi', r.age],
        ['Cholg‘u / yo‘nalish', r.instrument],
        ['Email', r.email],
        ['Telefon', r.phone],
        ['Video havolasi', r.videoUrl],
        ['Til', r.locale.toUpperCase()],
        ['O‘zi haqida', r.about],
      ]),
    })),
  ].sort((a, b) => b.sana.localeCompare(a.sana));

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold text-navy">Arizalar va xabarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saytdagi formalar orqali tushgan murojaatlar. Har birining holatini belgilab boring —
          shunda nima ko‘rilgani aniq bo‘ladi.
        </p>
      </div>

      <MurojaatlarRoyxati murojaatlar={murojaatlar} />
    </div>
  );
}
