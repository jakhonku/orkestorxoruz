'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { db } from '@/lib/db';
import { bosSlugTanla } from '@/lib/slug';
import { ADMIN_SANOQ } from './keshlar';
import { youtubeIdAjrat, youtubeIdTogrimi } from '@/lib/youtube';
import { instagramAjrat, instagramKanonik, instagramUlashishmi } from '@/lib/instagram';
import { postHavolaKanonik, postManbasi } from '@/lib/post';
import { telegramYopiqmi } from '@/lib/telegram';
import { bolimRuxsati } from './huquq';
import { anketaXatosi, anketaniOqi } from '@/lib/anketa';
import { boyMatnOddiy, boyMatnniTozala } from '@/lib/boy-matn';
import { bolimTop } from './registr';
import { boshQiymat, talabMi, type Maydon, type Qiymatlar } from './turlar';
import { qatorlarTekshir, qatorlarniTozala } from './qatorlar';
import { toshkentdanDate, toshkentMatni } from '@/lib/muddat';

/**
 * Boʻlimlar uchun umumiy saqlash / oʻchirish amallari.
 *
 * Prisma modellari struktura jihatidan bir xil boʻlgani uchun ular
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
  if (!d) throw new Error(`Nomaʼlum model: ${model}`);
  return d;
}

/** Kirganmi va shu boʻlimga ruxsati bormi (tanlov admini faqat oʻz boʻlimiga) */
async function ruxsat(bolimKaliti: string) {
  return bolimRuxsati(bolimKaliti);
}

/** Saytdagi barcha sahifalarni yangilaydi — oʻzgarish darhol koʻrinadi */
function saytniYangilash() {
  revalidatePath('/', 'layout');
  // Admin bosh sahifasidagi yozuvlar soni ham qayta hisoblansin
  revalidateTag(ADMIN_SANOQ);
}

// ------------------------------------------------------------------
// Qiymatlarni bazaga yozishga tayyorlash
// ------------------------------------------------------------------

function qiymatTayyorla(m: Maydon, qiymat: unknown): unknown {
  /** Boʻsh maydon: `bosh` berilgan boʻlsa oʻsha, aks holda NULL */
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
    case 'sanaVaqt':
      return qiymat ? toshkentdanDate(String(qiymat)) : null;
    case 'matn':
    case 'matnKatta':
    case 'vaqt':
    case 'havola':
    case 'rasm':
    case 'fayl':
    case 'zip':
    case 'video':
    case 'tanlov': {
      const s = String(qiymat ?? '').trim();
      return s === '' ? bosh() : s;
    }
    case 'youtube': {
      // Toʻliq havola qoʻyilgan boʻlsa ham bazaga faqat ID yoziladi
      const s = youtubeIdAjrat(String(qiymat ?? ''));
      return s === '' ? bosh() : s;
    }
    case 'instagram': {
      // Har xil koʻrinishdagi havola bitta koʻrinishga keltiriladi
      const s = instagramKanonik(String(qiymat ?? ''));
      return s === '' ? bosh() : s;
    }
    case 'postHavola': {
      const s = postHavolaKanonik(String(qiymat ?? ''));
      return s === '' ? bosh() : s;
    }
    case 'anketa':
      // Mijozdan kelgan anketa qayta tozalanadi — bazaga faqat maʼlum tuzilma tushadi
      return anketaniOqi(qiymat);
    default:
      if (m.boy && qiymat && typeof qiymat === 'object') {
        // Boyitilgan matn: faqat ruxsat etilgan teglar qoladi
        const q = qiymat as Record<string, unknown>;
        return Object.fromEntries(
          ['uz', 'ru', 'en'].map((t) => {
            const h = boyMatnniTozala(String(q[t] ?? ''));
            return [t, boyMatnOddiy(h) ? h : ''];
          })
        );
      }
      // kopTilli, kopTilliKatta, kopTilliRoyxat — jsonb ga oʻzgarishsiz tushadi.
      // Qiymat umuman kelmasa boʻsh obyekt yoziladi (ustunlar NULL qabul qilmaydi).
      return qiymat ?? boshQiymat(m);
  }
}

// ------------------------------------------------------------------
// Manzil qismi (slug)
// ------------------------------------------------------------------

/**
 * Sarlavhadan boʻsh manzil qismini topadi.
 *
 * Admin panelda slug maydoni yoʻq: muharrir faqat nomni yozadi, manzil
 * (masalan /jamoalar/buxoro-yoshlar-xori) shundan yasaladi. Nom band boʻlsa
 * oxiriga raqam qoʻshiladi — "…-2", "…-3".
 */
