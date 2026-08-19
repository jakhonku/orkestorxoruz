'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import type { SubmissionStatus } from '@/generated/prisma/enums';

/**
 * Saytdan tushgan murojaatlar: aloqa xabarlari, jamoa/tanlov/iste'dod arizalari
 * va obunachilar. Bu yozuvlarni admin panel faqat o'qiydi, holatini o'zgartiradi
 * va o'chiradi — yangisini qo'lda qo'shmaydi.
 */

export type MurojaatTuri = 'aloqa' | 'jamoa' | 'tanlov' | 'talent';

const MODELLAR: Record<MurojaatTuri, string> = {
  aloqa: 'contactMessage',
  jamoa: 'ensembleApplication',
  tanlov: 'competitionApplication',
  talent: 'talentApplication',
};

type Delegat = {
  update: (a: unknown) => Promise<unknown>;
  delete: (a: unknown) => Promise<unknown>;
};

function delegat(tur: MurojaatTuri): Delegat {
  const model = MODELLAR[tur];
  const d = (db as unknown as Record<string, Delegat>)[model];
  if (!d) throw new Error(`Noma'lum murojaat turi: ${tur}`);
  return d;
}

async function ruxsat() {
  const s = await joriySessiya();
  if (!s) throw new Error('Ruxsat yo‘q. Qaytadan kiring.');
}

export type Natija = { ok: true } | { ok: false; xato: string };

function xatoBilan(e: unknown): Natija {
  return { ok: false, xato: e instanceof Error ? e.message : String(e) };
}

/** Murojaat holatini o'zgartiradi (yangi / ko'rib chiqilmoqda / javob berildi / rad etildi) */
export async function holatOzgartirish(
  tur: MurojaatTuri,
  id: number,
  holat: SubmissionStatus,
): Promise<Natija> {
  try {
    await ruxsat();
    await delegat(tur).update({ where: { id }, data: { status: holat } });
    revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

/** Ichki eslatma — faqat admin panelda ko'rinadi */
export async function eslatmaSaqlash(
  tur: MurojaatTuri,
  id: number,
  eslatma: string,
): Promise<Natija> {
  try {
    await ruxsat();
    const matn = eslatma.trim();
    await delegat(tur).update({ where: { id }, data: { adminNote: matn === '' ? null : matn } });
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

export async function murojaatOchirish(tur: MurojaatTuri, id: number): Promise<Natija> {
  try {
    await ruxsat();
    await delegat(tur).delete({ where: { id } });
    revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

/** Obunachini faol / nofaol qilish */
export async function obunaAlmashtirish(id: number): Promise<Natija> {
  try {
    await ruxsat();
    const joriy = await db.subscriber.findUnique({ where: { id }, select: { active: true } });
    if (!joriy) return { ok: false, xato: 'Obunachi topilmadi.' };
    await db.subscriber.update({ where: { id }, data: { active: !joriy.active } });
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}

export async function obunaOchirish(id: number): Promise<Natija> {
  try {
    await ruxsat();
    await db.subscriber.delete({ where: { id } });
    return { ok: true };
  } catch (e) {
    return xatoBilan(e);
  }
}
