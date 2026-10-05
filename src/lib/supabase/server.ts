import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { ochiqSozlama } from './muhit';

/**
 * Server komponentlar, Server Actionʼlar va Route Handlerʼlar uchun Supabase
 * klienti. Sessiya cookieʼda saqlanadi — `@supabase/ssr` uni oʻzi yangilab turadi.
 *
 * Muhim: Server Component ichida cookie yozib boʻlmaydi (Next.js cheklovi).
 * Shuning uchun yozish `try/catch` ichida — sessiyani yangilash oʻrniga
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
          // Server Componentʼdan chaqirilgan — cookieʼni middleware yangilaydi
        }
      },
    },
  });
}
