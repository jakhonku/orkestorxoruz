import { NextResponse } from 'next/server';

import { joriySessiya } from '@/server/auth';
import { bolimgaRuxsatmi } from '@/server/admin/huquq';
import { davrniAniqla, getStatistika } from '@/server/queries/statistika';
import { statistikaPdf } from '@/server/statistika/pdf';

/** Sayt statistikasi hisobotini PDF sifatida yuklab berish (faqat kirgan admin). */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const sessiya = await joriySessiya();
  if (!sessiya || !bolimgaRuxsatmi(sessiya, 'statistika')) {
    return NextResponse.json({ xato: 'Ruxsat yoʻq. Qaytadan kiring.' }, { status: 401 });
  }

  const davr = davrniAniqla(new URL(request.url).searchParams.get('davr'));
  try {
    const bayt = await statistikaPdf(await getStatistika(davr));
    const sana = new Date().toISOString().slice(0, 10);
    return new NextResponse(new Uint8Array(bayt), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sayt-statistikasi-${davr}-kun-${sana}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const xabar = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ xato: `PDF yasalmadi: ${xabar}` }, { status: 500 });
  }
}
