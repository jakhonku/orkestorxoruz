import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { botmi, tashrifchiHash } from '@/server/statistika/yozish';

/**
 * Sahifada necha soniya turilganini yozadi (`sendBeacon` bilan, sahifa yopilganda).
 * Faqat yozuvni yaratgan tashrifchining oʻz hashi mos kelsa yangilanadi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ua = request.headers.get('user-agent');
    if (botmi(ua)) return new NextResponse(null, { status: 204 });

    const body = (await request.json().catch(() => null)) as { id?: unknown; sekund?: unknown } | null;
    const id = Number(body?.id);
    const sekund = Math.round(Number(body?.sekund));
    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(sekund)) {
      return new NextResponse(null, { status: 204 });
    }

    const ip = (request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'nomalum')
      .split(',')[0]
      .trim();

    await db.pageView.updateMany({
      where: { id, visitorHash: tashrifchiHash(ip, ua ?? '') },
      data: { durationSec: Math.max(0, Math.min(1800, sekund)) },
    });
  } catch {
    // jim
  }
  return new NextResponse(null, { status: 204 });
}
