import type { Localized, Region, SocialLink } from '@/types';

/**
 * Saytning asosiy manzili — sitemap, robots.txt va meta teglar uchun.
 *
 * Tartib: qo'lda ko'rsatilgan manzil -> Vercel'dagi domen -> mahalliy server.
 * Vercel preview'larida shu tufayli havolalar o'sha nusxaga ishora qiladi.
 */
function saytManzili(): string {
  const qol = process.env.NEXT_PUBLIC_SITE_URL;
  if (qol) return qol.endsWith('/') ? qol.slice(0, -1) : qol;

  const vercel =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

export const SITE = {
  name: {
    uz: '"Orkestr va Xor" ijodiy birlashmasi',
    ru: 'Творческое объединение «Оркестр и Хор»',
    en: 'Orchestra and Choir Creative Union',
  } as Localized,
  shortName: {
    uz: 'Orkestr va Xor',
    ru: 'Оркестр и Хор',
    en: 'Orchestra & Choir',
  } as Localized,
  slogan: {
    uz: 'Milliy akademik musiqa madaniyati uchun',
    ru: 'За национальную академическую музыкальную культуру',
    en: 'For a national academic music culture',
  } as Localized,
  url: saytManzili(),
  email: 'info@orkestrvaxor.uz',
  phone: '+998 71 200 00 00',
  address: {
    uz: "Toshkent shahri, Amir Temur shoh ko'chasi, 1-uy",
    ru: 'г. Ташкент, проспект Амира Темура, 1',
    en: '1 Amir Temur Ave, Tashkent',
  } as Localized,
};

export const SOCIALS: SocialLink[] = [
  { platform: 'telegram', url: 'https://t.me/orkestrvaxor' },
  { platform: 'instagram', url: 'https://instagram.com/orkestrvaxor' },
  { platform: 'facebook', url: 'https://facebook.com/orkestrvaxor' },
  { platform: 'youtube', url: 'https://youtube.com/@orkestrvaxor' },
];

export const REGION_NAMES: Record<Region, Localized> = {
  'toshkent-shahri': { uz: 'Toshkent shahri', ru: 'г. Ташкент', en: 'Tashkent city' },
  toshkent: { uz: 'Toshkent viloyati', ru: 'Ташкентская область', en: 'Tashkent region' },
  samarqand: { uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' },
  buxoro: { uz: 'Buxoro', ru: 'Бухара', en: 'Bukhara' },
  xorazm: { uz: 'Xorazm', ru: 'Хорезм', en: 'Khorezm' },
  fargona: { uz: "Farg'ona", ru: 'Фергана', en: 'Fergana' },
  andijon: { uz: 'Andijon', ru: 'Андижан', en: 'Andijan' },
  namangan: { uz: 'Namangan', ru: 'Наманган', en: 'Namangan' },
  qashqadaryo: { uz: 'Qashqadaryo', ru: 'Кашкадарья', en: 'Kashkadarya' },
  surxondaryo: { uz: 'Surxondaryo', ru: 'Сурхандарья', en: 'Surkhandarya' },
  navoiy: { uz: 'Navoiy', ru: 'Навои', en: 'Navoi' },
  jizzax: { uz: 'Jizzax', ru: 'Джизак', en: 'Jizzakh' },
  sirdaryo: { uz: 'Sirdaryo', ru: 'Сырдарья', en: 'Syrdarya' },
  qoraqalpogiston: { uz: "Qoraqalpog'iston", ru: 'Каракалпакстан', en: 'Karakalpakstan' },
};

/** Primary navigation — keys map to messages.Nav.* labels */
export const NAV_ITEMS: { key: string; href: string; children?: { key: string; href: string }[] }[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/haqida' },
  { key: 'ensembles', href: '/jamoalar' },
  {
    key: 'activity',
    href: '/loyihalar',
    children: [
      { key: 'projects', href: '/loyihalar' },
      { key: 'competitions', href: '/tanlovlar' },
      { key: 'talent', href: '/talent' },
    ],
  },
  { key: 'afisha', href: '/afisha' },
  {
    key: 'news',
    href: '/media',
    children: [
      { key: 'media', href: '/media' },
      { key: 'experts', href: '/ekspertlar' },
    ],
  },
  { key: 'contact', href: '/aloqa' },
];
