'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { joriySessiya } from '@/server/auth';
import type { Maydon, Qiymatlar } from './turlar';
import { SOZLAMA_TOPLAMLARI } from './sozlama-maydonlari';

/**
 * Kalit/qiymat shakllari — `settings` jadvalidagi juftliklar.
 *
 * Kontent bo'limlaridan farqli o'laroq bu yerda satrlar emas, kalitlar
 * tahrirlanadi ("Sayt sozlamalari", "Faoliyat sahifasi"), shuning uchun
 * alohida amal yozilgan.
 */

/** Talent platformasi ochiqmi — `settings` jadvalidagi kalit */
const TALENT_KALITI = 'talentOpen';

/** `mapCoords` bazada bitta obyekt, shaklda esa ikki maydon */
const KOORDINATA_KALITI = 'mapCoords';

export type SozlamaNatija = { ok: true } | { ok: false; xato: string };

/** `qatorlar` maydonidagi bo'sh satrlarni tashlaydi */
function qatorlarniTozala(m: Maydon, xom: unknown): Record<string, unknown>[] {
  const ichki = m.maydonlar ?? [];
  const talab = ichki.filter((im) => im.talab);

  return ((xom as Record<string, unknown>[]) ?? []).filter((q) =>
    talab.every((im) => {
      const v = q[im.nom];
      if (v && typeof v === 'object') {
        // Ko'p tilli maydon — o'zbekchasi bo'lsa kifoya
        return String((v as Record<string, unknown>).uz ?? '').trim() !== '';
      }
      return String(v ?? '').trim() !== '';
    }),
  );
}

export async function sozlamalarSaqlash(
  toplam: string,
  malumotJson: string,
): Promise<SozlamaNatija> {
  try {
    const sessiya = await joriySessiya();
    if (!sessiya) return { ok: false, xato: 'Ruxsat yo‘q. Qaytadan kiring.' };

    // Maydonlar ta'rifi faqat serverdan olinadi — mijoz yuborgan kalitgina
    // ishonchli deb qabul qilinadi.
    const maydonlar = SOZLAMA_TOPLAMLARI[toplam as keyof typeof SOZLAMA_TOPLAMLARI];
    if (!maydonlar) return { ok: false, xato: 'Noma’lum shakl.' };

    const qiymatlar = JSON.parse(malumotJson) as Qiymatlar;

    const yozuvlar: { key: string; value: unknown }[] = [];

    for (const m of maydonlar) {
      if (m.nom === 'mapLat' || m.nom === 'mapLng') continue;

      if (m.nom === 'socials') {
        const qatorlar = ((qiymatlar.socials as Record<string, unknown>[]) ?? [])
          .map((q) => ({ platform: String(q.platform ?? ''), url: String(q.url ?? '').trim() }))
          .filter((q) => q.platform && q.url);
        yozuvlar.push({ key: 'socials', value: qatorlar });
        continue;
      }

      // Belgi (ha/yo'q) — shakldan qiymat kelmasa ham NULL emas, `false` yoziladi,
      // aks holda bazada NULL turib qoladi va "ko'rinsin/ko'rinmasin" noaniq bo'ladi.
      if (m.tur === 'belgi') {
        yozuvlar.push({ key: m.nom, value: Boolean(qiymatlar[m.nom]) });
        continue;
      }

      if (m.tur === 'qatorlar') {
        yozuvlar.push({ key: m.nom, value: qatorlarniTozala(m, qiymatlar[m.nom]) });
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

/**
 * Talent platformasini bir bosishda yopish/ochish.
 *
 * Xuddi shu kalit ("Sayt sozlamalari" dagi belgi) admin panelning bosh
 * sahifasidan ham boshqariladi — platformani shoshilinch yopish uchun uzun
 * shaklni ochib, hamma maydonni qayta saqlash shart bo‘lmasin.
 */
export async function talentHolatiniOzgartir(ochiq: boolean): Promise<SozlamaNatija> {
  try {
    const sessiya = await joriySessiya();
    if (!sessiya) return { ok: false, xato: 'Ruxsat yo‘q. Qaytadan kiring.' };

    await db.setting.upsert({
      where: { key: TALENT_KALITI },
      create: { key: TALENT_KALITI, value: ochiq as never },
      update: { value: ochiq as never },
    });

    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (e) {
    return { ok: false, xato: e instanceof Error ? e.message : String(e) };
  }
}
