/**
 * Bazadagi oʻzbekcha matnlarda apostroflarni toʻgʻrilash.
 *
 *   oʻ / gʻ  — U+02BB (ʻ)   masalan: Oʻzbekiston, togʻ
 *   tutuq    — U+02BC (ʼ)   masalan: maʼlumot, taʼlim
 *
 * Faqat JSON ustunlardagi "uz" kalitining ichi oʻzgaradi — ruscha va inglizcha
 * matnlar (masalan inglizcha "world's") tegilmaydi.
 *
 * Ishga tushirish:
 *   npx tsx prisma/apostroflar.ts            — faqat nima oʻzgarishini koʻrsatadi
 *   npx tsx prisma/apostroflar.ts --yozish   — bazaga yozadi
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const YOZISH = process.argv.includes('--yozish');

// Inglizcha qisqartmalar ('s, n't ...) tegilmaydi
const QISQARTMA = "(?!(?:s|re|ll|ve|d|m|t)\\b)";
const OG = new RegExp(`(?<=[oOgG])[‘’'\`]${QISQARTMA}(?=[A-Za-z])`, 'g');
const TUTUQ = new RegExp(`(?<=[A-Za-z])[’'\`]${QISQARTMA}(?=[A-Za-z])`, 'g');

function toza(s: string): string {
  return s.replace(OG, 'ʻ').replace(TUTUQ, 'ʼ');
}

/** "uz" ichidagi barcha satrlar tozalanadi (massiv va ichma-ich ham) */
function uzIchida(v: unknown): unknown {
  if (typeof v === 'string') return toza(v);
  if (Array.isArray(v)) return v.map(uzIchida);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, uzIchida(x)]));
  }
  return v;
}

/** Qiymatni aylanib chiqadi; faqat "uz" kalitiga duch kelganda tozalaydi */
function yur(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(yur);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, k === 'uz' ? uzIchida(x) : yur(x)]),
    );
  }
  return v;
}

async function main() {
  const ustunlar = await db.$queryRaw<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type = 'jsonb'
    ORDER BY table_name, column_name`;

  let jami = 0;
  for (const { table_name: jadval, column_name: ustun } of ustunlar) {
    // Jadval nomlari information_schema dan keladi, foydalanuvchidan emas
    const pk = jadval === 'settings' ? 'key' : 'id';
    const qatorlar = await db.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT "${pk}" AS pk, "${ustun}" AS qiymat FROM "${jadval}" WHERE "${ustun}" IS NOT NULL`,
    );

    let ozgardi = 0;
    for (const q of qatorlar) {
      const eski = JSON.stringify(q.qiymat);
      const yangi = JSON.stringify(yur(q.qiymat));
      if (eski === yangi) continue;
      ozgardi++;
      if (YOZISH) {
        await db.$executeRawUnsafe(
          `UPDATE "${jadval}" SET "${ustun}" = $1::jsonb WHERE "${pk}" = $2`,
          yangi,
          q.pk,
        );
      }
    }
    if (ozgardi) console.log(`  ${jadval}.${ustun}: ${ozgardi} qator`);
    jami += ozgardi;
  }

  console.log(
    YOZISH
      ? `\nTayyor: ${jami} qator yangilandi.\n`
      : `\nJami ${jami} qator oʻzgaradi. Yozish uchun: npx tsx prisma/apostroflar.ts --yozish\n`,
  );
}

main()
  .catch((e) => {
    console.error('\nXatolik:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
