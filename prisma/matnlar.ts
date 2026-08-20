/**
 * Sahifa matnlarini bazaga sinxronlash.
 *
 * `messages/{uz,ru,en}.json` — standart matnlar manbasi. Bu skript ulardagi
 * har bir kalitni `ui_texts` jadvaliga qo'shadi, shunda admin panelda
 * tahrirlash mumkin bo'ladi.
 *
 * Ishga tushirish:  npm run db:matnlar
 *
 * Xavfsiz: mavjud qatorlar tegilmaydi (admin tahriri saqlanadi), faqat
 * yangi kalitlar qo'shiladi va koddan olib tashlangan kalitlar o'chiriladi.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';
import uz from '../messages/uz.json';
import ru from '../messages/ru.json';
import en from '../messages/en.json';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Daraxt = { [kalit: string]: unknown };

/** Ichma-ich obyektni "Home.hero.title" ko'rinishidagi tekis ro'yxatga aylantiradi */
function tekisla(obj: Daraxt, oldingi = ''): Record<string, string> {
  const natija: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const kalit = oldingi ? `${oldingi}.${k}` : k;
    // Massivlar (masalan eski slayd ro'yxati) tahrirlanmaydi — o'tkazib yuboriladi
    if (Array.isArray(v)) continue;
    if (typeof v === 'object' && v !== null) Object.assign(natija, tekisla(v as Daraxt, kalit));
    else if (typeof v === 'string') natija[kalit] = v;
  }
  return natija;
}

async function main() {
  const uzT = tekisla(uz as unknown as Daraxt);
  const ruT = tekisla(ru as unknown as Daraxt);
  const enT = tekisla(en as unknown as Daraxt);

  const kalitlar = Object.keys(uzT);
  console.log(`\nMatn kalitlari: ${kalitlar.length} ta\n`);

  const bor = await db.uiText.findMany({ select: { key: true } });
  const borKalitlar = new Set(bor.map((b) => b.key));

  let qoshildi = 0;
  for (const [i, kalit] of kalitlar.entries()) {
    if (borKalitlar.has(kalit)) continue;
    await db.uiText.create({
      data: {
        key: kalit,
        grp: kalit.split('.')[0],
        value: { uz: uzT[kalit], ru: ruT[kalit] ?? '', en: enT[kalit] ?? '' },
        sortOrder: i,
      },
    });
    qoshildi++;
  }

  // Koddan olib tashlangan kalitlar bazada ham qolmasin
  const eskilar = [...borKalitlar].filter((k) => !(k in uzT));
  if (eskilar.length) {
    await db.uiText.deleteMany({ where: { key: { in: eskilar } } });
  }

  console.log(`  yangi qo'shildi:     ${qoshildi}`);
  console.log(`  o'zgarmadi:          ${kalitlar.length - qoshildi}`);
  console.log(`  eskirgani o'chirildi: ${eskilar.length}`);
  console.log('\nTayyor.\n');
}

main()
  .catch((e) => {
    console.error('\nXatolik:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
