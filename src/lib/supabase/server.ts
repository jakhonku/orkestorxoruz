import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { ochiqSozlama } from './muhit';

/**
 * Server komponentlar, Server Action'lar va Route Handler'lar uchun Supabase
 * klienti. Sessiya cookie'da saqlanadi — `@supabase/ssr` uni o'zi yangilab turadi.
 *
 * Muhim: Server Component ichida cookie yozib bo'lmaydi (Next.js cheklovi).
 * Shuning uchun yozish `try/catch` ichida — sessiyani yangilash o'rniga
 * middleware bajaradi (`src/middleware.ts`).
 */
export function supabaseServer() {
  const { url, kalit } = ochiqSozlama();
  const saqlagich = cookies();

  return createServerClient(url, kalit, {
    cookies: {
      getAll() {
        return saqlagich.getAll();
      },
      setAll(royxat) {
        try {
          for (const { name, value, options } of royxat) {
            saqlagich.set(name, value, options);
          }
        } catch {
          // Server Component'dan chaqirilgan — cookie'ni middleware yangilaydi
        }
      },
    },
  });
}