async function bosSlug(d: Delegat, manba: string, qoshimchaBand: string[] = []): Promise<string> {
  const band = (
    await d.findMany({ select: { slug: true } })
  ).map((r) => String(r.slug));

  // Kodda belgilangan manzillar ham band hisoblanadi: masalan
  // /xalqaro/loyihalar — unga mos slug yozilsa, sahifa umuman ochilmaydi.
  return bosSlugTanla(manba, [...band, ...qoshimchaBand]);
}

/** Slug yasash uchun ishlatiladigan matn: koʻp tilli maydondan oʻzbekchasi olinadi */
function slugManbaMatni(qiymat: unknown): string {
  if (typeof qiymat === 'string') return qiymat;
  const uz = (qiymat as { uz?: string })?.uz;
  return typeof uz === 'string' ? uz : '';
}

/** Majburiy maydonlarni tekshiradi */
function tekshir(maydonlar: Maydon[], qiymatlar: Qiymatlar): string | null {
  for (const m of maydonlar) {
    if (m.tur === 'anketa') {
      const xato = anketaXatosi(anketaniOqi(qiymatlar[m.nom]));
      if (xato) return xato;
      continue;
    }

    // Baʼzi maydonlar shartli majburiy — masalan yangilikda havola qoʻyilgan
    // boʻlsa sarlavha va matn talab qilinmaydi
    if (!talabMi(m, qiymatlar, maydonlar)) continue;
    const v = qiymatlar[m.nom];

    if (m.tur === 'kopTilli' || m.tur === 'kopTilliKatta') {
      const uz = boyMatnOddiy((v as { uz?: string })?.uz ?? '');
      if (!uz) return `"${m.yorliq}" — oʻzbekcha matn toʻldirilishi shart.`;
      continue;
    }
    if (m.tur === 'kopTilliRoyxat') {
      const uz = (v as { uz?: string[] })?.uz ?? [];
      if (uz.filter((x) => x.trim()).length === 0) return `"${m.yorliq}" — kamida bitta qator kerak.`;
      continue;
    }
    if (m.tur === 'raqam') {
      if (v === null || v === undefined || v === '') return `"${m.yorliq}" toʻldirilishi shart.`;
      continue;
    }
    if (m.tur === 'qatorlar') continue;

    if (!String(v ?? '').trim()) return `"${m.yorliq}" toʻldirilishi shart.`;
  }

  const qatorXatosi = qatorlarTekshir(maydonlar, qiymatlar);
  if (qatorXatosi) return qatorXatosi;

  return uzunlikTekshir(maydonlar, qiymatlar);
}

/**
 * Matn maydonlari bazadagi ustunga sigʻadimi — tekshiradi.
 * Sigʻmasa Postgres "value too long for the column's type" deb qaytaradi,
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

    if (m.tur === 'instagram') {
      const xom = String(qiymatlar[m.nom] ?? '').trim();
      if (!xom) continue;
      if (!instagramAjrat(xom)) {
        return (
          `"${m.yorliq}" — Instagram havolasi tanilmadi. Postni brauzerda ochib, manzil ` +
          `qatoridagi havolani nusxalang (masalan https://www.instagram.com/reel/ABC123/).`
        );
      }
      continue;
    }

    if (m.tur === 'postHavola') {
      const xom = String(qiymatlar[m.nom] ?? '').trim();
      if (!xom) continue;
      if (telegramYopiqmi(xom)) {
        return (
          `"${m.yorliq}" — yopiq kanal postini saytga oʻrnatib boʻlmaydi. ` +
          `Ochiq kanaldagi postning havolasini qoʻying (https://t.me/kanal/123).`
        );
      }
      if (!postManbasi(xom)) {
        return (
          `"${m.yorliq}" — havola tanilmadi. YouTube (https://youtu.be/…), ` +
          `Instagram post/reel (https://www.instagram.com/reel/…) yoki Telegram post ` +
          `(https://t.me/kanal/123) havolasini qoʻying.`
        );
      }
      continue;
    }

    if (m.tur === 'youtube') {
      const xom = String(qiymatlar[m.nom] ?? '').trim();
      if (!xom) continue;
      if (!youtubeIdTogrimi(youtubeIdAjrat(xom))) {
        return (
          `"${m.yorliq}" — YouTube ID notoʻgʻri. Toʻliq havolani qoʻying ` +
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

/**
 * Instagram ilovasining "Ulashish" havolasi (instagram.com/share/…) ichida post
 * kodi boʻlmaydi — uni faqat ochib koʻrib bilish mumkin. Saqlashdan oldin shu
 * yerda bir marta ochib koʻriladi va haqiqiy havola bilan almashtiriladi.
 *
 * Ochib boʻlmasa qiymat tegilmaydi — tekshiruv muharrirga tushunarli xato beradi.
 */
