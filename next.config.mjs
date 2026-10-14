import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Admin paneldan yuklangan rasmlar Supabase Storageʼda turadi.
 * next/image tashqi manzildan rasm olishi uchun host roʻyxatga qoʻshiladi.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

/** Barcha sahifalarga qoʻshiladigan xavfsizlik sarlavhalari */
const XAVFSIZLIK_SARLAVHALARI = [
  // Saytni BOSHQA saytning <iframe> iga joylab boʻlmaydi (clickjacking).
  // Oʻzini oʻzi ichiga olishi mumkin — koʻrinishni tekshirish uchun qulay.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Brauzer fayl turini oʻzi "taxmin qilmaydi" — faqat serverdagi turga ishonadi
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Tashqi saytga oʻtganda toʻliq manzil emas, faqat domen yuboriladi
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Kamera, mikrofon va joylashuvga hech qanday skript soʻrov yubora olmaydi
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
        : []),
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },

  experimental: {
    // Excel (rasmlar bilan) va rasm oʻgirish — paketlanmay, tayyor holda ishlatiladi
    serverComponentsExternalPackages: ['exceljs', 'sharp'],
    // Maʼlumotnoma PDF uchun shriftlar fayl sifatida oʻqiladi — deployʼga qoʻshilsin
    outputFileTracingIncludes: { '/**': ['./src/server/shriftlar/**'] },
    /**
     * Brauzerdagi "router keshi" — Next sahifalar orasida yurganda ilgari
     * olingan sahifani qayta ishlatadi.
     *
     * `dynamic: 0` — admin panel har doim bazadan yangi maʼlumot oladi.
     * `static: 180` — saytning ochiq qismi (oldindan tayyorlangan sahifalar)
     * 3 daqiqa brauzer keshidan ochiladi: menyu boʻylab yurish va orqaga
     * qaytish darhol boʻladi, serverga soʻrov ketmaydi. Admin panelda
     * kontent saqlanganda `revalidatePath` keshni bekor qiladi, shuning
     * uchun oʻzgarish baribir tez koʻrinadi.
     */
    staleTimes: { dynamic: 0, static: 180 },
  },

  async headers() {
    return [{ source: '/:path*', headers: XAVFSIZLIK_SARLAVHALARI }];
  },
};

export default withNextIntl(nextConfig);
