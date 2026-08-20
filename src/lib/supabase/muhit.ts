/**
 * Supabase muhit o'zgaruvchilari — bitta joyda o'qiladi va tekshiriladi.
 *
 * Vercel'da bu qiymatlar loyiha sozlamalaridagi "Environment Variables"
 * bo'limiga qo'yiladi (Production, Preview va Development uchun).
 */

/** Brauzerga ham ochiq bo'ladigan qiymatlar (Supabase'da bu xavfsiz) */
export function ochiqSozlama(): { url: string; kalit: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kalit =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !kalit) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL yoki NEXT_PUBLIC_SUPABASE_ANON_KEY topilmadi. ' +
        'Muhit o‘zgaruvchilarini tekshiring (.env yoki Vercel sozlamalari).',
    );
  }
  return { url, kalit };
}

/** Faqat serverda ishlatiladigan maxfiy kalit — hech qachon brauzerga chiqmaydi */
export function xizmatKaliti(): string {
  const kalit = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!kalit) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY topilmadi. Supabase loyihasi sozlamalaridan (API keys) oling.',
    );
  }
  return kalit;
}

/** Yuklangan fayllar saqlanadigan Storage bucket nomi */
export const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'media';
