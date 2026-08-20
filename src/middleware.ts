import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Ikki vazifa:
 *   1. Saytning ochiq qismi — next-intl tilni aniqlaydi va manzilga qo'shadi
 *   2. `/admin` — Supabase sessiyasi yangilanadi va kirmagan odam qaytariladi
 *
 * Sessiya cookie'sini aynan shu yerda yangilash kerak: server komponentlar
 * cookie yoza olmaydi, shuning uchun token muddati o'tsa faqat middleware uni
 * uzaytira oladi.
 */

async function adminMiddleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kalit =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Muhit o'zgaruvchilari yo'q bo'lsa — sahifaning o'zi tushunarli xato beradi
  if (!url || !kalit) return NextResponse.next();

  let javob = NextResponse.next({ request });

  const supabase = createServerClient(url, kalit, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(royxat) {
        for (const { name, value } of royxat) {
          request.cookies.set(name, value);
        }
        javob = NextResponse.next({ request });
        for (const { name, value, options } of royxat) {
          javob.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const kirishSahifasi = request.nextUrl.pathname.startsWith('/admin/kirish');

  if (!user && !kirishSahifasi) {
    const manzil = request.nextUrl.clone();
    manzil.pathname = '/admin/kirish';
    manzil.search = '';
    return NextResponse.redirect(manzil);
  }

  return javob;
}

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(request);
  }
  return intlMiddleware(request);
}

export const config = {
  // Barcha manzillar, quyidagilardan tashqari:
  // - api marshrutlari, Next ichki fayllari, kengaytmali fayllar
  // - /admin ko'p tilli emas (faqat o'zbekcha), lekin sessiya uchun tekshiriladi
  matcher: ['/', '/admin/:path*', '/(uz|ru|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
