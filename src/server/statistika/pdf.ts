import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { davomiylikMatni, type Statistika } from '@/server/queries/statistika';

/** Statistika hisoboti: kartochkalar, chiziqli va ustunli grafik, top sahifalar. */

const A4 = { w: 595.28, h: 841.89 };
const CHET = 50;
const KENGLIK = A4.w - CHET * 2;
const KOK = rgb(0.118, 0.227, 0.373);
const OLTIN = rgb(0.788, 0.635, 0.294);
const KULRANG = rgb(0.45, 0.45, 0.5);
const CHIZIQ = rgb(0.88, 0.89, 0.92);

const shrift = (nom: string) => readFile(path.join(process.cwd(), 'src', 'server', 'shriftlar', nom));

export async function statistikaPdf(s: Statistika): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const oddiy = await pdf.embedFont(await shrift('DejaVuSerif.ttf'), { subset: true });
  const qalin = await pdf.embedFont(await shrift('DejaVuSerif-Bold.ttf'), { subset: true });

  let sahifa = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - CHET;

  const matn = (p: PDFPage, t: string, x: number, yy: number, o: number, f: PDFFont, c = KOK) =>
    p.drawText(t, { x, y: yy, size: o, font: f, color: c });
  const oʻngda = (p: PDFPage, t: string, xOng: number, yy: number, o: number, f: PDFFont, c = KULRANG) =>
    matn(p, t, xOng - f.widthOfTextAtSize(t, o), yy, o, f, c);
  const kesish = (t: string, f: PDFFont, o: number, kenglik: number) => {
    while (t.length > 1 && f.widthOfTextAtSize(t, o) > kenglik) t = t.slice(0, -2) + '…';
    return t;
  };
  const joy = (kerak: number) => {
    if (y - kerak < CHET) {
      sahifa = pdf.addPage([A4.w, A4.h]);
      y = A4.h - CHET;
    }
  };

  // Sarlavha
  matn(sahifa, 'Sayt statistikasi', CHET, y - 20, 22, qalin);
  const sana = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tashkent' }).format(new Date(s.yaratilgan));
  matn(sahifa, `Soʻnggi ${s.davr} kun · hisobot sanasi: ${sana}`, CHET, y - 40, 10, oddiy, KULRANG);
  y -= 70;

  // Kartochkalar
  const kart = [
    ['Jami koʻrishlar', s.jamiKorishlar.toLocaleString('ru-RU')],
    ['Tashrifchilar (jami)', s.jamiTashrifchilar.toLocaleString('ru-RU')],
    ['Kuniga oʻrtacha', String(Math.round(s.jamiTashrifchilar / s.davr))],
    ['Oʻrtacha turish vaqti', s.ortachaDavomiylikSek ? davomiylikMatni(s.ortachaDavomiylikSek) : '—'],
  ];
  const kw = (KENGLIK - 3 * 8) / 4;
  kart.forEach(([nom, qiymat], i) => {
    const x = CHET + i * (kw + 8);
    sahifa.drawRectangle({ x, y: y - 56, width: kw, height: 56, borderColor: CHIZIQ, borderWidth: 1 });
    matn(sahifa, kesish(nom, oddiy, 7.5, kw - 12), x + 6, y - 16, 7.5, oddiy, KULRANG);
    matn(sahifa, kesish(qiymat, qalin, 14, kw - 12), x + 6, y - 40, 14, qalin);
  });
  y -= 80;

  // Chiziqli grafik
  matn(sahifa, 'Kunlik dinamika', CHET, y, 13, qalin);
  y -= 14;
  const gh = 150;
  const gx = CHET + 28;
  const gw = KENGLIK - 28;
  const gy = y - gh; // grafik pastki chizigʻi
  const max = Math.max(1, ...s.kunlik.map((k) => k.korishlar));
  for (const p of [0, 0.5, 1]) {
    const yy = gy + gh * p;
    sahifa.drawLine({ start: { x: gx, y: yy }, end: { x: gx + gw, y: yy }, thickness: 0.5, color: CHIZIQ });
    oʻngda(sahifa, String(Math.round(max * p)), gx - 4, yy - 3, 8, oddiy);
  }
  const px = (i: number) => gx + (s.kunlik.length <= 1 ? 0 : (i * gw) / (s.kunlik.length - 1));
  const py = (v: number) => gy + (gh * v) / max;
  const chiz = (f: (k: (typeof s.kunlik)[number]) => number, rang: typeof KOK) => {
    for (let i = 1; i < s.kunlik.length; i++) {
      sahifa.drawLine({
        start: { x: px(i - 1), y: py(f(s.kunlik[i - 1])) },
        end: { x: px(i), y: py(f(s.kunlik[i])) },
        thickness: 1.6,
        color: rang,
      });
    }
  };
  chiz((k) => k.korishlar, KOK);
  chiz((k) => k.tashrifchilar, OLTIN);
  const qadam = Math.max(1, Math.ceil(s.kunlik.length / 8));
  s.kunlik.forEach((k, i) => {
    if (i % qadam) return;
    const t = k.kun.slice(5).split('-').reverse().join('.');
    matn(sahifa, t, px(i) - oddiy.widthOfTextAtSize(t, 7.5) / 2, gy - 12, 7.5, oddiy, KULRANG);
  });
  y = gy - 30;
  sahifa.drawLine({ start: { x: CHET, y: y + 4 }, end: { x: CHET + 14, y: y + 4 }, thickness: 2, color: KOK });
  matn(sahifa, 'Koʻrishlar', CHET + 18, y, 8, oddiy, KULRANG);
  sahifa.drawLine({ start: { x: CHET + 80, y: y + 4 }, end: { x: CHET + 94, y: y + 4 }, thickness: 2, color: OLTIN });
  matn(sahifa, 'Tashrifchilar', CHET + 98, y, 8, oddiy, KULRANG);
  y -= 30;

  // Davlatlar — ustunli grafik
  joy(40 + s.davlatlar.length * 20);
  matn(sahifa, 'Qaysi davlatlardan', CHET, y, 13, qalin);
  y -= 22;
  const dmax = Math.max(1, ...s.davlatlar.map((d) => d.soni));
  const jami = s.davlatlar.reduce((a, d) => a + d.soni, 0) || 1;
  const nomKeng = 130;
  const ustunKeng = KENGLIK - nomKeng - 80;
  if (s.davlatlar.length === 0) matn(sahifa, 'Maʼlumot yoʻq', CHET, y, 10, oddiy, KULRANG);
  for (const d of s.davlatlar) {
    matn(sahifa, kesish(d.nom, oddiy, 9, nomKeng - 8), CHET, y, 9, oddiy);
    sahifa.drawRectangle({
      x: CHET + nomKeng,
      y: y - 2,
      width: Math.max(1, (d.soni / dmax) * ustunKeng),
      height: 10,
      color: KOK,
    });
    matn(
      sahifa,
      `${d.soni} (${Math.round((d.soni / jami) * 100)}%)`,
      CHET + nomKeng + (d.soni / dmax) * ustunKeng + 6,
      y,
      8.5,
      oddiy,
      KULRANG,
    );
    y -= 20;
  }
  y -= 14;

  // Top sahifalar
  joy(40 + s.sahifalar.length * 18);
  matn(sahifa, 'Eng koʻp koʻrilgan sahifalar', CHET, y, 13, qalin);
  y -= 20;
  if (s.sahifalar.length === 0) matn(sahifa, 'Maʼlumot yoʻq', CHET, y, 10, oddiy, KULRANG);
  for (const p of s.sahifalar) {
    matn(sahifa, kesish(p.yol, oddiy, 9, KENGLIK - 60), CHET, y, 9, oddiy);
    oʻngda(sahifa, String(p.soni), CHET + KENGLIK, y, 9, oddiy);
    sahifa.drawLine({ start: { x: CHET, y: y - 5 }, end: { x: CHET + KENGLIK, y: y - 5 }, thickness: 0.4, color: CHIZIQ });
    y -= 18;
  }

  return pdf.save();
}
