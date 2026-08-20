import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { BUCKET } from '@/lib/supabase/muhit';
import { joriySessiya } from '@/server/auth';

/**
 * Admin paneldan rasm/hujjat yuklash.
 *
 * Fayl Supabase Storage'dagi `media` bucket'iga yoziladi va `media_files`
 * jadvaliga qayd qilinadi. Vercel'da fayl tizimi faqat o'qish uchun ochiq,
 * shuning uchun diskka emas — Storage'ga yoziladi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RUXSAT_ETILGAN: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
};

/** Eng katta fayl hajmi — 8 MB */
const CHEGARA = 8 * 1024 * 1024;

function xavfsizNom(nom: string): string {
  return nom
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function POST(request: Request) {
  const sessiya = await joriySessiya();
  if (!sessiya) {
    return NextResponse.json({ xato: 'Ruxsat yo‘q. Qaytadan kiring.' }, { status: 401 });
  }

  const forma = await request.formData();
  const fayl = forma.get('fayl');
  const papka = xavfsizNom(String(forma.get('papka') ?? 'umumiy')) || 'umumiy';

  if (!(fayl instanceof File)) {
    return NextResponse.json({ xato: 'Fayl tanlanmadi.' }, { status: 400 });
  }

  const kengaytma = RUXSAT_ETILGAN[fayl.type];
  if (!kengaytma) {
    return NextResponse.json(
      { xato: 'Faqat JPG, PNG, WEBP, AVIF, SVG yoki PDF yuklash mumkin.' },
      { status: 415 },
    );
  }

  if (fayl.size > CHEGARA) {
    return NextResponse.json({ xato: 'Fayl hajmi 8 MB dan oshmasligi kerak.' }, { status: 413 });
  }

  const oy = new Date().toISOString().slice(0, 7); // 2026-08
  const nom = `${xavfsizNom(fayl.name) || 'fayl'}-${randomBytes(4).toString('hex')}${kengaytma}`;
  const yol = `${papka}/${oy}/${nom}`;

  const supabase = supabaseAdmin();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(yol, await fayl.arrayBuffer(), { contentType: fayl.type, upsert: false });

  if (error) {
    return NextResponse.json(
      { xato: `Storage’ga yozib bo‘lmadi: ${error.message}` },
      { status: 502 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(yol);

  await db.mediaFile.create({
    data: {
      url: publicUrl,
      filename: fayl.name.slice(0, 255),
      mimeType: fayl.type,
      size: fayl.size,
      folder: papka,
    },
  });

  return NextResponse.json({ url: publicUrl });
}
