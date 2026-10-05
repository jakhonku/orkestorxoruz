import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { BUCKET } from '@/lib/supabase/muhit';
import {
  CHEGARA,
  RUXSAT_ETILGAN,
  faylTuri,
  hajmXatosi,
  turXatosi,
  xavfsizNom,
} from '@/lib/yuklash';
import { joriySessiya } from '@/server/auth';

/**
 * Fayl yuklash uchun bir martalik imzolangan manzil beradi.
 *
 * Fayl brauzerdan toʻgʻridan-toʻgʻri Supabase Storageʼga ketadi — server
 * orqali oʻtmaydi. Shu sababli katta video ham Vercelʼning soʻrov hajmi
 * cheklovi va funksiya vaqti chekloviga urilmaydi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Soraq = { nom?: string; tur?: string; hajm?: number; papka?: string };

export async function POST(request: Request) {
  const sessiya = await joriySessiya();
  if (!sessiya) {
    return NextResponse.json({ xato: 'Ruxsat yoʻq. Qaytadan kiring.' }, { status: 401 });
  }

  let soraq: Soraq;
  try {
    soraq = (await request.json()) as Soraq;
  } catch {
    return NextResponse.json({ xato: 'Soʻrov notoʻgʻri.' }, { status: 400 });
  }

  const nom = String(soraq.nom ?? '').trim();
  const hajm = Number(soraq.hajm ?? 0);
  if (!nom || !Number.isFinite(hajm) || hajm <= 0) {
    return NextResponse.json({ xato: 'Fayl tanlanmadi.' }, { status: 400 });
  }

  const tur = faylTuri(nom, soraq.tur);
  const tavsif = RUXSAT_ETILGAN[tur];
  if (!tavsif) {
    return NextResponse.json({ xato: turXatosi(nom, tur) }, { status: 415 });
  }
  if (hajm > CHEGARA[tavsif.guruh]) {
    return NextResponse.json({ xato: hajmXatosi(tavsif.guruh, hajm) }, { status: 413 });
  }

  const papka = xavfsizNom(String(soraq.papka ?? 'umumiy')) || 'umumiy';
  const oy = new Date().toISOString().slice(0, 7); // 2026-09
  const fayl = `${xavfsizNom(nom) || 'fayl'}-${randomBytes(4).toString('hex')}${tavsif.kengaytma}`;
  const yol = `${papka}/${oy}/${fayl}`;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(yol);

  if (error || !data) {
    return NextResponse.json(
      { xato: `Storage javob bermadi: ${error?.message ?? 'nomaʼlum xato'}` },
      { status: 502 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(yol);

  return NextResponse.json({ imzoUrl: data.signedUrl, yol, url: publicUrl, tur });
}
