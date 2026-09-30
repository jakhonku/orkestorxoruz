import { randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import {
  ARIZA_FAYL_CHEGARASI,
  FAYL_TURLARI,
  arizaFaylTuri,
  arizaPapkasi,
} from '@/lib/anketa';
import { tanlovAnketasi } from '@/lib/anketa-andozalari';
import { xavfsizNom } from '@/lib/yuklash';
import { yuklashImzosi } from '@/server/ariza-fayllari';

/**
 * Ishtirokchi arizaga fayl biriktiradi (surat, pasport nusxasi...).
 *
 * Kirish talab qilinmaydi — lekin imzo faqat quyidagi shartlarda beriladi:
 *   - tanlov e'lon qilingan va arizalar OCHIQ
 *   - anketada shu id li `fayl` savoli bor va fayl turi unga mos
 *   - hajm chegaradan oshmaydi, bitta IP dan so'rovlar soni cheklangan
 *
 * Fayl brauzerdan to'g'ridan-to'g'ri YOPIQ bucket'ga yuklanadi. Javob sifatida
 * faqat fayl yo'li qaytadi; ochiq havola yo'q.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bitta IP dan 10 daqiqada nechta fayl yuklanishi mumkin */
const CHEGARA = 40;
const OYNA_MS = 10 * 60 * 1000;

type Soraq = { tanlovId?: number; savolId?: string; nom?: string; tur?: string; hajm?: number };

function rad(xato: string, status: number) {
  return NextResponse.json({ xato }, { status });
}

async function limitdanOshdimi(): Promise<boolean> {
  const h = headers();
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'nomalum').split(',')[0].trim();
  // Formalar hisoblagichi bilan aralashmasligi uchun alohida belgi
  const kalit = `yuklash:${ip}`.slice(0, 64);
  try {
    const soni = await db.formRateHit.count({
      where: { ip: kalit, createdAt: { gte: new Date(Date.now() - OYNA_MS) } },
    });
    if (soni >= CHEGARA) return true;
    await db.formRateHit.create({ data: { ip: kalit } });
  } catch {
    return false;
  }
  return false;
}

export async function POST(request: Request) {
  let soraq: Soraq;
  try {
    soraq = (await request.json()) as Soraq;
  } catch {
    return rad('bad-request', 400);
  }

  const tanlovId = Number(soraq.tanlovId);
  const savolId = String(soraq.savolId ?? '');
  const nom = String(soraq.nom ?? '').trim();
  const hajm = Number(soraq.hajm ?? 0);

  if (!Number.isInteger(tanlovId) || tanlovId <= 0 || !savolId || !nom) {
    return rad('bad-request', 400);
  }
  if (!Number.isFinite(hajm) || hajm <= 0) return rad('empty', 400);
  if (hajm > ARIZA_FAYL_CHEGARASI) return rad('too-large', 413);

  const tanlov = await db.competition.findUnique({
    where: { id: tanlovId },
    select: { status: true, published: true, formFields: true },
  });
  if (!tanlov || !tanlov.published || tanlov.status !== 'OCHIQ') return rad('closed', 403);

  const savol = tanlovAnketasi(tanlov.formFields).find((s) => s.id === savolId && s.tur === 'fayl');
  if (!savol) return rad('bad-request', 400);

  const tur = arizaFaylTuri(nom, soraq.tur);
  const kengaytma = FAYL_TURLARI[savol.qabul][tur];
  if (!kengaytma) return rad('type', 415);

  if (await limitdanOshdimi()) return rad('limit', 429);

  const oy = new Date().toISOString().slice(0, 7);
  const fayl = `${xavfsizNom(nom) || 'fayl'}-${randomBytes(6).toString('hex')}${kengaytma}`;
  const yol = `${arizaPapkasi(tanlovId)}${oy}/${fayl}`;

  try {
    const imzoUrl = await yuklashImzosi(yol);
    return NextResponse.json({ imzoUrl, yol, tur });
  } catch (e) {
    console.error('Ariza fayli uchun imzo berilmadi:', e instanceof Error ? e.message : e);
    return rad('storage', 502);
  }
}
