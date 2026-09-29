import 'server-only';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { ARIZA_BUCKET } from '@/lib/supabase/muhit';
import { ARIZA_FAYL_CHEGARASI, FAYL_TURLARI } from '@/lib/anketa';

/**
 * Ariza fayllari saqlanadigan yopiq bucket bilan ishlash.
 *
 * Bucket birinchi kerak bo'lganda o'zi yaratiladi — Supabase panelida qo'lda
 * sozlash shart emas. U doim YOPIQ (public: false): pasport nusxasi kabi
 * hujjatlar ochiq havola bilan hech qachon ko'rinmasligi kerak.
 */

let tayyor = false;

async function bucketniTayyorla() {
  if (tayyor) return;
  const supabase = supabaseAdmin();
  const { data } = await supabase.storage.getBucket(ARIZA_BUCKET);

  if (!data) {
    const { error } = await supabase.storage.createBucket(ARIZA_BUCKET, {
      public: false,
      fileSizeLimit: ARIZA_FAYL_CHEGARASI,
      allowedMimeTypes: Object.keys(FAYL_TURLARI.hammasi),
    });
    // Parallel so'rov uni allaqachon yaratgan bo'lishi mumkin
    if (error && !/already exists/i.test(error.message)) throw error;
  } else if (data.public) {
    // Kimdir qo'lda ochiq qilib qo'ygan bo'lsa — yopamiz
    await supabase.storage.updateBucket(ARIZA_BUCKET, {
      public: false,
      fileSizeLimit: ARIZA_FAYL_CHEGARASI,
      allowedMimeTypes: Object.keys(FAYL_TURLARI.hammasi),
    });
  }
  tayyor = true;
}

/** Brauzer faylni to'g'ridan-to'g'ri yuklashi uchun bir martalik imzolangan manzil */
export async function yuklashImzosi(yol: string): Promise<string> {
  await bucketniTayyorla();
  const { data, error } = await supabaseAdmin().storage.from(ARIZA_BUCKET).createSignedUploadUrl(yol);
  if (error || !data) throw new Error(error?.message ?? 'Storage javob bermadi');
  return data.signedUrl;
}

/** Faylni ochish uchun qisqa muddatli havola (admin panel uchun) */
export async function korishHavolasi(yol: string, soniya = 300): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .storage.from(ARIZA_BUCKET)
    .createSignedUrl(yol, soniya);
  return data?.signedUrl ?? null;
}
