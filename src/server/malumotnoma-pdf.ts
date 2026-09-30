import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  PDFDocument,
  clip,
  endPath,
  popGraphicsState,
  pushGraphicsState,
  rectangle,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { javobMatni, type Javob, type Savol } from '@/lib/anketa';
import { faylOqi } from '@/server/ariza-fayllari';

/**
 * Ishtirokchi anketasi asosida "Ma'lumotnoma" PDF'i.
 *
 * Ko'rinishi rasmiy ma'lumotnoma namunasiga o'xshaydi: sarlavha, F.I.Sh.,
 * o'ng tomonda 3×4 surat, asosiy ma'lumotlar, keyin uzun bo'limlar.
 * Shu bir xil PDF ham oxirgi qadamda ko'rsatiladi, ham arizaga biriktiriladi.
 */

const A4 = { w: 595.28, h: 841.89 };
const CHET = 50;
const KENGLIK = A4.w - CHET * 2;

/** Surat yonida chiqadigan qisqa maydonlar (shu tartibda) */
const YONDAGI = ['tugilganSana', 'tugilganJoyi', 'millati', 'malumoti'];
/** Ma'lumotnomada alohida joyi bor savollar — pastda takror chiqmaydi */
const MAXSUS = new Set([...YONDAGI, 'mutaxassislik', 'mukofotlar', 'biografiya', 'asar', 'surat']);

async function shrift(nom: string): Promise<Uint8Array> {
  return readFile(path.join(process.cwd(), 'src', 'server', 'shriftlar', nom));
}

function sanaMatni(v: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('.') : v;
}

/** Shriftda yo'q belgilar PDF'ni buzmasligi uchun almashtiriladi */
function toza(s: string, f: PDFFont): string {
  let natija = '';
  for (const ch of s.replace(/\r/g, '').replace(/\t/g, ' ')) {
    if (ch === '\n') {
      natija += ch;
      continue;
    }
    try {
      f.encodeText(ch);
      natija += ch;
    } catch {
      natija += '?';
    }
  }
  return natija;
}

function qatorlarga(matn: string, f: PDFFont, olcham: number, kenglik: number): string[] {
  const chiqish: string[] = [];
  for (const abzats of matn.split('\n')) {
    let joriy = '';
    for (const soz of abzats.split(' ')) {
      const sinov = joriy ? `${joriy} ${soz}` : soz;
      if (f.widthOfTextAtSize(sinov, olcham) <= kenglik) {
        joriy = sinov;
        continue;
      }
      if (joriy) chiqish.push(joriy);
      // Juda uzun so'z (havola kabi) — bo'laklanadi
      let qolgan = soz;
      while (f.widthOfTextAtSize(qolgan, olcham) > kenglik) {
        let n = qolgan.length;
        while (n > 1 && f.widthOfTextAtSize(qolgan.slice(0, n), olcham) > kenglik) n--;
        chiqish.push(qolgan.slice(0, n));
        qolgan = qolgan.slice(n);
      }
      joriy = qolgan;
    }
    chiqish.push(joriy);
  }
  return chiqish;
}

export type MalumotnomaMalumoti = {
  fullName: string;
  savollar: Savol[];
  javoblar: Javob[];
};

