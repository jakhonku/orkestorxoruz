import type { Maydon } from './turlar';

/**
 * Kalit/qiymat koʻrinishida saqlanadigan shakllarning maydonlari.
 *
 * Alohida faylda turadi, chunki `sozlamalar.ts` — server amali (`use server`)
 * va undan faqat async funksiya eksport qilish mumkin.
 *
 * Bunday shakllar `settings` jadvaliga yoziladi — roʻyxati yoʻq, bitta
 * sahifaning oʻzi tahrirlanadi ("Sayt sozlamalari", "Faoliyat sahifasi").
 */

export const SOZLAMA_MAYDONLARI: Maydon[] = [
  { nom: 'siteName', yorliq: 'Tashkilot nomi', tur: 'kopTilli', talab: true },
  {
    nom: 'siteShortName',
    yorliq: 'Qisqa nomi',
    tur: 'kopTilli',
    izoh: 'Logotip yonida va footerda chiqadi — masalan «Orkestr va Xor»',
  },
  {
    nom: 'logoSubline',
    yorliq: 'Logotip ostidagi yozuv',
    tur: 'kopTilli',
    izoh: 'Qisqa nom ostidagi mayda yozuv — masalan «Ijodiy birlashma»',
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
    nom: 'aboutHeaderImage',
    yorliq: '«Birlashma haqida» sahifasi bannerdagi rasm',
    tur: 'rasm',
    izoh:
      'Sahifaning eng tepasidagi toʻq koʻk bannerda, sarlavhaning oʻng yonida chiqadi. ' +
      'Gorizontal, 900×700. Boʻsh qoldirilsa banner avvalgidek faqat matndan iborat boʻladi.',
  },
  {
    nom: 'pressKitUrl',
    yorliq: 'Press-kit fayli',
    tur: 'fayl',
    izoh: '"Media → Matbuot uchun" boʻlimidagi yuklab olish tugmasi. Boʻsh boʻlsa tugma koʻrinmaydi',
  },
  {
    nom: 'showKpi',
    yorliq: 'Bosh sahifada «Raqamlarda birlashma» bloki koʻrinsin',
    tur: 'belgi',
    izoh:
      'Belgi olib tashlansa blok saytda umuman chiqmaydi. Koʻrsatkichlarning oʻzi ' +
      '«Raqamlar (KPI)» boʻlimida kiritiladi — u yerda bironta ochiq koʻrsatkich ' +
      'boʻlmasa, belgi turgan boʻlsa ham blok koʻrinmaydi.',
  },
  {
    nom: 'showEnsembleMembers',
    yorliq: 'Jamoa sahifasida «Tarkib» bloki koʻrinsin',
    tur: 'belgi',
    izoh:
      'Jamoaning aʼzolari roʻyxati. Belgi olib tashlansa blok saytda umuman chiqmaydi — ' +
      'maʼlumot hali yigʻilmagan boʻlsa shunday qoldiring. Belgi tursa ham, jamoaga ' +
      'bironta aʼzo kiritilmagan boʻlsa blok koʻrinmaydi.',
  },
  {
    nom: 'showEnsembleRepertoire',
    yorliq: 'Jamoa sahifasida «Repertuar» bloki koʻrinsin',
    tur: 'belgi',
    izoh:
      'Jamoaning asarlar roʻyxati. Belgi olib tashlansa blok saytda umuman chiqmaydi. ' +
      'Belgi tursa ham, repertuar kiritilmagan jamoada blok koʻrinmaydi.',
  },
  {
    nom: 'talentOpen',
    yorliq: 'Talent platformasi saytda koʻrinsin',
    tur: 'belgi',
    izoh:
      'Belgi olib tashlansa «Talent» sahifasi saytda umuman koʻrinmaydi: menyudan, ' +
      'footerdan va bosh sahifadagi yoʻnalishlardan ' +
      'chiqib ketadi, manzili toʻgʻridan-toʻgʻri terilsa ham sahifa topilmadi deb ' +
      'javob beradi va ariza qabul qilinmaydi. Oldin kelgan arizalar joyida qoladi. ' +
      'Shu tugma admin panelning bosh sahifasida ham bor — bir bosishda yopib-ochiladi.',
  },
  { nom: 'address', yorliq: 'Manzil', tur: 'kopTilli' },
  { nom: 'workingHours', yorliq: 'Ish vaqti', tur: 'kopTilli' },
  { nom: 'phone', yorliq: 'Telefon', tur: 'matn', yarim: true },
  { nom: 'email', yorliq: 'Email', tur: 'matn', yarim: true },
  { nom: 'siteUrl', yorliq: 'Sayt manzili', tur: 'havola', yarim: true },
  {
    nom: 'notifyEmail',
    yorliq: 'Xabarnoma pochtasi',
    tur: 'matn',
    uzunlik: 200,
    izoh:
      'Yangi ariza kelganda shu manzilga xat boradi. Bir nechta odamga yuborish uchun ' +
      'manzillarni vergul bilan ajrating. Boʻsh qoldirilsa xat saytning oʻz pochtasiga ' +
      '(SMTP_USER) boradi.',
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
 * Sahifaning oʻzi bitta, roʻyxati yoʻq, shuning uchun u ham `settings`
 * jadvalida kalit/qiymat boʻlib yotadi.
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
    izoh: "Boʻsh qator yangi abzatsni boshlaydi",
  },
  {
    nom: 'activityImage',
    yorliq: 'Kirish matni yonidagi rasm',
    tur: 'rasm',
    izoh: "Gorizontal, 900×700. Boʻsh boʻlsa matn butun kenglikni egallaydi",
  },
  {
    nom: 'activityBlocks',
    yorliq: "Yoʻnalish bloklari",
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
          { qiymat: 'graduation-cap', yorliq: "Taʼlim (talent)" },
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
 * Tanlov va festivallar: ochish/yopish va "Ishtirok etish" kartasining umumiy shabloni.
 * Tanlovning oʻzida shu matnlar kiritilgan boʻlsa, oʻshanisi ishlatiladi.
 */
export const TANLOV_MAYDONLARI: Maydon[] = [
  {
    nom: 'tanlovOpen',
    yorliq: 'Tanlov va festivallar saytda ochiq',
    tur: 'belgi',
    izoh:
      'Belgi olib tashlansa tanlov va festivallar saytda koʻrinmaydi: menyudan, footerdan, ' +
      '«Loyihalar» sahifasidan va bosh sahifadan chiqib ketadi, ichiga kirib boʻlmaydi va ariza ' +
      'qabul qilinmaydi. Oldin kelgan arizalar joyida qoladi. Shu tugma admin panelning bosh ' +
      'sahifasida ham bor.',
  },
  {
    nom: 'ishtirokQadamlar',
    yorliq: '«5 qadam» yozuvi',
    tur: 'kopTilli',
    izoh:
      'Karta tepasidagi kichik yozuv. Qadamlar soni oʻzi hisoblanadi — uni {n} deb yozing, ' +
      'masalan: «{n} QADAM». Boʻsh qolsa standart yozuv chiqadi.',
  },
  {
    nom: 'ishtirokSarlavha',
    yorliq: 'Karta sarlavhasi',
    tur: 'kopTilli',
    izoh: 'Boʻsh qolsa — «Ishtirok etish»',
  },
  {
    nom: 'ishtirokMatn',
    yorliq: 'Karta izohi',
    tur: 'kopTilli',
    izoh: 'Boʻsh qolsa — «Ariza onlayn, bir necha qadamda topshiriladi.»',
  },
  {
    nom: 'tayyorlashSarlavha',
    yorliq: '«Oldindan tayyorlab qoʻying» sarlavhasi',
    tur: 'kopTilli',
    izoh: 'Boʻsh qolsa — «Oldindan tayyorlab qoʻying»',
  },
  {
    nom: 'tayyorlashRoyxat',
    yorliq: 'Oldindan tayyorlab qoʻyish kerak boʻlgan narsalar',
    tur: 'kopTilliRoyxat',
    izoh:
      'Har bir band — alohida qatorda. Boʻsh qolsa roʻyxat har bir tanlov anketasidagi fayl va ' +
      'katta matn savollaridan oʻzi olinadi. Alohida tanlovning oʻz roʻyxati boʻlsa, oʻsha ishlatiladi.',
  },
];

/**
 * Kalit/qiymat shakllarining roʻyxati.
 *
 * Saqlash amali maydonlarni shu yerdan oladi — mijozdan kelgan taʼrifga
 * emas, faqat kalitga ishonadi.
 */
export const SOZLAMA_TOPLAMLARI = {
  sayt: SOZLAMA_MAYDONLARI,
  faoliyat: FAOLIYAT_MAYDONLARI,
  tanlov: TANLOV_MAYDONLARI,
} as const;

export type SozlamaToplami = keyof typeof SOZLAMA_TOPLAMLARI;
