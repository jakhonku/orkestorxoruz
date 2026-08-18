import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Barcha manzillar, quyidagilardan tashqari:
  // - api marshrutlari, Next ichki fayllari, kengaytmali fayllar
  // - /admin — admin panel ko'p tilli emas, faqat o'zbek tilida
  matcher: ['/', '/(uz|ru|en)/:path*', '/((?!admin|api|_next|_vercel|.*\\..*).*)'],
};
