import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { routing } from '@/i18n/routing';
import {
  botmi,
  davlatKodi,
  tashrifchiHash,
  yolToza,
} from '@/server/statistika/yozish';

/**
 * Sahifa ochilganini yozadi (sayt statistikasi). Xato boʻlsa jim javob beradi —
 * kuzatuv saytning ishiga hech qachon xalaqit bermaydi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bitta tashrifchi 10 daqiqada ko'pi bilan shuncha koʻrish yozadi */
const CHEGARA = 120;

export async function POST(request: Request) {
  try {
    const ua = request.headers.get('user-agent');
    if (botmi(ua)) return NextResponse.json({ id: null });

    const body = (await request.json().catch(() => null)) as { path?: unknown; locale?: unknown } | null;
    const yol = yolToza(body?.path);
    const til = typeof body?.locale === 'string' ? body.locale : '';
    if (!yol || !(routing.locales as readonly string[]).includes(til)) {
      return NextResponse.json({ id: null });
    }

    const ip = (request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'nomalum')
      .split(',')[0]
      .trim();
    const hash = tashrifchiHash(ip, ua ?? '');

    const oxirgi = await db.pageView.count({
      where: { visitorHash: hash, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    });
    if (oxirgi >= CHEGARA) return NextResponse.json({ id: null });

    const yozuv = await db.pageView.create({
      data: {
        visitorHash: hash,
        path: yol,
        locale: til,
        country: davlatKodi(request.headers.get('x-vercel-ip-country')),
      },
      select: { id: true },
    });
    return NextResponse.json({ id: yozuv.id });
  } catch {
    return NextResponse.json({ id: null });
  }
}
