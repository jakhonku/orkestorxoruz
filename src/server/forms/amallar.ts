'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { db } from '@/lib/db';
import { ensembleTypeToDb, regionToDb } from '@/server/enums';
import type { EnsembleType, Region } from '@/types';

/**
 * Saytdagi formalar bazaga shu yerdan yoziladi.
 *
 * Xato matnlari qaytarilmaydi — faqat kod qaytadi, matnni klient o'z tilida
 * ko'rsatadi (sayt uch tilli, server esa foydalanuvchi tilini bilmasligi mumkin).
 */

export type XatoKodi = 'tekshiruv' | 'limit' | 'xato';
export type FormaNatija = { ok: true } | { ok: false; kod: XatoKodi };

const XATO: FormaNatija = { ok: false, kod: 'xato' };
const TEKSHIRUV: FormaNatija = { ok: false, kod: 'tekshiruv' };

// ------------------------------------------------------------------
// Spamdan himoya
// ------------------------------------------------------------------

/** Bitta IP dan 10 daqiqada nechta ariza qabul qilinadi */
const CHEGARA = 5;
const OYNA_MS = 10 * 60 * 1000;

/**
 * Oddiy xotiradagi hisoblagich. Bitta Node jarayoni uchun ishlaydi (VDS) —
 * bir nechta nusxa ishlaganda Redis kerak bo'ladi.
 */
const soqbolgan = new Map<string, number[]>();

function limitdanOshdimi(): boolean {
  const h = headers();
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'nomalum').split(',')[0].trim();

  const hozir = Date.now();
  const oldingi = (soqbolgan.get(ip) ?? []).filter((v) => hozir - v < OYNA_MS);

  if (oldingi.length >= CHEGARA) {
    soqbolgan.set(ip, oldingi);
    return true;
  }

  oldingi.push(hozir);
  soqbolgan.set(ip, oldingi);

  // Xotira o'smasligi uchun eskirgan yozuvlarni tozalab turamiz
  if (soqbolgan.size > 500) {
    for (const [k, v] of soqbolgan) {
      if (v.every((t) => hozir - t >= OYNA_MS)) soqbolgan.delete(k);
    }
  }
  return false;
}

// ------------------------------------------------------------------
// Umumiy tekshiruvlar
// ------------------------------------------------------------------

const email = z
  .string()
  .trim()
  .max(160)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

const matn = (eng = 1, kop = 200) => z.string().trim().min(eng).max(kop);
const ixtiyoriy = (kop = 200) => z.string().trim().max(kop).optional().default('');

const til = z.enum(['uz', 'ru', 'en']);

/** Robotlar to'ldiradigan yashirin maydon — bo'sh bo'lishi shart */
const tuzoq = z.string().max(0).optional().default('');

/** Bo'sh matn o'rniga NULL yoziladi */
const yoNull = (s: string) => (s.trim() === '' ? null : s.trim());

/**
 * Har bir amal uchun bir xil boshlanish: tuzoq, limit va tekshiruv.
 * Tuzoqqa tushgan so'rov "muvaffaqiyatli" deb ko'rsatiladi, lekin yozilmaydi.
 */
function tayyorgarlik<T>(
  sxema: z.ZodType<T>,
  malumot: unknown,
  tuzoqQiymati: string | undefined,
): { holat: 'tuzoq' } | { holat: 'xato'; natija: FormaNatija } | { holat: 'ok'; qiymat: T } {
  if (tuzoqQiymati && tuzoqQiymati.trim() !== '') return { holat: 'tuzoq' };

  const tekshirilgan = sxema.safeParse(malumot);
  if (!tekshirilgan.success) return { holat: 'xato', natija: TEKSHIRUV };

  if (limitdanOshdimi()) return { holat: 'xato', natija: { ok: false, kod: 'limit' } };

  return { holat: 'ok', qiymat: tekshirilgan.data };
}

// ------------------------------------------------------------------
// Aloqa xabari
// ------------------------------------------------------------------

const MAVZU_ZAXIRA: Record<'uz' | 'ru' | 'en', string> = {
  uz: 'Umumiy murojaat',
  ru: 'Общий вопрос',
  en: 'General enquiry',
};

const aloqaSxemasi = z.object({
  name: matn(2, 160),
  email,
  subject: ixtiyoriy(200),
  message: matn(5, 5000),
  locale: til,
  tuzoq,
});

export async function aloqaYuborish(malumot: unknown): Promise<FormaNatija> {
  const t = tayyorgarlik(aloqaSxemasi, malumot, (malumot as { tuzoq?: string })?.tuzoq);
  if (t.holat === 'tuzoq') return { ok: true };
  if (t.holat === 'xato') return t.natija;
  const d = t.qiymat;

  try {
    await db.contactMessage.create({
      data: {
        name: d.name,
        email: d.email,
        subject: d.subject || MAVZU_ZAXIRA[d.locale],
        message: d.message,
        locale: d.locale,
      },
    });
    return { ok: true };
  } catch {
    return XATO;
  }
}

