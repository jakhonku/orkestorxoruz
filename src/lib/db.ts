import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Prisma klienti — singleton.
 *
 * Next.js dev rejimida modullar qayta yuklanadi, shuning uchun klient
 * globalThis'da saqlanadi (aks holda har yangilanishda yangi ulanish ochiladi
 * va bazadagi ulanishlar limiti tugab qoladi).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function yaratish() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL topilmadi. `.env` faylni tekshiring yoki `npm run db:start` bilan bazani ishga tushiring.',
    );
  }

  /**
   * Bitta jarayon ochadigan ulanishlar soni.
   *
   * `next build` sahifalarni bir nechta ishchi jarayonda tayyorlaydi va har
   * biri o'z hovuzini ochadi — cheklanmasa Postgres'ning `max_connections`
   * limiti tugab qoladi ("too many clients already").
   */
  const hovuz = Number(process.env.DATABASE_POOL_MAX ?? 5);

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, max: Number.isFinite(hovuz) ? hovuz : 5 }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? yaratish();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
