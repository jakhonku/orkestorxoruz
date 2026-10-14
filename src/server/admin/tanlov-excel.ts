import 'server-only';
import ExcelJS from 'exceljs';
import sharp from 'sharp';

import { db } from '@/lib/db';
import { javobMatni, javoblarniOqi } from '@/lib/anketa';
import { tanlovAnketasi } from '@/lib/anketa-andozalari';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ARIZA_BUCKET } from '@/lib/supabase/muhit';
import { arizaFayliHavolasi, sana, tanlovNomi } from './tanlov-arizalari';

const ARIZA_HOLATI: Record<string, string> = {
  YANGI: 'Yangi',
  KORIB_CHIQILMOQDA: 'Koʻrib chiqilmoqda',
  JAVOB_BERILDI: 'Javob berildi',
  RAD_ETILDI: 'Rad etildi',
};

/** Excelga eng koʻpi bilan shuncha ariza tushadi */
const CHEGARA = 1000;
/** Rasm katagiga sigʻadigan eng katta oʻlcham (piksel) */
const RASM_OLCHAMI = 110;
/** Rasmli qator balandligi (pt) va ustun kengligi (belgi) */
const RASM_QATORI = 90;
const RASM_USTUNI = 18;
/** Bir vaqtda nechta rasm yuklanadi */
const PARALLEL = 20;
/** Bitta rasmni yuklash uchun kutish */
const RASM_MUDDATI = 15_000;

const RASM_YOLI = /\.(jpe?g|png|webp)$/i;

