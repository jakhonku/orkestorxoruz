import { NextResponse } from 'next/server';

import { joriySessiya } from '@/server/auth';
import { bolimgaRuxsatmi } from '@/server/admin/huquq';
import { korishHavolasi } from '@/server/ariza-fayllari';

/**
 * Arizaga biriktirilgan faylni ochish.
 *
 * Fayl yopiq bucketʼda turadi. Bu manzil panelga kirgan xodimni tekshiradi va
 * 5 daqiqalik vaqtinchalik havolaga yoʻnaltiradi. Havolaning oʻzi (masalan
 * Excel fayldagi) muddati oʻtmaydi — har bosilganda yangi havola beriladi,
 * lekin kirmagan odam faylni koʻra olmaydi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const sessiya = await joriySessiya();
  if (!sessiya || !bolimgaRuxsatmi(sessiya, 'tanlov-arizalari')) {
    return NextResponse.redirect(new URL('/admin/kirish', request.url));
  }

  const yol = new URL(request.url).searchParams.get('yol') ?? '';
  if (!/^tanlov-\d+\/[\w./-]+$/.test(yol) || yol.includes('..')) {
    return NextResponse.json({ xato: 'Fayl yoʻli notoʻgʻri.' }, { status: 400 });
  }

  const havola = await korishHavolasi(yol);
  if (!havola) return NextResponse.json({ xato: 'Fayl topilmadi.' }, { status: 404 });

  return NextResponse.redirect(havola);
}