export async function malumotnomaPdf({
  fullName,
  savollar,
  javoblar,
}: MalumotnomaMalumoti): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`Ma’lumotnoma — ${fullName}`);

  const oddiy = await pdf.embedFont(await shrift('DejaVuSerif.ttf'), { subset: true });
  const qalin = await pdf.embedFont(await shrift('DejaVuSerif-Bold.ttf'), { subset: true });

  const javob = new Map(javoblar.map((j) => [j.id, j]));
  const matnOl = (id: string): string => {
    const j = javob.get(id);
    if (!j || j.tur === 'fayl') return '';
    const s = savollar.find((x) => x.id === id);
    const m = javobMatni(j.javob);
    return s?.tur === 'sana' ? sanaMatni(m) : m;
  };
  const yorliqOl = (id: string, zaxira: string) =>
    savollar.find((x) => x.id === id)?.savol.uz || zaxira;

  // ---------------- surat (JPG yoki PNG) ----------------
  let rasm: PDFImage | null = null;
  const suratJavobi = javob.get('surat');
  if (suratJavobi?.tur === 'fayl') {
    const yol = String(suratJavobi.javob);
    try {
      const bayt = await faylOqi(yol);
      if (bayt && yol.endsWith('.png')) rasm = await pdf.embedPng(bayt);
      else if (bayt && yol.endsWith('.jpg')) rasm = await pdf.embedJpg(bayt);
    } catch {
      rasm = null; // o'qib bo'lmadi — surat o'rni bo'sh ramka bo'lib qoladi
    }
  }

  let sahifa: PDFPage = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - CHET;
  const qora = rgb(0.08, 0.08, 0.1);
  const kulrang = rgb(0.4, 0.4, 0.45);

  // ---------------- sarlavha ----------------
  const sarlavha = toza('MA’LUMOTNOMA', qalin);
  sahifa.drawText(sarlavha, {
    x: (A4.w - qalin.widthOfTextAtSize(sarlavha, 17)) / 2,
    y: y - 17,
    size: 17,
    font: qalin,
    color: qora,
  });
  y -= 17 + 26;

  // ---------------- jadval: chap ustun — savol, o'ng ustun — javob ----------------
  const YORLIQ_W = 150;
  const QIYMAT_W = KENGLIK - YORLIQ_W;
  const OLCHAM = 10.5;
  const QATOR_B = 14;
  const PAD = 7;
  const chiziq = rgb(0.55, 0.57, 0.62);
  const fon = rgb(0.95, 0.96, 0.98);

  // Birinchi blok: F.I.Sh. va qisqa maydonlar, o'ng tomonda esa 3×4 suratli katak
  const RASM_W = 96;
  const RASM_H = 128;
  const RASM_KATAK_W = RASM_W + 16;
  const RASM_KATAK_B = RASM_H + 16;
  // Yorliq ustuni hamma joyda bir xil — javoblar boshlanadigan chiziq tekis chiqadi
  const BOSH_YORLIQ_W = YORLIQ_W;
  const BOSH_QIYMAT_W = KENGLIK - RASM_KATAK_W - BOSH_YORLIQ_W;

  const boshQatorlar = [
    { yorliq: 'F.I.Sh.', qiymat: fullName, qalin: true },
    ...YONDAGI.map((id) => ({ yorliq: yorliqOl(id, id), qiymat: matnOl(id), qalin: false })),
  ]
    .filter((r) => r.qiymat.trim())
    .map((r) => {
      const yorliqQ = qatorlarga(toza(r.yorliq, qalin), qalin, OLCHAM, BOSH_YORLIQ_W - PAD * 2);
      const qiymatQ = qatorlarga(toza(r.qiymat, r.qalin ? qalin : oddiy), r.qalin ? qalin : oddiy, OLCHAM, BOSH_QIYMAT_W - PAD * 2);
      return {
        yorliqQ,
        qiymatQ,
        shrift: r.qalin ? qalin : oddiy,
        balandlik: Math.max(yorliqQ.length, qiymatQ.length) * QATOR_B + PAD * 2,
      };
    });

  // Suratli katak past bo'lsa — oxirgi qator cho'ziladi, blok surat balandligiga teng bo'ladi
  const boshJami = boshQatorlar.reduce((n, r) => n + r.balandlik, 0);
  if (boshJami < RASM_KATAK_B && boshQatorlar.length) {
    boshQatorlar[boshQatorlar.length - 1].balandlik += RASM_KATAK_B - boshJami;
  }
  const blokB = Math.max(boshJami, RASM_KATAK_B);

  let qy = y;
  for (const r of boshQatorlar) {
    sahifa.drawRectangle({ x: CHET, y: qy - r.balandlik, width: BOSH_YORLIQ_W, height: r.balandlik, color: fon, borderColor: chiziq, borderWidth: 0.6 });
    sahifa.drawRectangle({ x: CHET + BOSH_YORLIQ_W, y: qy - r.balandlik, width: BOSH_QIYMAT_W, height: r.balandlik, borderColor: chiziq, borderWidth: 0.6 });
    r.yorliqQ.forEach((q, k) =>
      sahifa.drawText(q, { x: CHET + PAD, y: qy - PAD - OLCHAM - k * QATOR_B + 1, size: OLCHAM, font: qalin, color: qora }),
    );
    r.qiymatQ.forEach((q, k) =>
      sahifa.drawText(q, { x: CHET + BOSH_YORLIQ_W + PAD, y: qy - PAD - OLCHAM - k * QATOR_B + 1, size: OLCHAM, font: r.shrift, color: qora }),
    );
    qy -= r.balandlik;
  }

  const katakX = A4.w - CHET - RASM_KATAK_W;
  sahifa.drawRectangle({ x: katakX, y: y - blokB, width: RASM_KATAK_W, height: blokB, borderColor: chiziq, borderWidth: 0.6 });
  const rasmX = katakX + (RASM_KATAK_W - RASM_W) / 2;
  const rasmY = y - blokB + (blokB - RASM_H) / 2;
  if (rasm) {
    // Surat cho'zilmaydi: 3×4 ramkani to'ldiradi, ortiqcha qismi kesiladi
    const olcham = Math.max(RASM_W / rasm.width, RASM_H / rasm.height);
    const w = rasm.width * olcham;
    const h = rasm.height * olcham;
    sahifa.pushOperators(pushGraphicsState(), rectangle(rasmX, rasmY, RASM_W, RASM_H), clip(), endPath());
    sahifa.drawImage(rasm, { x: rasmX + (RASM_W - w) / 2, y: rasmY + (RASM_H - h) / 2, width: w, height: h });
    sahifa.pushOperators(popGraphicsState());
  } else {
    sahifa.drawRectangle({ x: rasmX, y: rasmY, width: RASM_W, height: RASM_H, borderColor: kulrang, borderWidth: 0.6 });
    sahifa.drawText('3×4', {
      x: rasmX + (RASM_W - oddiy.widthOfTextAtSize('3×4', 10)) / 2,
      y: rasmY + RASM_H / 2 - 4,
      size: 10,
      font: oddiy,
      color: kulrang,
    });
  }
  y -= blokB;

  // Qolgan maydonlar — to'liq kenglikdagi jadval, birinchi blokning davomi
  const qator = (yorliq: string, qiymat: string) => {
    if (!qiymat.trim()) return;
    const yorliqQ = qatorlarga(toza(yorliq, qalin), qalin, OLCHAM, YORLIQ_W - PAD * 2);
    const qiymatQ = qatorlarga(toza(qiymat, oddiy), oddiy, OLCHAM, QIYMAT_W - PAD * 2);

    let boshlandi = false;
    let i = 0; // qiymat qatorlaridan qaysigacha chizildi
    while (i < qiymatQ.length || !boshlandi) {
      // Uzun javob (biografiya) sahifaga sig'masa — keyingi sahifada davom etadi
      if (y - (QATOR_B + PAD * 2) < CHET) {
        sahifa = pdf.addPage([A4.w, A4.h]);
        y = A4.h - CHET;
      }
      const sigadi = Math.floor((y - CHET - PAD * 2) / QATOR_B);
      const qiymatBo = qiymatQ.slice(i, i + Math.max(1, sigadi));
      const yorliqBo = boshlandi
        ? qatorlarga(toza(`${yorliq} …`, oddiy), oddiy, OLCHAM, YORLIQ_W - PAD * 2)
        : yorliqQ;
      const soni = Math.max(qiymatBo.length, yorliqBo.length, 1);
      const balandlik = soni * QATOR_B + PAD * 2;

      sahifa.drawRectangle({ x: CHET, y: y - balandlik, width: YORLIQ_W, height: balandlik, color: fon, borderColor: chiziq, borderWidth: 0.6 });
      sahifa.drawRectangle({ x: CHET + YORLIQ_W, y: y - balandlik, width: QIYMAT_W, height: balandlik, borderColor: chiziq, borderWidth: 0.6 });
      yorliqBo.forEach((q, k) =>
        sahifa.drawText(q, { x: CHET + PAD, y: y - PAD - OLCHAM - k * QATOR_B + 1, size: OLCHAM, font: qalin, color: qora }),
      );
      qiymatBo.forEach((q, k) =>
        sahifa.drawText(q, { x: CHET + YORLIQ_W + PAD, y: y - PAD - OLCHAM - k * QATOR_B + 1, size: OLCHAM, font: oddiy, color: qora }),
      );

      y -= balandlik;
      i += qiymatBo.length;
      boshlandi = true;
    }
  };

  const tartib = ['mutaxassislik', 'mukofotlar', 'asar', 'biografiya'];
  for (const id of tartib) {
    qator(yorliqOl(id, id), matnOl(id));
  }

  // Admin qo'shgan boshqa savollar ham ma'lumotnomadan tushib qolmasin
  for (const s of savollar) {
    if (MAXSUS.has(s.id) || s.tur === 'bolim' || s.tur === 'rozilik' || s.tur === 'fayl') continue;
    qator(s.savol.uz, matnOl(s.id));
  }

  return pdf.save();
}
