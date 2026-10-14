import { NextResponse } from 'next/server';

import { joriySessiya } from '@/server/auth';
import { bolimgaRuxsatmi } from '@/server/admin/huquq';
import { arizalarExcel } from '@/server/admin/tanlov-excel';

/**
 * Tanlov arizalarini Excel (.xlsx) sifatida yuklab berish.
 * Rasm turidagi javoblar katak ichida rasm boʻlib chiqadi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const sessiya = await joriySessiya();
  if (!sessiya || !bolimgaRuxsatmi(sessiya, 'tanlov-arizalari')) {
    return NextResponse.json({ xato: 'Ruxsat yoʻq. Qaytadan kiring.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = Number(url.searchParams.get('tanlov'));
  const tanlovId = Number.isInteger(id) && id > 0 ? id : null;

  try {
    const { bayt, faylNomi } = await arizalarExcel(tanlovId, url.origin);
    return new NextResponse(new Uint8Array(bayt), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${faylNomi}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const xabar = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ xato: `Excel yasalmadi: ${xabar}` }, { status: 500 });
  }
}