/** Yopiq bucketdan rasmni olib, Excel tushunadigan kichik JPEGga aylantiradi */
async function rasmOl(havola: string | undefined): Promise<{ bayt: Buffer; en: number; boy: number } | null> {
  try {
    if (!havola) return null;
    const javob = await fetch(havola, { signal: AbortSignal.timeout(RASM_MUDDATI) });
    if (!javob.ok) return null;

    const asl = Buffer.from(await javob.arrayBuffer());
    // rotate() — telefon suratlaridagi aylantirish belgisini inobatga oladi
    const bayt = await sharp(asl, { failOn: 'none' })
      .rotate()
      .resize(RASM_OLCHAMI * 2, RASM_OLCHAMI * 2, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    const { width = 1, height = 1 } = await sharp(bayt).metadata();
    return { bayt, en: width, boy: height };
  } catch {
    return null;
  }
}

/**
 * Tanlov arizalarini Excel faylga yigʻadi. Rasm turidagi fayl javoblari
 * katakning ichida rasm boʻlib koʻrinadi; PDF va hujjatlar — bosiladigan havola.
 */
export async function arizalarExcel(
  tanlovId: number | null,
  asos: string,
): Promise<{ bayt: Buffer; faylNomi: string }> {
  const tanlov = tanlovId
    ? await db.competition.findUnique({
        where: { id: tanlovId },
        select: { slug: true, formFields: true },
      })
    : null;

  const arizalar = await db.competitionApplication.findMany({
    where: tanlov && tanlovId ? { competitionId: tanlovId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: CHEGARA,
    include: { competition: { select: { title: true } } },
  });

  // Ustunlar: avval joriy anketa savollari, keyin anketadan olib tashlangan savollar javoblari
  const anketa = tanlov ? tanlovAnketasi(tanlov.formFields) : [];
  const ustunlar = new Map<string, string>(anketa.map((s) => [s.id, s.savol.uz]));
  for (const a of arizalar) {
    for (const j of javoblarniOqi(a.answers)) {
      if (!ustunlar.has(j.id)) ustunlar.set(j.id, j.savol);
    }
  }
  const javobIdlari = [...ustunlar.keys()];

  const sarlavhalar = [
    '№',
    'Sana',
    'Holat',
    ...(tanlov ? [] : ['Tanlov']),
    'F.I.SH.',
    'Email',
    'Telefon',
    'Jamoa',
    'Yoʻnalish',
    ...ustunlar.values(),
    'Qoʻshimcha maʼlumot',
    'Til',
    'Ichki eslatma',
  ];
  // Anketa javoblari "Yoʻnalish" ustunidan keyin boshlanadi (1-asosli raqam)
  const javobUstuniBoshi = sarlavhalar.indexOf('Yoʻnalish') + 2;

  const kitob = new ExcelJS.Workbook();
  const varaq = kitob.addWorksheet('Arizalar', { views: [{ state: 'frozen', ySplit: 1 }] });

  varaq.addRow(sarlavhalar);
  const bosh = varaq.getRow(1);
  bosh.font = { bold: true };
  bosh.alignment = { vertical: 'middle', wrapText: true };
  bosh.height = 28;

  type Vazifa = { qator: number; ustun: number; yol: string };
  const vazifalar: Vazifa[] = [];

  arizalar.forEach((a, i) => {
    const javoblar = new Map(javoblarniOqi(a.answers).map((j) => [j.id, j]));

    const qator = varaq.addRow([
      arizalar.length - i,
      sana(a.createdAt),
      ARIZA_HOLATI[a.status] ?? a.status,
      ...(tanlov ? [] : [tanlovNomi(a) ?? '']),
      a.fullName,
      a.email,
      a.phone,
      a.ensembleName ?? '',
      a.category ?? '',
      ...javobIdlari.map(() => ''),
      a.message ?? '',
      a.locale.toUpperCase(),
      a.adminNote ?? '',
    ]);
    qator.alignment = { vertical: 'middle', wrapText: true };

    javobIdlari.forEach((id, k) => {
      const j = javoblar.get(id);
      if (!j) return;
      const ustun = javobUstuniBoshi + k;
      const katak = qator.getCell(ustun);

      if (j.tur === 'fayl') {
        const yol = String(j.javob);
        const havola = arizaFayliHavolasi(yol, asos);
        // Rasm yuklanmasa ham katakda havola qoladi
        katak.value = { text: RASM_YOLI.test(yol) ? 'Rasmni ochish' : 'Faylni ochish', hyperlink: havola };
        katak.font = { color: { argb: 'FF0563C1' }, underline: true };
        if (RASM_YOLI.test(yol)) vazifalar.push({ qator: qator.number, ustun, yol });
      } else {
        katak.value = javobMatni(j.javob);
      }
    });
  });

  // Ustun kengliklari
  const rasmUstunlari = new Set(vazifalar.map((v) => v.ustun));
  sarlavhalar.forEach((nom, i) => {
    const ustun = varaq.getColumn(i + 1);
    if (rasmUstunlari.has(i + 1)) {
      ustun.width = RASM_USTUNI;
      return;
    }
    let eng = nom.length;
    ustun.eachCell({ includeEmpty: false }, (c) => {
      eng = Math.max(eng, String(c.text ?? '').length);
    });
    ustun.width = Math.min(50, Math.max(8, eng + 2));
  });

  // Hamma rasm uchun vaqtinchalik havolalar bitta soʻrovda olinadi
  const havolalar = new Map<string, string>();
  if (vazifalar.length > 0) {
    const { data } = await supabaseAdmin()
      .storage.from(ARIZA_BUCKET)
      .createSignedUrls(
        vazifalar.map((v) => v.yol),
        300,
      );
    for (const x of data ?? []) if (x.path && x.signedUrl) havolalar.set(x.path, x.signedUrl);
  }

  // Rasmlar guruh-guruh parallel yuklanadi
  for (let i = 0; i < vazifalar.length; i += PARALLEL) {
    const guruh = vazifalar.slice(i, i + PARALLEL);
    const natija = await Promise.all(guruh.map((v) => rasmOl(havolalar.get(v.yol))));

    natija.forEach((r, k) => {
      if (!r) return;
      const v = guruh[k];
      const id = kitob.addImage({ buffer: r.bayt as unknown as ExcelJS.Buffer, extension: 'jpeg' });

      // Rasm katak ichiga nisbati buzilmay sigʻadi
      const olcham = Math.min(RASM_OLCHAMI / r.en, RASM_OLCHAMI / r.boy);

      varaq.getRow(v.qator).height = RASM_QATORI;
      // Rasm turgan katakdagi havola matni rasm ostida koʻrinmasin
      varaq.getCell(v.qator, v.ustun).value = null;
      varaq.addImage(id, {
        tl: { col: v.ustun - 1 + 0.05, row: v.qator - 1 + 0.05 },
        ext: { width: Math.round(r.en * olcham), height: Math.round(r.boy * olcham) },
        editAs: 'oneCell',
      });
    });
  }

  const bayt = Buffer.from(await kitob.xlsx.writeBuffer());
  const faylNomi = tanlov ? `${tanlov.slug}-arizalar.xlsx` : 'tanlov-arizalari.xlsx';
  return { bayt, faylNomi };
}
