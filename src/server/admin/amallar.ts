'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import { bolimTop } from './registr';
import type { Maydon, Qiymatlar } from './turlar';

/**
 * Bo'limlar uchun umumiy saqlash / o'chirish amallari.
 *
 * Prisma modellari struktura jihatidan bir xil bo'lgani uchun ular
 * `db[model]` orqali dinamik chaqiriladi — shu sababli bu faylda `any`
 * ishlatiladi. Tashqi chegaralar (registr va shakl) tipli.
 */
type Delegat = {
  findMany: (a?: unknown) => Promise<Record<string, unknown>[]>;
  findUnique: (a: unknown) => Promise<Record<string, unknown> | null>;
  create: (a: unknown) => Promise<{ id: number }>;
  update: (a: unknown) => Promise<{ id: number }>;
  delete: (a: unknown) => Promise<unknown>;
  count: (a?: unknown) => Promise<number>;
};

function delegat(model: string): Delegat {
  const d = (db as unknown as Record<string, Delegat>)[model];
  if (!d) throw new Error(`Noma'lum model: ${model}`);
  return d;
}

async function ruxsat() {
  const s = await joriySessiya();
  if (!s) throw new Error('Ruxsat yo‘q. Qaytadan kiring.');
  return s;
}

/** Saytdagi barcha sahifalarni yangilaydi — o'zgarish darhol ko'rinadi */
function saytniYangilash() {
  revalidatePath('/', 'layout');
}

// ------------------------------------------------------------------
// Qiymatlarni bazaga yozishga tayyorlash
// ------------------------------------------------------------------

function qiymatTayyorla(m: Maydon, qiymat: unknown): unknown {
  switch (m.tur) {
    case 'raqam': {
      if (qiymat === '' || qiymat === null || qiymat === undefined) return null;
      const n = Number(qiymat);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    }
    case 'belgi':
      return Boolean(qiymat);
    case 'sana':
      return qiymat ? new Date(String(qiymat)) : null;
    case 'matn':
    case 'matnKatta':
    case 'slug':
    case 'vaqt':
    case 'havola':
    case 'rasm':
    case 'tanlov': {
      const s = String(qiymat ?? '').trim();
      return s === '' ? null : s;
    }
    default:
      // kopTilli, kopTilliKatta, kopTilliRoyxat — jsonb ga o'zgarishsiz tushadi
      return qiymat ?? null;
  }
}

/** Majburiy maydonlarni tekshiradi */
function tekshir(maydonlar: Maydon[], qiymatlar: Qiymatlar): string | null {
  for (const m of maydonlar) {
    if (!m.talab) continue;
    const v = qiymatlar[m.nom];

    if (m.tur === 'kopTilli' || m.tur === 'kopTilliKatta') {
      const uz = (v as { uz?: string })?.uz?.trim();
      if (!uz) return `"${m.yorliq}" — o‘zbekcha matn to‘ldirilishi shart.`;
      continue;
    }
    if (m.tur === 'kopTilliRoyxat') {
      const uz = (v as { uz?: string[] })?.uz ?? [];
      if (uz.filter((x) => x.trim()).length === 0) return `"${m.yorliq}" — kamida bitta qator kerak.`;
      continue;
    }
    if (m.tur === 'raqam') {
      if (v === null || v === undefined || v === '') return `"${m.yorliq}" to‘ldirilishi shart.`;
      continue;
    }
    if (m.tur === 'qatorlar') continue;

    if (!String(v ?? '').trim()) return `"${m.yorliq}" to‘ldirilishi shart.`;
  }
  return null;
}

export type Natija = { ok: true; id: number } | { ok: false; xato: string };

// ------------------------------------------------------------------
// Saqlash
// ------------------------------------------------------------------

