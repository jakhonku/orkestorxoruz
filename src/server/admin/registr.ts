import type { Maydon, RoyxatQatori } from './turlar';

/**
 * Barcha admin bo'limlarining tavsifi.
 *
 * Bitta bo'lim qo'shish uchun shu yerga yangi yozuv yozish kifoya —
 * ro'yxat sahifasi, tahrirlash shakli va saqlash amallari avtomatik ishlaydi.
 */
export type Bolim = {
  /** Manzildagi qism: /admin/<kalit> */
  kalit: string;
  nom: string;
  /** Birlikda — "Yangi jamoa qo'shish" kabi sarlavhalar uchun */
  birlik: string;
  /** Prisma modeli nomi (db.<model>) */
  model: string;
  maydonlar: Maydon[];
  /** Ro'yxatdagi qatorni yasaydi */
  qator: (row: Record<string, any>) => RoyxatQatori;
  /** Ichki jadvallar: shakl maydoni nomi -> Prisma bog'lanish nomi */
  bogliqlar?: Record<string, string>;
  /** Ro'yxat tartibi */
  saralash?: Record<string, 'asc' | 'desc'>[];
  /** Yangi yozuv qo'shish mumkinmi */
  qoshishMumkin?: boolean;
  izoh?: string;
};

// ---------- qayta ishlatiladigan maydonlar ----------

const nashr: Maydon = {
  nom: 'published',
  yorliq: 'Saytda ko‘rinsin',
  tur: 'belgi',
  izoh: 'Belgilanmagan bo‘lsa — qoralama, saytda chiqmaydi',
};

const tartib: Maydon = {
  nom: 'sortOrder',
  yorliq: 'Tartib raqami',
  tur: 'raqam',
  yarim: true,
  bosh: 0,
  izoh: 'Kichik raqam yuqorida turadi',
};

const tanlangan: Maydon = {
  nom: 'featured',
  yorliq: 'Bosh sahifada ko‘rsatilsin',
  tur: 'belgi',
  yarim: true,
};

const slug: Maydon = {
  nom: 'slug',
  yorliq: 'Manzil qismi (slug)',
  tur: 'slug',
  talab: true,
  yarim: true,
  uzunlik: 140,
  izoh: 'Faqat lotin harflari va chiziqcha: masalan buxoro-yoshlar-xori',
};

const galereya = (yorliq = 'Foto galereya'): Maydon => ({
  nom: 'gallery',
  yorliq,
  tur: 'qatorlar',
  maydonlar: [
    { nom: 'src', yorliq: 'Rasm', tur: 'rasm', talab: true },
    { nom: 'caption', yorliq: 'Izoh', tur: 'kopTilli' },
  ],
});

export const VILOYATLAR = [
  { qiymat: 'TOSHKENT_SHAHRI', yorliq: 'Toshkent shahri' },
  { qiymat: 'TOSHKENT', yorliq: 'Toshkent viloyati' },
  { qiymat: 'SAMARQAND', yorliq: 'Samarqand' },
  { qiymat: 'BUXORO', yorliq: 'Buxoro' },
  { qiymat: 'XORAZM', yorliq: 'Xorazm' },
  { qiymat: 'FARGONA', yorliq: "Farg'ona" },
  { qiymat: 'ANDIJON', yorliq: 'Andijon' },
  { qiymat: 'NAMANGAN', yorliq: 'Namangan' },
  { qiymat: 'QASHQADARYO', yorliq: 'Qashqadaryo' },
  { qiymat: 'SURXONDARYO', yorliq: 'Surxondaryo' },
  { qiymat: 'NAVOIY', yorliq: 'Navoiy' },
  { qiymat: 'JIZZAX', yorliq: 'Jizzax' },
  { qiymat: 'SIRDARYO', yorliq: 'Sirdaryo' },
  { qiymat: 'QORAQALPOGISTON', yorliq: "Qoraqalpog'iston" },
];

const uz = (v: unknown): string => (v as { uz?: string })?.uz ?? '';

// ---------- bo'limlar ----------

