'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import type { Qiymatlar } from './turlar';
import { SOZLAMA_MAYDONLARI } from './sozlama-maydonlari';

/**
 * Sayt sozlamalari — `settings` jadvalidagi kalit/qiymat juftliklari.
 *
 * Kontent bo'limlaridan farqli o'laroq bu yerda satrlar emas, kalitlar
 * tahrirlanadi, shuning uchun alohida amal yozilgan.
 */

/** `mapCoords` bazada bitta obyekt, shaklda esa ikki maydon */
const KOORDINATA_KALITI = 'mapCoords';

export type SozlamaNatija = { ok: true } | { ok: false; xato: string };

export async function sozlamalarSaqlash(malumotJson: string): Promise<SozlamaNatija> {
  try {
    const sessiya = await joriySessiya();
    if (!sessiya) return { ok: false, xato: 'Ruxsat yo‘q. Qaytadan kiring.' };

    const qiymatlar = JSON.parse(malumotJson) as Qiymatlar;

    const yozuvlar: { key: string; value: unknown }[] = [];

    for (const m of SOZLAMA_MAYDONLARI) {
      if (m.nom === 'mapLat' || m.nom === 'mapLng') continue;

      if (m.nom === 'socials') {
        const qatorlar = ((qiymatlar.socials as Record<string, unknown>[]) ?? [])
          .map((q) => ({ platform: String(q.platform ?? ''), url: String(q.url ?? '').trim() }))
          .filter((q) => q.platform && q.url);
        yozuvlar.push({ key: 'socials', value: qatorlar });
        continue;
      }

      yozuvlar.push({ key: m.nom, value: qiymatlar[m.nom] ?? null });
    }

    const lat = Number(qiymatlar.mapLat);
    const lng = Number(qiymatlar.mapLng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      yozuvlar.push({ key: KOORDINATA_KALITI, value: { lat, lng } });
    }

    await db.$transaction(
      yozuvlar.map((y) =>
        db.setting.upsert({
          where: { key: y.key },
          create: { key: y.key, value: y.value as never },
          update: { value: y.value as never },
        }),
      ),
    );

    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (e) {
    return { ok: false, xato: e instanceof Error ? e.message : String(e) };
  }
}