// ------------------------------------------------------------------
// Jamoa arizasi
// ------------------------------------------------------------------

const jamoaSxemasi = z.object({
  ensembleName: matn(2, 200),
  type: z.enum(['orkestr', 'xor', 'ansambl']),
  region: z.string().min(1),
  city: matn(2, 120),
  conductor: matn(2, 160),
  memberCount: z.coerce.number().int().min(1).max(1000).optional().nullable(),
  contactName: matn(2, 160),
  email,
  phone: matn(5, 40),
  message: ixtiyoriy(3000),
  locale: til,
  tuzoq,
});

export async function jamoaArizasi(malumot: unknown): Promise<FormaNatija> {
  const t = tayyorgarlik(jamoaSxemasi, malumot, (malumot as { tuzoq?: string })?.tuzoq);
  if (t.holat === 'tuzoq') return { ok: true };
  if (t.holat === 'xato') return t.natija;
  const d = t.qiymat;

  const region = regionToDb[d.region as Region];
  if (!region) return TEKSHIRUV;

  try {
    await db.ensembleApplication.create({
      data: {
        ensembleName: d.ensembleName,
        type: ensembleTypeToDb[d.type as EnsembleType],
        region,
        city: d.city,
        conductor: d.conductor,
        memberCount: d.memberCount ?? null,
        contactName: d.contactName,
        email: d.email,
        phone: d.phone,
        message: yoNull(d.message),
        locale: d.locale,
      },
    });
    return { ok: true };
  } catch {
    return XATO;
  }
}

// ------------------------------------------------------------------
// Tanlov arizasi
// ------------------------------------------------------------------

const tanlovSxemasi = z.object({
  competitionId: z.number().int().positive().optional().nullable(),
  fullName: matn(2, 160),
  ensembleName: ixtiyoriy(200),
  email,
  phone: matn(5, 40),
  category: ixtiyoriy(120),
  message: ixtiyoriy(3000),
  locale: til,
  tuzoq,
});

export async function tanlovArizasi(malumot: unknown): Promise<FormaNatija> {
  const t = tayyorgarlik(tanlovSxemasi, malumot, (malumot as { tuzoq?: string })?.tuzoq);
  if (t.holat === 'tuzoq') return { ok: true };
  if (t.holat === 'xato') return t.natija;
  const d = t.qiymat;

  try {
    // Ariza faqat "ochiq" tanlovga qabul qilinadi
    if (d.competitionId) {
      const tanlov = await db.competition.findUnique({
        where: { id: d.competitionId },
        select: { status: true, published: true },
      });
      if (!tanlov || !tanlov.published || tanlov.status !== 'OCHIQ') return TEKSHIRUV;
    }

    await db.competitionApplication.create({
      data: {
        competitionId: d.competitionId ?? null,
        fullName: d.fullName,
        ensembleName: yoNull(d.ensembleName),
        email: d.email,
        phone: d.phone,
        category: yoNull(d.category),
        message: yoNull(d.message),
        locale: d.locale,
      },
    });
    return { ok: true };
  } catch {
    return XATO;
  }
}

// ------------------------------------------------------------------
// Iste'dod arizasi
// ------------------------------------------------------------------

const talentSxemasi = z.object({
  fullName: matn(2, 160),
  age: z.coerce.number().int().min(5).max(99),
  instrument: matn(2, 120),
  email,
  phone: ixtiyoriy(40),
  videoUrl: z.string().trim().url().max(2000),
  about: matn(10, 3000),
  locale: til,
  tuzoq,
});

export async function talentArizasi(malumot: unknown): Promise<FormaNatija> {
  const t = tayyorgarlik(talentSxemasi, malumot, (malumot as { tuzoq?: string })?.tuzoq);
  if (t.holat === 'tuzoq') return { ok: true };
  if (t.holat === 'xato') return t.natija;
  const d = t.qiymat;

  try {
    await db.talentApplication.create({
      data: {
        fullName: d.fullName,
        age: d.age,
        instrument: d.instrument,
        email: d.email,
        phone: yoNull(d.phone),
        videoUrl: d.videoUrl,
        about: d.about,
        locale: d.locale,
      },
    });
    return { ok: true };
  } catch {
    return XATO;
  }
}

// ------------------------------------------------------------------
// Yangiliklar obunasi
// ------------------------------------------------------------------

const obunaSxemasi = z.object({ email, locale: til, tuzoq });

export async function obunaQoshish(malumot: unknown): Promise<FormaNatija> {
  const t = tayyorgarlik(obunaSxemasi, malumot, (malumot as { tuzoq?: string })?.tuzoq);
  if (t.holat === 'tuzoq') return { ok: true };
  if (t.holat === 'xato') return t.natija;
  const d = t.qiymat;

  try {
    // Avval obunani bekor qilgan bo'lsa — qayta faollashtiriladi
    await db.subscriber.upsert({
      where: { email: d.email.toLowerCase() },
      create: { email: d.email.toLowerCase(), locale: d.locale },
      update: { active: true, locale: d.locale },
    });
    return { ok: true };
  } catch {
    return XATO;
  }
}