export const BOLIMLAR: Bolim[] = [
  // ============ JAMOALAR ============
  {
    kalit: 'jamoalar',
    nom: 'Jamoalar',
    birlik: 'jamoa',
    model: 'ensemble',
    bogliqlar: {
      members: 'members',
      repertoire: 'repertoire',
      gallery: 'gallery',
      videos: 'videos',
    },
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.name),
      tavsif: `${r.conductor} · ${r.memberCount ?? '—'} a'zo`,
      belgi: { ORKESTR: 'Orkestr', XOR: 'Xor', ANSAMBL: 'Ansambl' }[r.type as string],
      ochiqmi: r.published,
      rasm: r.bannerUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'Jamoa nomi', tur: 'kopTilli', talab: true },
      slug,
      {
        nom: 'type',
        yorliq: 'Turi',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'ORKESTR', yorliq: 'Orkestr' },
          { qiymat: 'XOR', yorliq: 'Xor' },
          { qiymat: 'ANSAMBL', yorliq: 'Ansambl' },
        ],
      },
      { nom: 'region', yorliq: 'Viloyat', tur: 'tanlov', talab: true, yarim: true, variantlar: VILOYATLAR },
      { nom: 'city', yorliq: 'Shahar / tuman', tur: 'kopTilli', talab: true },
      { nom: 'conductor', yorliq: 'Bosh dirijyor / rahbar', tur: 'matn', talab: true, yarim: true, uzunlik: 160 },
      { nom: 'memberCount', yorliq: "A'zolar soni", tur: 'raqam', yarim: true },
      { nom: 'foundedYear', yorliq: 'Tashkil etilgan yil', tur: 'raqam', yarim: true },
      { nom: 'phone', yorliq: 'Telefon', tur: 'matn', yarim: true, uzunlik: 40 },
      { nom: 'email', yorliq: 'Email', tur: 'matn', yarim: true, uzunlik: 160 },
      {
        nom: 'shortDescription',
        yorliq: 'Qisqa tavsif',
        tur: 'kopTilliKatta',
        talab: true,
        izoh: 'Katalogdagi kartochkada chiqadi — 1 jumla, 100–160 belgi',
      },
      { nom: 'history', yorliq: 'Tarixi', tur: 'kopTilliKatta', izoh: '1–2 abzats' },
      { nom: 'bannerUrl', yorliq: 'Banner rasmi', tur: 'rasm', izoh: 'Gorizontal, 1600×700' },
      { nom: 'logoUrl', yorliq: 'Logotip', tur: 'rasm', izoh: 'Kvadrat, 800×800' },
      {
        nom: 'members',
        yorliq: 'Tarkib',
        tur: 'qatorlar',
        izoh: '4–8 ta asosiy shaxs',
        maydonlar: [
          { nom: 'name', yorliq: 'F.I.SH.', tur: 'matn', talab: true, uzunlik: 160 },
          { nom: 'role', yorliq: 'Lavozimi', tur: 'kopTilli' },
        ],
      },
      {
        nom: 'repertoire',
        yorliq: 'Repertuar',
        tur: 'qatorlar',
        maydonlar: [
          { nom: 'composer', yorliq: 'Bastakor', tur: 'matn', talab: true, uzunlik: 160 },
          { nom: 'work', yorliq: 'Asar nomi', tur: 'kopTilli' },
        ],
      },
      galereya(),
      {
        nom: 'videos',
        yorliq: 'Videolar',
        tur: 'qatorlar',
        izoh: 'YouTube video ID — havoladagi v= dan keyingi qism',
        maydonlar: [
          {
            nom: 'youtubeId',
            yorliq: 'YouTube ID',
            tur: 'youtube',
            talab: true,
            uzunlik: 40,
            izoh: 'To‘liq havolani ham qo‘yish mumkin — ID o‘zi ajratiladi',
          },
          { nom: 'title', yorliq: 'Video nomi', tur: 'kopTilli' },
        ],
      },
      tanlangan,
      tartib,
      nashr,
    ],
  },

  // ============ LOYIHALAR ============
  {
    kalit: 'loyihalar',
    nom: 'Loyihalar',
    birlik: 'loyiha',
    model: 'project',
    bogliqlar: { results: 'results', gallery: 'gallery' },
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: uz(r.period),
      belgi: r.scope === 'XALQARO' ? 'Xalqaro' : 'Respublika',
      ochiqmi: r.published,
      rasm: r.coverUrl,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Loyiha nomi', tur: 'kopTilli', talab: true },
      slug,
      {
        nom: 'scope',
        yorliq: "Ko'lami",
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'RESPUBLIKA', yorliq: 'Respublika miqyosida' },
          { qiymat: 'XALQARO', yorliq: 'Xalqaro darajada' },
        ],
      },
      {
        nom: 'status',
        yorliq: 'Holati',
        tur: 'tanlov',
        yarim: true,
        variantlar: [
          { qiymat: 'REJALASHTIRILGAN', yorliq: 'Rejalashtirilgan' },
          { qiymat: 'DAVOM_ETMOQDA', yorliq: 'Davom etmoqda' },
          { qiymat: 'YAKUNLANGAN', yorliq: 'Yakunlangan' },
        ],
      },
      { nom: 'period', yorliq: 'Muddati', tur: 'kopTilli', talab: true, izoh: 'Masalan: 2026-yil, oktyabr' },
      { nom: 'location', yorliq: "O'tkaziladigan joy", tur: 'kopTilli', talab: true },
      { nom: 'shortDescription', yorliq: 'Qisqa tavsif', tur: 'kopTilliKatta', talab: true },
      { nom: 'description', yorliq: "To'liq tavsif", tur: 'kopTilliKatta', talab: true },
      { nom: 'coverUrl', yorliq: 'Muqova rasmi', tur: 'rasm', izoh: 'Gorizontal, 1600×900' },
      {
        nom: 'results',
        yorliq: 'Natijalar',
        tur: 'qatorlar',
        izoh: 'Masalan: Ijrochilar — 250+',
        maydonlar: [
          { nom: 'label', yorliq: 'Nomi', tur: 'kopTilli', talab: true },
          { nom: 'value', yorliq: 'Qiymati', tur: 'matn', talab: true, uzunlik: 60 },
        ],
      },
      galereya('Galereya'),
      { nom: 'partnersNote', yorliq: 'Hamkor tashkilotlar', tur: 'kopTilli' },
      tanlangan,
      tartib,
      nashr,
    ],
  },

  // ============ TANLOVLAR ============
  {
    kalit: 'tanlovlar',
    nom: 'Tanlov va festivallar',
    birlik: 'tanlov',
    model: 'competition',
    bogliqlar: { timeline: 'timeline', jury: 'jury' },
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: uz(r.date),
      belgi: { OCHIQ: 'Ariza ochiq', YOPIQ: 'Ariza yopiq', TEZ_KUNDA: 'Tez kunda' }[r.status as string],
      ochiqmi: r.published,
      rasm: r.coverUrl,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Nomi', tur: 'kopTilli', talab: true },
      slug,
      {
        nom: 'kind',
        yorliq: 'Turi',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'TANLOV', yorliq: 'Tanlov' },
          { qiymat: 'FESTIVAL', yorliq: 'Festival' },
        ],
      },
      {
        nom: 'status',
        yorliq: 'Holati',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'OCHIQ', yorliq: 'Ariza ochiq' },
          { qiymat: 'YOPIQ', yorliq: 'Ariza yopiq' },
          { qiymat: 'TEZ_KUNDA', yorliq: 'Tez kunda' },
        ],
      },
      { nom: 'date', yorliq: "O'tkazilish sanasi", tur: 'kopTilli', talab: true, izoh: 'Masalan: 2027-yil 15–21-mart' },
      { nom: 'location', yorliq: "O'tkaziladigan joy", tur: 'kopTilli', talab: true },
      { nom: 'shortDescription', yorliq: 'Qisqa tavsif', tur: 'kopTilliKatta', talab: true },
      { nom: 'regulations', yorliq: 'Nizom matni', tur: 'kopTilliKatta', talab: true },
      { nom: 'regulationsFileUrl', yorliq: 'Nizom fayli', tur: 'fayl' },
      { nom: 'applicationEmail', yorliq: 'Arizalar tushadigan email', tur: 'matn', yarim: true, uzunlik: 160 },
      { nom: 'coverUrl', yorliq: 'Muqova rasmi', tur: 'rasm' },
      { nom: 'prizeFund', yorliq: "Mukofot jamg'armasi", tur: 'kopTilli' },
      {
        nom: 'timeline',
        yorliq: 'Muddatlar jadvali',
        tur: 'qatorlar',
        maydonlar: [
          { nom: 'date', yorliq: 'Sana', tur: 'kopTilli', talab: true },
          { nom: 'title', yorliq: 'Bosqich nomi', tur: 'kopTilli', talab: true },
          { nom: 'description', yorliq: 'Izoh', tur: 'kopTilli' },
        ],
      },
      {
        nom: 'jury',
        yorliq: "Hakamlar hay'ati",
        tur: 'qatorlar',
        maydonlar: [
          { nom: 'name', yorliq: 'F.I.SH.', tur: 'matn', talab: true, uzunlik: 160 },
          { nom: 'country', yorliq: 'Davlati', tur: 'kopTilli' },
          { nom: 'title', yorliq: 'Lavozimi', tur: 'kopTilli' },
          { nom: 'photoUrl', yorliq: 'Surati', tur: 'rasm' },
        ],
      },
      tartib,
      nashr,
    ],
  },

  // ============ AFISHA ============
  {
    kalit: 'afisha',
    nom: 'Afisha',
    birlik: 'tadbir',
    model: 'concertEvent',
    saralash: [{ date: 'desc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: `${new Date(r.date).toISOString().slice(0, 10)} · ${r.time} · ${uz(r.venue)}`,
      belgi: { KONSERT: 'Konsert', FESTIVAL: 'Festival', FORUM: 'Forum', TANLOV: 'Tanlov' }[
        r.category as string
      ],
      ochiqmi: r.published,
      rasm: r.posterUrl,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Tadbir nomi', tur: 'kopTilli', talab: true },
      slug,
      {
        nom: 'category',
        yorliq: 'Turkumi',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'KONSERT', yorliq: 'Konsert' },
          { qiymat: 'FESTIVAL', yorliq: 'Festival' },
          { qiymat: 'FORUM', yorliq: 'Forum' },
          { qiymat: 'TANLOV', yorliq: 'Tanlov' },
        ],
      },
      { nom: 'date', yorliq: 'Sanasi', tur: 'sana', talab: true, yarim: true },
      { nom: 'time', yorliq: 'Boshlanish vaqti', tur: 'vaqt', talab: true, yarim: true },
      { nom: 'venue', yorliq: 'Zal / muassasa', tur: 'kopTilli', talab: true },
      { nom: 'city', yorliq: 'Shahar', tur: 'kopTilli', talab: true },
      { nom: 'price', yorliq: 'Chipta narxi', tur: 'kopTilli', izoh: 'Masalan: 70 000 so‘mdan' },
      { nom: 'ticketUrl', yorliq: 'Chipta havolasi', tur: 'havola' },
      { nom: 'shortDescription', yorliq: 'Qisqa tavsif', tur: 'kopTilliKatta', talab: true },
      { nom: 'performerNote', yorliq: 'Ijrochi jamoa', tur: 'kopTilli' },
      {
        nom: 'posterUrl',
        yorliq: 'Poster',
        tur: 'rasm',
        izoh: 'VERTIKAL rasm, 900×1200',
      },
      tanlangan,
      nashr,
    ],
  },

  // ============ YANGILIKLAR ============
  {
    kalit: 'yangiliklar',
    nom: 'Yangiliklar',
    birlik: 'yangilik',
    model: 'newsArticle',
    saralash: [{ date: 'desc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: new Date(r.date).toISOString().slice(0, 10),
      belgi: { YANGILIK: 'Yangilik', MATBUOT: 'Matbuot', ELON: "E'lon" }[r.category as string],
      ochiqmi: r.published,
      rasm: r.coverUrl,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Sarlavha', tur: 'kopTilli', talab: true },
      slug,
      {
        nom: 'category',
        yorliq: 'Turkumi',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'YANGILIK', yorliq: 'Yangilik' },
          { qiymat: 'MATBUOT', yorliq: 'Matbuot' },
          { qiymat: 'ELON', yorliq: "E'lon" },
        ],
      },
      { nom: 'date', yorliq: 'Sanasi', tur: 'sana', talab: true, yarim: true },
      { nom: 'author', yorliq: 'Muallif / manba', tur: 'kopTilli' },
      { nom: 'excerpt', yorliq: 'Qisqa mazmuni', tur: 'kopTilliKatta', talab: true },
      {
        nom: 'body',
        yorliq: "To'liq matn",
        tur: 'kopTilliRoyxat',
        talab: true,
        izoh: 'Har bir abzats alohida qatorda yoziladi',
      },
      { nom: 'coverUrl', yorliq: 'Muqova rasmi', tur: 'rasm', izoh: 'Gorizontal, 1200×800' },
      tanlangan,
      nashr,
    ],
  },

  // ============ VIDEOLAR ============
  {
    kalit: 'videolar',
    nom: 'Videolar',
    birlik: 'video',
    model: 'mediaVideo',
    saralash: [{ sortOrder: 'asc' }, { date: 'desc' }],
    izoh:
      'Uchta usuldan BITTASINI to‘ldiring: YouTube ID, Instagram havolasi yoki ' +
      'video faylni yuklash. Instagram va yuklangan video uchun muqova rasmini ham qo‘ying.',
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: new Date(r.date).toISOString().slice(0, 10),
      belgi: r.youtubeId ? 'YouTube' : r.instagramUrl ? 'Instagram' : r.fileUrl ? 'Yuklangan' : '—',
      ochiqmi: r.published,
      rasm: r.youtubeId
        ? `https://i.ytimg.com/vi/${r.youtubeId}/mqdefault.jpg`
        : (r.coverUrl as string) || undefined,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Video nomi', tur: 'kopTilli', talab: true },
      {
        nom: 'youtubeId',
        yorliq: 'YouTube ID',
        tur: 'youtube',
        yarim: true,
        uzunlik: 40,
        izoh: 'To‘liq havolani qo‘ysangiz ham bo‘ladi — ID o‘zi ajratiladi',
      },
      {
        nom: 'instagramUrl',
        yorliq: 'Instagram havolasi',
        tur: 'havola',
        yarim: true,
        izoh: 'Masalan: https://www.instagram.com/reel/ABC123/',
      },
      {
        nom: 'fileUrl',
        yorliq: 'Video fayl',
        tur: 'video',
        izoh: 'YouTube ham, Instagram ham bo‘lmasa — videoni shu yerdan yuklang',
      },
      {
        nom: 'coverUrl',
        yorliq: 'Muqova rasmi',
        tur: 'rasm',
        izoh: 'Instagram va yuklangan video uchun. YouTube o‘z rasmini oladi',
      },
      { nom: 'date', yorliq: 'Sanasi', tur: 'sana', talab: true, yarim: true },
      tartib,
      nashr,
    ],
  },

  // ============ FOTOLAR ============
  {
    kalit: 'fotolar',
    nom: 'Foto galereya',
    birlik: 'surat',
    model: 'mediaPhoto',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.caption) || 'Izohsiz surat',
      belgi: { PORTRAIT: 'Vertikal', LANDSCAPE: 'Gorizontal', SQUARE: 'Kvadrat' }[r.ratio as string],
      ochiqmi: r.published,
      rasm: r.src,
    }),
    maydonlar: [
      { nom: 'src', yorliq: 'Surat', tur: 'rasm', talab: true },
      { nom: 'caption', yorliq: 'Izoh', tur: 'kopTilli' },
      {
        nom: 'ratio',
        yorliq: "Yo'nalishi",
        tur: 'tanlov',
        yarim: true,
        variantlar: [
          { qiymat: 'LANDSCAPE', yorliq: 'Gorizontal' },
          { qiymat: 'PORTRAIT', yorliq: 'Vertikal' },
          { qiymat: 'SQUARE', yorliq: 'Kvadrat' },
        ],
      },
      tartib,
      nashr,
    ],
  },

  // ============ RAHBARIYAT ============
  {
    kalit: 'rahbariyat',
    nom: 'Rahbariyat',
    birlik: 'rahbar',
    model: 'leader',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: r.name,
      tavsif: uz(r.role),
      ochiqmi: r.published,
      rasm: r.photoUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'F.I.SH.', tur: 'matn', talab: true, uzunlik: 160 },
      { nom: 'role', yorliq: 'Lavozimi', tur: 'kopTilli', talab: true },
      { nom: 'photoUrl', yorliq: 'Surati', tur: 'rasm', izoh: 'Vertikal, 600×800' },
      { nom: 'bio', yorliq: "Qisqacha ma'lumot", tur: 'kopTilliKatta' },
      { nom: 'honorific', yorliq: 'Unvon / daraja', tur: 'kopTilli' },
      { nom: 'receptionDay', yorliq: 'Qabul kunlari', tur: 'kopTilli' },
      tartib,
      nashr,
    ],
  },

  // ============ EKSPERTLAR ============
  {
    kalit: 'ekspertlar',
    nom: 'Ekspertlar',
    birlik: 'ekspert',
    model: 'expert',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: r.name,
      tavsif: `${uz(r.country)} · ${uz(r.role)}`,
      ochiqmi: r.published,
      rasm: r.photoUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'F.I.SH.', tur: 'matn', talab: true, uzunlik: 160 },
      slug,
      { nom: 'country', yorliq: 'Davlati', tur: 'kopTilli', talab: true },
      {
        nom: 'countryCode',
        yorliq: 'Davlat kodi',
        tur: 'matn',
        talab: true,
        yarim: true,
        izoh: '2 harfli kod: DE, US, QA — bayroq shundan chiqadi',
      },
      { nom: 'role', yorliq: 'Lavozimi / kasbi', tur: 'kopTilli', talab: true },
      { nom: 'photoUrl', yorliq: 'Surati', tur: 'rasm', izoh: 'Vertikal, 600×800' },
      { nom: 'bio', yorliq: 'Biografiyasi', tur: 'kopTilliKatta', talab: true },
      {
        nom: 'specialties',
        yorliq: "Mutaxassislik yo'nalishlari",
        tur: 'kopTilliRoyxat',
        izoh: 'Har bir yo‘nalish alohida qatorda',
      },
      { nom: 'cooperation', yorliq: 'Hamkorlik shakli', tur: 'kopTilli' },
      tartib,
      nashr,
    ],
  },

  // ============ HUJJATLAR ============
  {
    kalit: 'hujjatlar',
    nom: 'Hujjatlar',
    birlik: 'hujjat',
    model: 'documentLink',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({ id: r.id, sarlavha: uz(r.title), tavsif: r.meta, ochiqmi: r.published }),
    maydonlar: [
      { nom: 'title', yorliq: 'Hujjat nomi', tur: 'kopTilli', talab: true },
      { nom: 'href', yorliq: 'Hujjat fayli', tur: 'fayl', talab: true },
      { nom: 'meta', yorliq: 'Fayl haqida', tur: 'matn', yarim: true, bosh: '', uzunlik: 60, izoh: 'Masalan: PDF · 480 KB' },
      tartib,
      nashr,
    ],
  },

  // ============ VAZIFALAR ============
  {
    kalit: 'vazifalar',
    nom: 'Tashkiliy vazifalar',
    birlik: 'vazifa',
    model: 'aboutTask',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    izoh: '"Birlashma haqida" sahifasida raqamlangan kartochkalar bo‘lib chiqadi.',
    qator: (r) => ({ id: r.id, sarlavha: uz(r.text), ochiqmi: r.published }),
    maydonlar: [
      { nom: 'text', yorliq: 'Vazifa matni', tur: 'kopTilli', talab: true },
      tartib,
      nashr,
    ],
  },

  // ============ SLAYDLAR ============
  {
    kalit: 'slaydlar',
    nom: 'Strategiya slaydlari',
    birlik: 'slayd',
    model: 'strategySlide',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    izoh: 'Bosh ekranda aylanib turadigan slaydlar.',
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: uz(r.tag),
      ochiqmi: r.published,
      rasm: r.imageUrl,
    }),
    maydonlar: [
      { nom: 'tag', yorliq: 'Yorliq', tur: 'kopTilli', talab: true, izoh: 'Masalan: I yo‘nalish' },
      { nom: 'title', yorliq: 'Sarlavha', tur: 'kopTilli', talab: true },
      { nom: 'text', yorliq: 'Matn', tur: 'kopTilliKatta', talab: true },
      {
        nom: 'points',
        yorliq: 'Asosiy nuqtalar',
        tur: 'kopTilliRoyxat',
        izoh: '3 tadan yozilsa chiroyli chiqadi',
      },
      { nom: 'imageUrl', yorliq: 'Fon rasmi', tur: 'rasm', izoh: 'Gorizontal, 1920×1080' },
      tartib,
      nashr,
    ],
  },

  // ============ KPI ============
  {
    kalit: 'kpi',
    nom: 'Raqamlar (KPI)',
    birlik: "ko'rsatkich",
    model: 'kpiStat',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    izoh: 'Bosh sahifada animatsiya bilan sanaladigan raqamlar.',
    qator: (r) => ({
      id: r.id,
      sarlavha: `${r.value}${r.suffix} ${uz(r.label)}`,
      ochiqmi: r.published,
    }),
    maydonlar: [
      { nom: 'value', yorliq: 'Raqam', tur: 'raqam', talab: true, yarim: true },
      { nom: 'suffix', yorliq: 'Qo‘shimcha belgi', tur: 'matn', yarim: true, bosh: '', uzunlik: 8, izoh: 'Masalan: +' },
      { nom: 'label', yorliq: 'Nomi', tur: 'kopTilli', talab: true },
      {
        nom: 'icon',
        yorliq: 'Ikonka',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'compass', yorliq: 'Kompas' },
          { qiymat: 'globe', yorliq: 'Globus' },
          { qiymat: 'landmark', yorliq: 'Bino' },
          { qiymat: 'trophy', yorliq: 'Kubok' },
          { qiymat: 'radio', yorliq: 'Radio' },
          { qiymat: 'graduation-cap', yorliq: 'Ta’lim' },
        ],
      },
      tartib,
      nashr,
    ],
  },

  // ============ HAMKORLAR ============
  {
    kalit: 'hamkorlar',
    nom: 'Hamkorlar',
    birlik: 'hamkor',
    model: 'partner',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: r.name,
      tavsif: uz(r.country),
      ochiqmi: r.published,
      rasm: r.logoUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'Nomi', tur: 'matn', talab: true, uzunlik: 160 },
      { nom: 'logoText', yorliq: 'Logotip matni', tur: 'matn', talab: true, yarim: true, uzunlik: 60, izoh: 'Rasm bo‘lmasa shu matn chiqadi' },
      { nom: 'country', yorliq: 'Davlati', tur: 'kopTilli', talab: true },
      { nom: 'logoUrl', yorliq: 'Logotip', tur: 'rasm', izoh: 'PNG, shaffof fon' },
      { nom: 'url', yorliq: 'Rasmiy sayti', tur: 'havola', yarim: true },
      {
        nom: 'agreement',
        yorliq: 'Hamkorlik asosi',
        tur: 'matn',
        uzunlik: 200,
        izoh: 'Faqat ichki foydalanish uchun — saytda chiqmaydi',
      },
      tartib,
      nashr,
    ],
  },

  // ============ SAHIFA MATNLARI ============
  {
    kalit: 'matnlar',
    nom: 'Sahifa matnlari',
    birlik: 'matn',
    model: 'uiText',
    qoshishMumkin: false,
    saralash: [{ grp: 'asc' }, { sortOrder: 'asc' }],
    izoh:
      'Saytdagi tayyor yozuvlar: tugmalar, sarlavhalar va izohlar. ' +
      'Kulrang yozuv — matnning kodadagi kaliti, u qaysi sahifada chiqishini ko‘rsatadi. ' +
      'Maydon bo‘sh qoldirilsa, saytda standart matn ko‘rinadi. ' +
      'Kontent (yangiliklar, jamoalar, hujjatlar...), missiya matni va kontakt ' +
      'ma’lumotlari bu yerda emas — o‘z bo‘limlarida tahrirlanadi.',
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.value) || r.key,
      tavsif: r.key,
      belgi: r.grp,
    }),
    maydonlar: [
      {
        nom: 'value',
        yorliq: 'Matn',
        tur: 'kopTilliKatta',
        izoh: 'Uch tilda ham to‘ldiring — bo‘sh til uchun standart matn ishlatiladi',
      },
    ],
  },
];

export function bolimTop(kalit: string): Bolim | undefined {
  return BOLIMLAR.find((b) => b.kalit === kalit);
}
