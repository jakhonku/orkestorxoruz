'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { db } from '@/lib/db';
import { bosSlugTanla } from '@/lib/slug';
import { ADMIN_SANOQ } from './keshlar';
import { youtubeIdAjrat, youtubeIdTogrimi } from '@/lib/youtube';
import { joriySessiya } from '@/server/auth';
import { bolimTop } from './registr';
import { boshQiymat, type Maydon, type Qiymatlar } from './turlar';
import { qatorlarTekshir, qatorlarniTozala } from './qatorlar';

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
  // Admin bosh sahifasidagi yozuvlar soni ham qayta hisoblansin
  revalidateTag(ADMIN_SANOQ);
}

// ------------------------------------------------------------------
// Qiymatlarni bazaga yozishga tayyorlash
// ------------------------------------------------------------------

function qiymatTayyorla(m: Maydon, qiymat: unknown): unknown {
  /** Bo'sh maydon: `bosh` berilgan bo'lsa o'sha, aks holda NULL */
  const bosh = () => m.bosh ?? null;

  switch (m.tur) {
    case 'raqam': {
      if (qiymat === '' || qiymat === null || qiymat === undefined) return bosh();
      const n = Number(qiymat);
      return Number.isFinite(n) ? Math.trunc(n) : bosh();
    }
    case 'belgi':
      return Boolean(qiymat);
    case 'sana':
      return qiymat ? new Date(String(qiymat)) : null;
    case 'matn':
    case 'matnKatta':
    case 'vaqt':
    case 'havola':
    case 'rasm':
    case 'fayl':
    case 'video':
    case 'tanlov': {
      const s = String(qiymat ?? '').trim();
      return s === '' ? bosh() : s;
    }
    case 'youtube': {
      // To'liq havola qo'yilgan bo'lsa ham bazaga faqat ID yoziladi
      const s = youtubeIdAjrat(String(qiymat ?? ''));
      return s === '' ? bosh() : s;
    }
    default:
      // kopTilli, kopTilliKatta, kopTilliRoyxat — jsonb ga o'zgarishsiz tushadi.
      // Qiymat umuman kelmasa bo'sh obyekt yoziladi (ustunlar NULL qabul qilmaydi).
      return qiymat ?? boshQiymat(m);
  }
}

// ------------------------------------------------------------------
// Manzil qismi (slug)
// ------------------------------------------------------------------

/**
 * Sarlavhadan bo'sh manzil qismini topadi.
 *
 * Admin panelda slug maydoni yo'q: muharrir faqat nomni yozadi, manzil
 * (masalan /jamoalar/buxoro-yoshlar-xori) shundan yasaladi. Nom band bo'lsa
 * oxiriga raqam qo'shiladi — "…-2", "…-3".
 */
async function bosSlug(d: Delegat, manba: string, qoshimchaBand: string[] = []): Promise<string> {
  const band = (
    await d.findMany({ select: { slug: true } })
  ).map((r) => String(r.slug));

  // Kodda belgilangan manzillar ham band hisoblanadi: masalan
  // /xalqaro/loyihalar — unga mos slug yozilsa, sahifa umuman ochilmaydi.
  return bosSlugTanla(manba, [...band, ...qoshimchaBand]);
}

/** Slug yasash uchun ishlatiladigan matn: ko'p tilli maydondan o'zbekchasi olinadi */
function slugManbaMatni(qiymat: unknown): string {
  if (typeof qiymat === 'string') return qiymat;
  const uz = (qiymat as { uz?: string })?.uz;
  return typeof uz === 'string' ? uz : '';
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

  const qatorXatosi = qatorlarTekshir(maydonlar, qiymatlar);
  if (qatorXatosi) return qatorXatosi;

  return uzunlikTekshir(maydonlar, qiymatlar);
}

/**
 * Matn maydonlari bazadagi ustunga sig'adimi — tekshiradi.
 * Sig'masa Postgres "value too long for the column's type" deb qaytaradi,
 * bu esa foydalanuvchiga qaysi maydon aybdorligini aytmaydi.
 */
function uzunlikTekshir(maydonlar: Maydon[], qiymatlar: Qiymatlar): string | null {
  for (const m of maydonlar) {
    if (m.tur === 'qatorlar') {
      const xom = (qiymatlar[m.nom] as Record<string, unknown>[]) ?? [];
      for (const q of xom) {
        const ichkiXato = uzunlikTekshir(m.maydonlar ?? [], q);
        if (ichkiXato) return `"${m.yorliq}": ${ichkiXato}`;
      }
      continue;
    }

    if (m.tur === 'youtube') {
      const xom = String(qiymatlar[m.nom] ?? '').trim();
      if (!xom) continue;
      if (!youtubeIdTogrimi(youtubeIdAjrat(xom))) {
        return (
          `"${m.yorliq}" — YouTube ID noto‘g‘ri. To‘liq havolani qo‘ying ` +
          `(masalan https://www.youtube.com/watch?v=jNQXAC9IVRw) yoki 11 belgili ID ni kiriting.`
        );
      }
      continue;
    }

    if (!m.uzunlik) continue;
    const qiymat = qiymatlar[m.nom];
    if (typeof qiymat !== 'string') continue;
    const uzunlik = qiymat.trim().length;
    if (uzunlik > m.uzunlik) {
      return `"${m.yorliq}" juda uzun: ${uzunlik} belgi, ruxsat etilgani — ${m.uzunlik}.`;
    }
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

      // Bo'sh qatorlar bazaga bormaydi — NOT NULL ustunlar ularni rad etardi
      const xom = qatorlarniTozala(m, qiymatlar[m.nom]);
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
      // Yaratishda NULL qiymatlar tashlab yuboriladi — bazadagi standart
      // qiymatlar (`@default`) o'z ishini qilsin
      const yangiData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null));

      // Manzil qismi sarlavhadan avtomatik yasaladi (bir marta, yaratilganda).
      // Tahrirlashda o'zgarmaydi — aks holda tarqatilgan havolalar ishlamay qoladi.
      if (bolim.slugManbasi) {
        yangiData.slug = await bosSlug(
          d,
          slugManbaMatni(qiymatlar[bolim.slugManbasi]),
          bolim.bandSluglar,
        );
      }

      const yaratilgan = await d.create({
        data: {
          ...yangiData,
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
    // Xatoni foydalanuvchi tushunadigan tilga o‘giramiz
    if (xabar.includes('too long for the column')) {
      return {
        ok: false,
        xato:
          'Maydonlardan biri juda uzun bo‘lgani uchun saqlanmadi. Qisqartiring — ' +
          'masalan "YouTube ID" maydoniga to‘liq havola emas, faqat v= dan keyingi qism yoziladi.',
      };
    }
    if (xabar.includes('Unique constraint')) {
      return {
        ok: false,
        xato:
          'Xuddi shunday yozuv allaqachon bor. Nomni biroz o‘zgartirib, qaytadan saqlang.',
      };
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
