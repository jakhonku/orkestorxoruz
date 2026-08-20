import type { Maydon } from './turlar';

/**
 * Sayt sozlamalari shaklidagi maydonlar.
 *
 * Alohida faylda turadi, chunki `sozlamalar.ts` — server amali (`use server`)
 * va undan faqat async funksiya eksport qilish mumkin.
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