async function ulashishHavolasiniYech(havola: string): Promise<string | null> {
  try {
    const javob = await fetch(havola, {
      redirect: 'follow',
      signal: AbortSignal.timeout(7000),
      headers: {
        // Oddiy brauzer sifatida soʻraladi — aks holda Instagram boʻsh sahifa qaytaradi
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'accept-language': 'en',
      },
    });

    // Koʻpincha oxirgi manzilning oʻzi yetarli
    if (instagramAjrat(javob.url)) return javob.url;

    // Boʻlmasa sahifa ichidagi kanonik havola qidiriladi
    const html = await javob.text();
    const moslik = html.match(/instagram\.com\\?\/(p|reel|reels|tv)\\?\/([A-Za-z0-9_-]+)/i);
    if (!moslik) return null;
    const tur = moslik[1].toLowerCase() === 'reels' ? 'reel' : moslik[1].toLowerCase();
    return `https://www.instagram.com/${tur}/${moslik[2]}/`;
  } catch {
    return null;
  }
}

/** Bitta qiymat "ulashish" havolasi boʻlsa — haqiqiy havolaga almashtiradi */
async function havolaniTuzat(
  m: Maydon,
  idish: Record<string, unknown>,
): Promise<void> {
  if (m.tur !== 'instagram' && m.tur !== 'postHavola') return;

  const xom = String(idish[m.nom] ?? '').trim();
  if (!xom || !instagramUlashishmi(xom)) return;

  const yechilgan = await ulashishHavolasiniYech(xom);
  if (yechilgan) idish[m.nom] = yechilgan;
}

/**
 * Shakldagi "ulashish" havolalarini haqiqiy havolaga almashtiradi —
 * oddiy maydonlarda ham, takrorlanuvchi qatorlar ichida ham (jamoa videolari).
 */
async function ulashishHavolalariniTuzat(maydonlar: Maydon[], qiymatlar: Qiymatlar) {
  for (const m of maydonlar) {
    if (m.tur === 'qatorlar') {
      const qatorlar = (qiymatlar[m.nom] as Record<string, unknown>[]) ?? [];
      for (const qator of qatorlar) {
        for (const im of m.maydonlar ?? []) await havolaniTuzat(im, qator);
      }
      continue;
    }

    await havolaniTuzat(m, qiymatlar as Record<string, unknown>);
  }
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
    await ruxsat(bolimKaliti);

    const bolim = bolimTop(bolimKaliti);
    if (!bolim) return { ok: false, xato: 'Boʻlim topilmadi.' };

    const qiymatlar = JSON.parse(malumotJson) as Qiymatlar;

    await ulashishHavolalariniTuzat(bolim.maydonlar, qiymatlar);

    const xato = tekshir(bolim.maydonlar, qiymatlar);
    if (xato) return { ok: false, xato };

    // Oddiy maydonlar
    const data: Record<string, unknown> = {};
    for (const m of bolim.maydonlar) {
      if (m.tur === 'qatorlar') continue;
      if (!(m.nom in qiymatlar)) continue;
      data[m.nom] = qiymatTayyorla(m, qiymatlar[m.nom]);
    }

    // Boʻlimga xos qiymatlar (masalan mahalliy ekspert belgisi) — shakldan kelmaydi
    Object.assign(data, bolim.majburiy);

    // Ichki jadvallar (aʼzolar, repertuar, galereya...)
    const ichki: { maydon: Maydon; bogliq: string; qatorlar: Record<string, unknown>[] }[] = [];
    for (const m of bolim.maydonlar) {
      if (m.tur !== 'qatorlar') continue;
      const bogliq = bolim.bogliqlar?.[m.nom];
      if (!bogliq) continue;

      // Boʻsh qatorlar bazaga bormaydi — NOT NULL ustunlar ularni rad etardi
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
      // qiymatlar (`@default`) oʻz ishini qilsin
      const yangiData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null));

      // Manzil qismi sarlavhadan avtomatik yasaladi (bir marta, yaratilganda).
      // Tahrirlashda oʻzgarmaydi — aks holda tarqatilgan havolalar ishlamay qoladi.
      if (bolim.slugManbasi) {
        // Sarlavha boʻsh boʻlsa (masalan faqat post havolasi qoʻyilgan
        // yangilik) manzil sana asosida yasaladi: yangilik-2026-09-18
        const sarlavha = slugManbaMatni(qiymatlar[bolim.slugManbasi]).trim();
        const sana = String(qiymatlar.date ?? '').slice(0, 10);
        const manba = sarlavha || (sana ? `${bolim.birlik}-${sana}` : '');

        yangiData.slug = await bosSlug(d, manba, bolim.bandSluglar);
      }

      const yaratilgan = await d.create({
        data: {
          ...yangiData,
          ...Object.fromEntries(ichki.map((i) => [i.bogliq, { create: i.qatorlar }])),
        },
      });
      yozuvId = yaratilgan.id;
    } else {
      // Ichki qatorlar butunlay almashtiriladi: eskisi oʻchib, yangisi yoziladi
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
    // Xatoni foydalanuvchi tushunadigan tilga oʻgiramiz
    if (xabar.includes('too long for the column')) {
      return {
        ok: false,
        xato:
          'Maydonlardan biri juda uzun boʻlgani uchun saqlanmadi. Qisqartiring — ' +
          'masalan "YouTube ID" maydoniga toʻliq havola emas, faqat v= dan keyingi qism yoziladi.',
      };
    }
    if (xabar.includes('Unique constraint')) {
      return {
        ok: false,
        xato:
          'Xuddi shunday yozuv allaqachon bor. Nomni biroz oʻzgartirib, qaytadan saqlang.',
      };
    }
    return { ok: false, xato: `Saqlashda xatolik: ${xabar}` };
  }
}

