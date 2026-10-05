import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Ikki vazifa:
 *   1. Saytning ochiq qismi — next-intl tilni aniqlaydi va manzilga qoʻshadi
 *   2. `/admin` — Supabase sessiyasi yangilanadi va kirmagan odam qaytariladi
 *
 * Sessiya cookieʼsini aynan shu yerda yangilash kerak: server komponentlar
 * cookie yoza olmaydi, shuning uchun token muddati oʻtsa faqat middleware uni
 * uzaytira oladi.
 */

async function adminMiddleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kalit =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Muhit oʻzgaruvchilari yoʻq boʻlsa — sahifaning oʻzi tushunarli xato beradi
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

  /**
   * `getClaims()` tokenni Supabase loyihasining ochiq kaliti bilan SHU YERDA
   * tekshiradi — tarmoqqa chiqmaydi (kalitlar bir marta olinib keshlanadi).
   * Ilgari ishlatilgan `getUser()` har bir soʻrovda Supabase serveriga
   * borardi: borib-kelish ~0.5 soniya, yaʼni admin paneldagi har bir sahifa
   * shuncha kutib turardi.
   *
   * Bu yerda faqat "kirganmi yoki yoʻq" tekshiriladi. Haqiqiy huquq esa
   * `joriySessiya()` da: u bazadan rolni va hisob faolligini oʻqiydi.
   */
  const { data: dalil } = await supabase.auth.getClaims();

  const kirishSahifasi = request.nextUrl.pathname.startsWith('/admin/kirish');

  if (!dalil?.claims && !kirishSahifasi) {
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
  // - /admin koʻp tilli emas (faqat oʻzbekcha), lekin sessiya uchun tekshiriladi
  matcher: ['/', '/admin/:path*', '/(uz|ru|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
