/**
 * Sahifa matnlarini bazaga sinxronlash.
 *
 * `messages/{uz,ru,en}.json` — standart matnlar manbasi. Bu skript ulardagi
 * kalitlarni `ui_texts` jadvaliga qo'shadi, shunda admin panelda tahrirlash
 * mumkin bo'ladi.
 *
 * Ishga tushirish:  npm run db:matnlar
 *
 * MUHIM: faqat kodda haqiqatan ishlatiladigan kalitlar qo'shiladi.
 * Aks holda panelda tahrirlab bo'ladigan, lekin saytda hech narsani
 * o'zgartirmaydigan "o'lik" matnlar paydo bo'ladi.
 *
 * Xavfsiz: mavjud qatorlar tegilmaydi (admin tahriri saqlanadi).
 */
import 'dotenv/config';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';
import uz from '../messages/uz.json';
import ru from '../messages/ru.json';
import en from '../messages/en.json';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Kod ichida ishlatilsa ham, panelda ko'rsatilmaydigan kalitlar.
 *
 * Bular faqat ZAXIRA qiymat: sahifa avval bazadagi kontentni oladi, u bo'sh
 * bo'lsagina shu matnga tushadi. Panelda ko'rsatilsa, admin tahrirlaydi-yu,
 * saytda hech narsa o'zgarmaydi.
 */
const ZAXIRA_KALITLAR = new Set([
  // Missiya matni "Sozlamalar" bo'limida tahrirlanadi (settings.missionText)
  'About.missionText',
]);

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

/** `src/` ichidagi barcha .ts / .tsx fayllar */
function manbaFayllari(katalog = 'src'): string[] {
  const natija: string[] = [];
  for (const nom of readdirSync(katalog)) {
    const yol = join(katalog, nom);
    if (statSync(yol).isDirectory()) {
      if (nom !== 'generated') natija.push(...manbaFayllari(yol));
    } else if (/\.tsx?$/.test(nom)) {
      natija.push(yol);
    }
  }
  return natija;
}

/**
 * Kodda qaysi matn kalitlari chaqirilishini aniqlaydi.
 *
 * Hisobga olinadi:
 *   const t = useTranslations('Nav')      -> t('home')        -> Nav.home
 *   const tc = useTranslations('Common')  -> tc('readMore')   -> Common.readMore
 *   getTranslations({ namespace: 'Meta' })
 *   dinamik chaqiruv: t(`type_${x}`)      -> "type_" bilan boshlanadigan hammasi
 */
function ishlatilganKalitlar(barcha: string[]): Set<string> {
  const ishlatilgan = new Set<string>();
  const nsRe =
    /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:'([^']+)'|\{[^}]*namespace:\s*'([^']+)'[^}]*\})/g;

  for (const yol of manbaFayllari()) {
    const matn = readFileSync(yol, 'utf8');

    const xarita = new Map<string, string>();
    for (const m of matn.matchAll(nsRe)) xarita.set(m[1], m[2] ?? m[3]);
    if (!xarita.size) continue;

    for (const [ozgaruvchi, ns] of xarita) {
      // t('kalit') va t.rich('kalit')
      const toza = new RegExp('\\b' + ozgaruvchi + '(?:\\.rich)?\\(\\s*\'([^\']+)\'', 'g');
      for (const m of matn.matchAll(toza)) {
        const kalit = `${ns}.${m[1]}`;
        if (barcha.includes(kalit)) ishlatilgan.add(kalit);
      }

      // t(`prefiks_${...}`) — kalit o'zgaruvchiga bog'liq
      const dinamik = new RegExp('\\b' + ozgaruvchi + '\\(\\s*`([^`$]*)\\$\\{', 'g');
      for (const m of matn.matchAll(dinamik)) {
        const boshlanish = `${ns}.${m[1]}`;
        for (const k of barcha) if (k.startsWith(boshlanish)) ishlatilgan.add(k);
      }
    }
  }
  return ishlatilgan;
}

async function main() {
  const uzT = tekisla(uz as unknown as Daraxt);
  const ruT = tekisla(ru as unknown as Daraxt);
  const enT = tekisla(en as unknown as Daraxt);

  const hammasi = Object.keys(uzT);
  const ishlatilgan = ishlatilganKalitlar(hammasi);
  const kalitlar = hammasi.filter((k) => ishlatilgan.has(k) && !ZAXIRA_KALITLAR.has(k));

  console.log(`\nmessages/*.json dagi kalitlar: ${hammasi.length} ta`);
  console.log(`  saytda ishlatiladi:         ${kalitlar.length} ta`);
  console.log(`  kodda ishlatilmaydi:        ${hammasi.length - ishlatilgan.size} ta (panelga chiqmaydi)`);
  console.log(`  faqat zaxira qiymat:        ${ZAXIRA_KALITLAR.size} ta (boshqa bo'limda tahrirlanadi)\n`);

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

  // Endi ishlatilmaydigan kalitlar panelda turmasin
  const keraksiz = [...borKalitlar].filter((k) => !kalitlar.includes(k));
  if (keraksiz.length) {
    await db.uiText.deleteMany({ where: { key: { in: keraksiz } } });
  }

  console.log(`  yangi qo'shildi:   ${qoshildi}`);
  console.log(`  o'zgarmadi:        ${kalitlar.length - qoshildi}`);
  console.log(`  panelchan olindi:  ${keraksiz.length}`);
  if (keraksiz.length) for (const k of keraksiz) console.log(`      ${k}`);
  console.log('\nTayyor.\n');
}

main()
  .catch((e) => {
    console.error('\nXatolik:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
