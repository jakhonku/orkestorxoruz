import type { Maydon } from './turlar';

/**
 * Kalit/qiymat ko'rinishida saqlanadigan shakllarning maydonlari.
 *
 * Alohida faylda turadi, chunki `sozlamalar.ts` — server amali (`use server`)
 * va undan faqat async funksiya eksport qilish mumkin.
 *
 * Bunday shakllar `settings` jadvaliga yoziladi — ro'yxati yo'q, bitta
 * sahifaning o'zi tahrirlanadi ("Sayt sozlamalari", "Faoliyat sahifasi").
 */

export const SOZLAMA_MAYDONLARI: Maydon[] = [
  { nom: 'siteName', yorliq: 'Tashkilot nomi', tur: 'kopTilli', talab: true },
  {
    nom: 'siteShortName',
    yorliq: 'Qisqa nomi',
    tur: 'kopTilli',
    izoh: 'Menyu va footerda ishlatiladi',
  },
  { nom: 'slogan', yorliq: 'Shior', tur: 'kopTilli' },
  { nom: 'missionText', yorliq: 'Missiya matni', tur: 'kopTilliKatta' },
  {
    nom: 'missionImage',
    yorliq: 'Missiya rasmi',
    tur: 'rasm',
    izoh: '"Birlashma haqida" sahifasida matn yonida chiqadi. Gorizontal, 900×700',
  },
  {
    nom: 'pressKitUrl',
    yorliq: 'Press-kit fayli',
    tur: 'fayl',
    izoh: '"Media → Matbuot uchun" bo‘limidagi yuklab olish tugmasi. Bo‘sh bo‘lsa tugma ko‘rinmaydi',
  },
  {
    nom: 'showKpi',
    yorliq: 'Bosh sahifada «Raqamlarda birlashma» bloki ko‘rinsin',
    tur: 'belgi',
    izoh:
      'Belgi olib tashlansa blok saytda umuman chiqmaydi. Ko‘rsatkichlarning o‘zi ' +
      '«Raqamlar (KPI)» bo‘limida kiritiladi — u yerda bironta ochiq ko‘rsatkich ' +
      'bo‘lmasa, belgi turgan bo‘lsa ham blok ko‘rinmaydi.',
  },
  { nom: 'address', yorliq: 'Manzil', tur: 'kopTilli' },
  { nom: 'workingHours', yorliq: 'Ish vaqti', tur: 'kopTilli' },
  { nom: 'phone', yorliq: 'Telefon', tur: 'matn', yarim: true },
  { nom: 'email', yorliq: 'Email', tur: 'matn', yarim: true },
  { nom: 'siteUrl', yorliq: 'Sayt manzili', tur: 'havola', yarim: true },
  {
    nom: 'notifyEmail',
    yorliq: 'Xabarnoma emaili',
    tur: 'matn',
    yarim: true,
    izoh: 'Yangi arizalar haqida shu manzilga xabar boradi',
  },
  { nom: 'mapLat', yorliq: 'Xarita — kenglik (lat)', tur: 'matn', yarim: true, izoh: 'Masalan: 41.311081' },
  { nom: 'mapLng', yorliq: 'Xarita — uzunlik (lng)', tur: 'matn', yarim: true, izoh: 'Masalan: 69.279737' },
  {
    nom: 'socials',
    yorliq: 'Ijtimoiy tarmoqlar',
    tur: 'qatorlar',
    maydonlar: [
      {
        nom: 'platform',
        yorliq: 'Tarmoq',
        tur: 'tanlov',
        talab: true,
        variantlar: [
          { qiymat: 'telegram', yorliq: 'Telegram' },
          { qiymat: 'instagram', yorliq: 'Instagram' },
          { qiymat: 'facebook', yorliq: 'Facebook' },
          { qiymat: 'youtube', yorliq: 'YouTube' },
          { qiymat: 'x', yorliq: 'X (Twitter)' },
        ],
      },
      { nom: 'url', yorliq: 'Havola', tur: 'havola', talab: true },
    ],
  },
];

/**
 * "Faoliyat" sahifasi (/faoliyat) — menyudagi "Faoliyat" shu yerga olib boradi.
 *
 * Sahifaning o'zi bitta, ro'yxati yo'q, shuning uchun u ham `settings`
 * jadvalida kalit/qiymat bo'lib yotadi.
 */
export const FAOLIYAT_MAYDONLARI: Maydon[] = [
  { nom: 'activityTitle', yorliq: 'Sarlavha', tur: 'kopTilli', talab: true },
  {
    nom: 'activitySubtitle',
    yorliq: 'Sarlavha ostidagi jumla',
    tur: 'kopTilli',
    izoh: 'Bannerda sarlavha ostida chiqadi — 1 jumla',
  },
  {
    nom: 'activityIntro',
    yorliq: 'Kirish matni',
    tur: 'kopTilliKatta',
    izoh: "Bo'sh qator yangi abzatsni boshlaydi",
  },
  {
    nom: 'activityImage',
    yorliq: 'Kirish matni yonidagi rasm',
    tur: 'rasm',
    izoh: "Gorizontal, 900×700. Bo'sh bo'lsa matn butun kenglikni egallaydi",
  },
  {
    nom: 'activityBlocks',
    yorliq: "Yo'nalish bloklari",
    tur: 'qatorlar',
    excel: true,
    izoh: 'Sahifa pastidagi kartochkalar. Havola — sayt ichidagi manzil, masalan /loyihalar',
    maydonlar: [
      { nom: 'title', yorliq: 'Blok nomi', tur: 'kopTilli', talab: true },
      { nom: 'text', yorliq: 'Qisqa tavsif', tur: 'kopTilliKatta' },
      {
        nom: 'href',
        yorliq: 'Havola',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: '/loyihalar', yorliq: 'Loyihalar' },
          { qiymat: '/tanlovlar', yorliq: 'Tanlov va festivallar' },
          { qiymat: '/talent', yorliq: 'Talent platformasi' },
          { qiymat: '/jamoalar', yorliq: 'Jamoalar' },
          { qiymat: '/afisha', yorliq: 'Afisha' },
          { qiymat: '/media', yorliq: 'Media' },
          { qiymat: '/xalqaro', yorliq: 'Xalqaro' },
          { qiymat: '/ekspertlar', yorliq: 'Ekspertlar' },
        ],
      },
      {
        nom: 'icon',
        yorliq: 'Ikonka',
        tur: 'tanlov',
        yarim: true,
        variantlar: [
          { qiymat: 'folder-kanban', yorliq: 'Papka (loyiha)' },
          { qiymat: 'trophy', yorliq: 'Kubok (tanlov)' },
          { qiymat: 'graduation-cap', yorliq: "Ta'lim (talent)" },
          { qiymat: 'users', yorliq: 'Jamoa' },
          { qiymat: 'calendar-days', yorliq: 'Kalendar (afisha)' },
          { qiymat: 'radio', yorliq: 'Media' },
          { qiymat: 'globe', yorliq: 'Globus (xalqaro)' },
        ],
      },
    ],
  },
];

/**
 * Kalit/qiymat shakllarining ro'yxati.
 *
 * Saqlash amali maydonlarni shu yerdan oladi — mijozdan kelgan ta'rifga
 * emas, faqat kalitga ishonadi.
 */
export const SOZLAMA_TOPLAMLARI = {
  sayt: SOZLAMA_MAYDONLARI,
  faoliyat: FAOLIYAT_MAYDONLARI,
} as const;

export type SozlamaToplami = keyof typeof SOZLAMA_TOPLAMLARI;
