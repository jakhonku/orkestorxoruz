import 'server-only';
import { createClient } from '@supabase/supabase-js';

import { ochiqSozlama, xizmatKaliti } from './muhit';

/**
 * Xizmat kaliti (service role) bilan ishlaydigan klient.
 *
 * RLS siyosatlarini chetlab o'tadi va Auth Admin API'ga (foydalanuvchi
 * yaratish, parol almashtirish, o'chirish) hamda Storage'ga to'liq kirish
 * beradi. FAQAT server tomonida chaqiriladi — brauzerga tushmasligi shart.
 */
export function supabaseAdmin() {
  const { url } = ochiqSozlama();
  return createClient(url, xizmatKaliti(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
