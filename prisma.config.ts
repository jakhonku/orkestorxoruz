import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma CLI sozlamalari (migratsiya, generate, studio).
 *
 * Migratsiyalar Supabase'ning to'g'ridan-to'g'ri ulanishi orqali bajariladi
 * (`DIRECT_URL`) — pooler orqali DDL buyruqlari ishonchli ishlamaydi.
 * Sayt esa ish paytida pooler'dan foydalanadi (`DATABASE_URL`).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
