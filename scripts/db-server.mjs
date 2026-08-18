/**
 * Mahalliy PostgreSQL serveri (ishlab chiqish uchun).
 *
 * Docker ham, tizimga o'rnatish ham talab qilinmaydi — haqiqiy Postgres
 * `.postgres/` papkasida ishlaydi. Serverdagi (VDS) Postgres bilan bir xil,
 * shuning uchun mahalliy va real muhit farq qilmaydi.
 *
 *   npm run db:start      -> serverni ishga tushiradi (Ctrl+C bilan to'xtaydi)
 *
 * Ma'lumotlar `.postgres/` da saqlanadi va qayta ishga tushirilganda yo'qolmaydi.
 */
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_DIR = resolve(process.cwd(), '.postgres');
const PORT = 5433;
const USER = 'orkestr';
const PAROL = 'orkestr';
const BAZA = 'orkestrvaxor';

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PAROL,
  port: PORT,
  persistent: true,
  // UTF-8 va Unicode lokali majburiy:
  //   - Windows'ning mahalliy kodlashi (WIN1251) o‘zbekcha "o‘, g‘" belgilarini buzadi
  //   - "C" lokalida ILIKE kirill harflarida katta/kichik harfni farqlamay qidira olmaydi,
  //     shuning uchun C.UTF-8 (Postgres 17+ ichki lokal provayderi) ishlatiladi
  initdbFlags: [
    '--encoding=UTF8',
    '--locale-provider=builtin',
    '--builtin-locale=C.UTF-8',
  ],
  onError: (message) => process.stderr.write(String(message)),
});

const birinchiMarta = !existsSync(DATA_DIR);

if (birinchiMarta) {
  console.log('Postgres birinchi marta sozlanmoqda (bir necha soniya)...');
  await pg.initialise();
}

await pg.start();

if (birinchiMarta) {
  await pg.createDatabase(BAZA);
  console.log(`"${BAZA}" bazasi yaratildi.`);
}

console.log('');
console.log('  PostgreSQL ishlamoqda');
console.log(`  DATABASE_URL="postgresql://${USER}:${PAROL}@localhost:${PORT}/${BAZA}?schema=public"`);
console.log('');
console.log('  To\'xtatish uchun: Ctrl+C');
console.log('');

async function toxtatish() {
  console.log('\nPostgres to\'xtatilmoqda...');
  try {
    await pg.stop();
  } catch {
    // server allaqachon to'xtagan
  }
  process.exit(0);
}

process.on('SIGINT', toxtatish);
process.on('SIGTERM', toxtatish);
