import 'server-only';
import { createClient } from '@supabase/supabase-js';

import { ochiqSozlama, xizmatKaliti } from './muhit';

/**
 * Xizmat kaliti (service role) bilan ishlaydigan klient.
 *
 * RLS siyosatlarini chetlab oʻtadi va Auth Admin APIʼga (foydalanuvchi
 * yaratish, parol almashtirish, oʻchirish) hamda Storageʼga toʻliq kirish
 * beradi. FAQAT server tomonida chaqiriladi — brauzerga tushmasligi shart.
 */
export function supabaseAdmin() {
  const { url } = ochiqSozlama();
  return createClient(url, xizmatKaliti(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