// ------------------------------------------------------------------
// Oʻchirish
// ------------------------------------------------------------------

export async function yozuvOchirish(bolimKaliti: string, id: number): Promise<Natija> {
  try {
    await ruxsat(bolimKaliti);

    const bolim = bolimTop(bolimKaliti);
    if (!bolim) return { ok: false, xato: 'Boʻlim topilmadi.' };

    await delegat(bolim.model).delete({ where: { id } });
    saytniYangilash();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, xato: e instanceof Error ? e.message : String(e) };
  }
}

// ------------------------------------------------------------------
// Tez amallar: eʼlon qilish / qoralamaga olish
// ------------------------------------------------------------------

export async function nashrAlmashtirish(bolimKaliti: string, id: number): Promise<Natija> {
  try {
    await ruxsat(bolimKaliti);

    const bolim = bolimTop(bolimKaliti);
    if (!bolim) return { ok: false, xato: 'Boʻlim topilmadi.' };

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

/** Sudrab tartiblangan roʻyxatni saqlaydi: yozuvning joyi — uning tartib raqami */
export async function tartibniSaqlash(bolimKaliti: string, idlar: number[]): Promise<Natija> {
  try {
    await ruxsat(bolimKaliti);

    const bolim = bolimTop(bolimKaliti);
    if (!bolim?.suriladi) return { ok: false, xato: 'Bu boʻlimda sudrab tartiblash yoʻq.' };
    if (!idlar.every((i) => Number.isInteger(i))) return { ok: false, xato: 'Notoʻgʻri roʻyxat.' };

    const d = delegat(bolim.model);
    await Promise.all(
      idlar.map((id, i) => d.update({ where: { id }, data: { sortOrder: i + 1 } })),
    );
    saytniYangilash();
    return { ok: true, id: 0 };
  } catch (e) {
    return { ok: false, xato: e instanceof Error ? e.message : String(e) };
  }
}

// ------------------------------------------------------------------
// Oʻqish (sahifalar uchun)
// ------------------------------------------------------------------

export async function royxatOlish(bolimKaliti: string) {
  await ruxsat(bolimKaliti);
  const bolim = bolimTop(bolimKaliti);
  if (!bolim) return [];

  const rows = await delegat(bolim.model).findMany({
    ...(bolim.filtr ? { where: bolim.filtr } : {}),
    orderBy: bolim.saralash ?? [{ id: 'desc' }],
  });
  return rows.map((r) => bolim.qator(r as Record<string, any>));
}

export async function yozuvOlish(bolimKaliti: string, id: number) {
  await ruxsat(bolimKaliti);
  const bolim = bolimTop(bolimKaliti);
  if (!bolim) return null;

  const ichki = Object.values(bolim.bogliqlar ?? {});
  const include = ichki.length
    ? Object.fromEntries(ichki.map((b) => [b, { orderBy: { sortOrder: 'asc' } }]))
    : undefined;

  const row = await delegat(bolim.model).findUnique({ where: { id }, ...(include ? { include } : {}) });
  if (!row) return null;

  // Sana maydonlarini shakl kutadigan YYYY-MM-DD koʻrinishiga oʻgiramiz
  const natija: Record<string, unknown> = { ...row };
  for (const m of bolim.maydonlar) {
    if (m.tur === 'sana' && row[m.nom]) {
      natija[m.nom] = new Date(row[m.nom] as string).toISOString().slice(0, 10);
    }
    if (m.tur === 'sanaVaqt' && row[m.nom]) {
      natija[m.nom] = toshkentMatni(new Date(row[m.nom] as string));
    }
  }
  return natija;
}