export async function yozuvSaqlash(
  bolimKaliti: string,
  id: number | null,
  malumotJson: string,
): Promise<Natija> {
  try {
    await ruxsat();

    const bolim = bolimTop(bolimKaliti);
    if (!bolim) return { ok: false, xato: 'Bo‘lim topilmadi.' };

    const qiymatlar = JSON.parse(malumotJson) as Qiymatlar;

    const xato = tekshir(bolim.maydonlar, qiymatlar);
    if (xato) return { ok: false, xato };

    // Oddiy maydonlar
    const data: Record<string, unknown> = {};
    for (const m of bolim.maydonlar) {
      if (m.tur === 'qatorlar') continue;
      if (!(m.nom in qiymatlar)) continue;
      data[m.nom] = qiymatTayyorla(m, qiymatlar[m.nom]);
    }

    // Ichki jadvallar (a'zolar, repertuar, galereya...)
    const ichki: { maydon: Maydon; bogliq: string; qatorlar: Record<string, unknown>[] }[] = [];
    for (const m of bolim.maydonlar) {
      if (m.tur !== 'qatorlar') continue;
      const bogliq = bolim.bogliqlar?.[m.nom];
      if (!bogliq) continue;

      const xom = (qiymatlar[m.nom] as Record<string, unknown>[]) ?? [];
      const qatorlar = xom.map((q, i) => {
        const r: Record<string, unknown> = { sortOrder: i };
        for (const im of m.maydonlar ?? []) {
          r[im.nom] = qiymatTayyorla(im, q[im.nom]);
        }
        return r;
      });
      ichki.push({ maydon: m, bogliq, qatorlar });
    }

    const d = delegat(bolim.model);
    let yozuvId: number;

    if (id === null) {
      const yaratilgan = await d.create({
        data: {
          ...data,
          ...Object.fromEntries(ichki.map((i) => [i.bogliq, { create: i.qatorlar }])),
        },
      });
      yozuvId = yaratilgan.id;
    } else {
      // Ichki qatorlar butunlay almashtiriladi: eskisi o'chib, yangisi yoziladi
      await d.update({
        where: { id },
        data: {
          ...data,
          ...Object.fromEntries(
            ichki.map((i) => [i.bogliq, { deleteMany: {}, create: i.qatorlar }]),
          ),
        },
      });
      yozuvId = id;
    }

    saytniYangilash();
    return { ok: true, id: yozuvId };
  } catch (e) {
    const xabar = e instanceof Error ? e.message : String(e);
    // Takrorlanuvchi slug eng ko'p uchraydigan xato
    if (xabar.includes('Unique constraint') || xabar.includes('slug')) {
      return { ok: false, xato: 'Bunday manzil qismi (slug) allaqachon band. Boshqasini kiriting.' };
    }
    return { ok: false, xato: `Saqlashda xatolik: ${xabar}` };
  }
}

// ------------------------------------------------------------------
// O'chirish
// ------------------------------------------------------------------

export async function yozuvOchirish(bolimKaliti: string, id: number): Promise<Natija> {
  try {
    await ruxsat();

    const bolim = bolimTop(bolimKaliti);
    if (!bolim) return { ok: false, xato: 'Bo‘lim topilmadi.' };

    await delegat(bolim.model).delete({ where: { id } });
    saytniYangilash();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, xato: e instanceof Error ? e.message : String(e) };
  }
}

// ------------------------------------------------------------------
// Tez amallar: e'lon qilish / qoralamaga olish
// ------------------------------------------------------------------

export async function nashrAlmashtirish(bolimKaliti: string, id: number): Promise<Natija> {
  try {
    await ruxsat();

    const bolim = bolimTop(bolimKaliti);
    if (!bolim) return { ok: false, xato: 'Bo‘lim topilmadi.' };

    const d = delegat(bolim.model);
    const joriy = await d.findUnique({ where: { id }, select: { published: true } });
    if (!joriy) return { ok: false, xato: 'Yozuv topilmadi.' };

    await d.update({ where: { id }, data: { published: !joriy.published } });
    saytniYangilash();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, xato: e instanceof Error ? e.message : String(e) };
  }
}

// ------------------------------------------------------------------
// O'qish (sahifalar uchun)
// ------------------------------------------------------------------

export async function royxatOlish(bolimKaliti: string) {
  await ruxsat();
  const bolim = bolimTop(bolimKaliti);
  if (!bolim) return [];

  const rows = await delegat(bolim.model).findMany({
    orderBy: bolim.saralash ?? [{ id: 'desc' }],
  });
  return rows.map((r) => bolim.qator(r as Record<string, any>));
}

export async function yozuvOlish(bolimKaliti: string, id: number) {
  await ruxsat();
  const bolim = bolimTop(bolimKaliti);
  if (!bolim) return null;

  const ichki = Object.values(bolim.bogliqlar ?? {});
  const include = ichki.length
    ? Object.fromEntries(ichki.map((b) => [b, { orderBy: { sortOrder: 'asc' } }]))
    : undefined;

  const row = await delegat(bolim.model).findUnique({ where: { id }, ...(include ? { include } : {}) });
  if (!row) return null;

  // Sana maydonlarini shakl kutadigan YYYY-MM-DD ko'rinishiga o'giramiz
  const natija: Record<string, unknown> = { ...row };
  for (const m of bolim.maydonlar) {
    if (m.tur === 'sana' && row[m.nom]) {
      natija[m.nom] = new Date(row[m.nom] as string).toISOString().slice(0, 10);
    }
  }
  return natija;
}
