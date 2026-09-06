import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';

/**
 * Yuklangan faylni `media_files` jadvaliga qayd qiladi.
 *
 * Bu — faqat tarix uchun ro'yxat. Qayd yozilmasa ham fayl joyida turaveradi,
 * shuning uchun xato yuklashni to'xtatmaydi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Soraq = { url?: string; nom?: string; tur?: string; hajm?: number; papka?: string };

export async function POST(request: Request) {
  const sessiya = await joriySessiya();
  if (!sessiya) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const { url, nom, tur, hajm, papka } = (await request.json()) as Soraq;
    if (!url) return NextResponse.json({ ok: false }, { status: 400 });

    await db.mediaFile.create({
      data: {
        url,
        filename: String(nom ?? 'fayl').slice(0, 255),
        mimeType: String(tur ?? '').slice(0, 100),
        size: Math.max(0, Math.trunc(Number(hajm ?? 0))),
        folder: String(papka ?? 'umumiy').slice(0, 60),
      },
    });
  } catch {
    // Qayd yozilmadi — fayl baribir yuklangan, muharrirni bezovta qilmaymiz
  }

  return NextResponse.json({ ok: true });
}
