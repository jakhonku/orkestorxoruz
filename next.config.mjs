import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Admin paneldan yuklangan rasmlar Supabase Storage'da turadi.
 * next/image tashqi manzildan rasm olishi uchun host ro'yxatga qo'shiladi.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

/** Barcha sahifalarga qo'shiladigan xavfsizlik sarlavhalari */
const XAVFSIZLIK_SARLAVHALARI = [
  // Saytni BOSHQA saytning <iframe> iga joylab bo'lmaydi (clickjacking).
  // O'zini o'zi ichiga olishi mumkin — ko'rinishni tekshirish uchun qulay.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Brauzer fayl turini o'zi "taxmin qilmaydi" — faqat serverdagi turga ishonadi
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Tashqi saytga o'tganda to'liq manzil emas, faqat domen yuboriladi
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Kamera, mikrofon va joylashuvga hech qanday skript so'rov yubora olmaydi
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
    /**
     * Brauzerdagi "router keshi" — Next sahifalar orasida yurganda ilgari
     * olingan sahifani qayta ishlatadi. Sukut bo'yicha 30 soniya (dinamik) va
     * 5 daqiqa (statik) saqlanadi: admin panelda o'zgartirilgan ma'lumot
     * saytda shuncha vaqt eski holida ko'rinib turishi mumkin edi.
     *
     * 0 — har o'tishda serverdan yangi nusxa olinadi.
     */
    staleTimes: { dynamic: 0, static: 0 },
  },

  async headers() {
    return [{ source: '/:path*', headers: XAVFSIZLIK_SARLAVHALARI }];
  },
};

export default withNextIntl(nextConfig);
