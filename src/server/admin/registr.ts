import { muddatKorinishi, muddatOtdimi } from '@/lib/muddat';
import type { Maydon, RoyxatQatori } from './turlar';

/** Tanlov roʻyxatidagi belgi: holat + ariza muddati */
function belgiMatni(status: string, muddat: Date | null): string | undefined {
  const asosiy = { OCHIQ: 'Ariza ochiq', YOPIQ: 'Ariza yopiq', TEZ_KUNDA: 'Tez kunda' }[status];
  if (status !== 'OCHIQ' || !muddat) return asosiy;
  const vaqt = muddatKorinishi(muddat);
  return muddatOtdimi(muddat) ? `Muddat tugagan (${vaqt})` : `Ariza ochiq · ${vaqt} gacha`;
}

/**
 * Barcha admin boʻlimlarining tavsifi.
 *
 * Bitta boʻlim qoʻshish uchun shu yerga yangi yozuv yozish kifoya —
 * roʻyxat sahifasi, tahrirlash shakli va saqlash amallari avtomatik ishlaydi.
 */
export type Bolim = {
  /** Manzildagi qism: /admin/<kalit> */
  kalit: string;
  nom: string;
  /** Birlikda — "Yangi jamoa qoʻshish" kabi sarlavhalar uchun */
  birlik: string;
  /** Prisma modeli nomi (db.<model>) */
  model: string;
  /**
   * Saytdagi manzil (slug) shu maydondan avtomatik yasaladi.
   * Admin panelda alohida maydon yoʻq — muharrir manzil haqida oʻylamaydi.
   */
  slugManbasi?: string;
  /**
   * Kodda belgilangan manzillar — ular bilan bir xil slug yozilmaydi.
   * Masalan /xalqaro/loyihalar doimiy sahifa: shu nomli yozuv yaratilsa,
   * uning sahifasi hech qachon ochilmaydi.
   */
  bandSluglar?: string[];
  maydonlar: Maydon[];
  /** Roʻyxatdagi qatorni yasaydi */
  qator: (row: Record<string, any>) => RoyxatQatori;
  /** Ichki jadvallar: shakl maydoni nomi -> Prisma bogʻlanish nomi */
  bogliqlar?: Record<string, string>;
  /** Roʻyxat tartibi */
  saralash?: Record<string, 'asc' | 'desc'>[];
  /**
   * Bir model ikki boʻlimga boʻlinganda (masalan mahalliy / xorijiy ekspertlar):
   * roʻyxat va sanoq faqat shu shartga mos yozuvlarni oladi.
   */
  filtr?: Record<string, unknown>;
  /** Saqlashda shu boʻlimning yozuviga har doim yoziladigan qiymatlar */
  majburiy?: Record<string, unknown>;
  /** Roʻyxatda sichqoncha bilan sudrab tartiblash mumkinmi (`sortOrder` ustuni kerak) */
  suriladi?: boolean;
  /** Yangi yozuv qoʻshish mumkinmi */
  qoshishMumkin?: boolean;
  izoh?: string;
};

// ---------- qayta ishlatiladigan maydonlar ----------

const nashr: Maydon = {
  nom: 'published',
  yorliq: 'Saytda koʻrinsin',
  tur: 'belgi',
  izoh: 'Belgilanmagan boʻlsa — qoralama, saytda chiqmaydi',
};

const tartib: Maydon = {
  nom: 'sortOrder',
  yorliq: 'Tartib raqami',
  tur: 'raqam',
  yarim: true,
  bosh: 0,
  izoh: 'Kichik raqam yuqorida turadi',
  qoshimcha: true,
};

const tanlangan: Maydon = {
  nom: 'featured',
  yorliq: 'Bosh sahifada koʻrsatilsin',
  tur: 'belgi',
  yarim: true,
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
  { qiymat: 'FARGONA', yorliq: "Fargʻona" },
  { qiymat: 'ANDIJON', yorliq: 'Andijon' },
  { qiymat: 'NAMANGAN', yorliq: 'Namangan' },
  { qiymat: 'QASHQADARYO', yorliq: 'Qashqadaryo' },
  { qiymat: 'SURXONDARYO', yorliq: 'Surxondaryo' },
  { qiymat: 'NAVOIY', yorliq: 'Navoiy' },
  { qiymat: 'JIZZAX', yorliq: 'Jizzax' },
  { qiymat: 'SIRDARYO', yorliq: 'Sirdaryo' },
  { qiymat: 'QORAQALPOGISTON', yorliq: "Qoraqalpogʻiston" },
];

const uz = (v: unknown): string => (v as { uz?: string })?.uz ?? '';

// ---------- boʻlimlar ----------

export const BOLIMLAR: Bolim[] = [
  // ============ JAMOALAR ============
  {
    kalit: 'jamoalar',
    nom: 'Jamoalar',
    birlik: 'jamoa',
    model: 'ensemble',
    slugManbasi: 'name',
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
      tavsif: `${uz(r.conductor)} · ${r.memberCount ?? '—'} aʼzo`,
      belgi: { ORKESTR: 'Orkestr', XOR: 'Xor', ANSAMBL: 'Ansambl' }[r.type as string],
      ochiqmi: r.published,
      rasm: r.bannerUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'Jamoa nomi', tur: 'kopTilli', talab: true },
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
      { nom: 'conductor', yorliq: 'Bosh dirijyor / rahbar', tur: 'kopTilli', talab: true },
      { nom: 'memberCount', yorliq: "Aʼzolar soni", tur: 'raqam', yarim: true },
      { nom: 'foundedYear', yorliq: 'Tashkil etilgan yil', tur: 'raqam', yarim: true, qoshimcha: true },
      { nom: 'phone', yorliq: 'Telefon', tur: 'matn', yarim: true, uzunlik: 40, qoshimcha: true },
      { nom: 'email', yorliq: 'Email', tur: 'matn', yarim: true, uzunlik: 160, qoshimcha: true },
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
        excel: true,
        izoh: "Bittalab kiritish yoki Excel jadvalni butunlay yuklash — aʼzolar soni koʻp boʻlsa ikkinchisi qulay",
        maydonlar: [
          { nom: 'name', yorliq: 'F.I.SH.', tur: 'kopTilli', talab: true },
          { nom: 'role', yorliq: 'Lavozimi', tur: 'kopTilli' },
        ],
      },
      {
        nom: 'repertoire',
        yorliq: 'Repertuar',
        tur: 'qatorlar',
        excel: true,
        maydonlar: [
          { nom: 'composer', yorliq: 'Bastakor', tur: 'kopTilli', talab: true },
          { nom: 'work', yorliq: 'Asar nomi', tur: 'kopTilli' },
        ],
      },
      galereya(),
      {
        nom: 'videos',
        yorliq: 'Videolar',
        tur: 'qatorlar',
        izoh:
          'Har bir qatorda ikkitadan BITTASINI toʻldiring: YouTube havolasi yoki ' +
          'Instagram post/reel havolasi.',
        maydonlar: [
          {
            nom: 'youtubeId',
            yorliq: 'YouTube ID',
            tur: 'youtube',
            yarim: true,
            uzunlik: 40,
            izoh: 'Toʻliq havolani ham qoʻyish mumkin — ID oʻzi ajratiladi',
          },
          {
            nom: 'instagramUrl',
            yorliq: 'Instagram havolasi',
            tur: 'instagram',
            yarim: true,
            izoh: 'Post yoki reel havolasi — masalan https://www.instagram.com/reel/ABC123/',
          },
          { nom: 'title', yorliq: 'Video nomi', tur: 'kopTilli' },
          {
            nom: 'coverUrl',
            yorliq: 'Muqova rasmi',
            tur: 'rasm',
            izoh:
              'Instagram videosi uchun. Boʻsh boʻlsa Instagram belgisi chiqadi. ' +
              'YouTube oʻz rasmini oladi',
          },
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
    slugManbasi: 'title',
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
      {
        nom: 'scope',
        yorliq: "Koʻlami",
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
      { nom: 'location', yorliq: "Oʻtkaziladigan joy", tur: 'kopTilli', talab: true },
      { nom: 'shortDescription', yorliq: 'Qisqa tavsif', tur: 'kopTilliKatta', talab: true },
      { nom: 'description', yorliq: "Toʻliq tavsif", tur: 'kopTilliKatta', talab: true },
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
      { nom: 'partnersNote', yorliq: 'Hamkor tashkilotlar', tur: 'kopTilli', qoshimcha: true },
      {
        nom: 'websiteUrl',
        yorliq: 'Loyiha sayti',
        tur: 'havola',
        izoh:
          'Loyihaning oʻz sayti yoki rasmiy sahifasi — masalan https://example.org. ' +
          'Ayniqsa xalqaro loyihalar uchun. Toʻldirilsa, loyihaning «Batafsil» ' +
          'sahifasida «Loyiha saytiga oʻtish» tugmasi chiqadi va yangi oynada ' +
          'oʻsha saytni ochadi. Boʻsh qoldirilsa tugma koʻrinmaydi.',
      },
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
    slugManbasi: 'title',
    bogliqlar: { timeline: 'timeline', jury: 'jury', documents: 'documents', notes: 'notes' },
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: uz(r.date),
      belgi: belgiMatni(r.status as string, r.applicationDeadline as Date | null),
      ochiqmi: r.published,
      rasm: r.coverUrl,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Nomi', tur: 'kopTilli', talab: true },
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
      {
        nom: 'applicationDeadline',
        yorliq: 'Ariza qabul qilish tugaydigan sana va vaqt',
        tur: 'sanaVaqt',
        yarim: true,
        izoh:
          'Toshkent vaqti bilan. Shu vaqtdan keyin ariza qabul qilinmaydi va tanlov avtomatik ' +
          '«Ariza yopiq» boʻladi. Har bir tanlov uchun alohida. Boʻsh qolsa — muddat cheklanmaydi ' +
          '(faqat yuqoridagi «Holati» hal qiladi).',
      },
      {
        nom: 'detailOpen',
        yorliq: 'Tez kunda boʻlsa ham batafsil sahifa ochiq boʻlsin',
        tur: 'belgi',
        izoh: 'Faqat «Tez kunda» holatida ishlaydi. Belgilanmasa, tanlov roʻyxatda koʻrinadi, lekin ustiga bosib boʻlmaydi. Ariza ochiq yoki yopiq boʻlsa, sahifa doim ochiq.',
      },
      { nom: 'date', yorliq: "Oʻtkazilish sanasi", tur: 'kopTilli', talab: true, izoh: 'Masalan: 2027-yil 15–21-mart' },
      { nom: 'location', yorliq: "Oʻtkaziladigan joy", tur: 'kopTilli', talab: true },
      { nom: 'shortDescription', yorliq: 'Qisqa tavsif', tur: 'kopTilliKatta', talab: true },
      { nom: 'regulations', yorliq: 'Nizom matni', tur: 'kopTilliKatta', talab: true, boy: true },
      { nom: 'regulationsFileUrl', yorliq: 'Nizom fayli', tur: 'fayl' },
      {
        nom: 'applicationEmail',
        yorliq: 'Arizalar tushadigan email',
        tur: 'matn',
        yarim: true,
        uzunlik: 160,
        qoshimcha: true,
      },
      { nom: 'coverUrl', yorliq: 'Muqova rasmi', tur: 'rasm' },
      {
        nom: 'contactPhone',
        yorliq: 'Bogʻlanish uchun telefon raqam',
        tur: 'matn',
        yarim: true,
        uzunlik: 40,
        izoh:
          'Masalan +998 90 123 45 67. Toʻldirilsa, tanlov sahifasida "Bogʻlanish" tugmasi chiqadi — ' +
          'bosilganda shu raqamga qoʻngʻiroq qilinadi. Boʻsh qolsa tugma koʻrinmaydi.',
      },
      { nom: 'prizeFund', yorliq: "Mukofot jamgʻarmasi", tur: 'kopTilli', qoshimcha: true },
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
        yorliq: "Hakamlar hayʼati",
        tur: 'qatorlar',
        maydonlar: [
          { nom: 'name', yorliq: 'F.I.SH.', tur: 'kopTilli', talab: true },
          { nom: 'country', yorliq: 'Davlati', tur: 'kopTilli' },
          { nom: 'title', yorliq: 'Lavozimi', tur: 'kopTilli' },
          { nom: 'photoUrl', yorliq: 'Surati', tur: 'rasm' },
        ],
      },
      {
        nom: 'documents',
        yorliq: 'Tayyor hujjatlar',
        tur: 'qatorlar',
        izoh:
          'Shu tanlov uchun yuklab olinadigan hujjatlar: nizom, ariza namunasi, shartnoma va h.k. ' +
          '«Qator qoʻshish» bilan istalgancha qoʻshing — har bir tanlovning hujjatlari alohida.',
        maydonlar: [
          { nom: 'title', yorliq: 'Hujjat nomi', tur: 'kopTilli', talab: true },
          { nom: 'fileUrl', yorliq: 'Fayl', tur: 'fayl', talab: true },
        ],
      },
      {
        nom: 'notes',
        yorliq: 'Notalar',
        tur: 'qatorlar',
        izoh:
          'Ishtirokchilar yuklab oladigan notalar. Tanlov sahifasida «Notalarni yuklab olish» tugmasi chiqadi ' +
          'va alohida sahifada turlar boʻyicha (1-tur, 2-tur, 3-tur...) guruhlanib koʻrsatiladi. ' +
          'Har bir tur uchun (1-tur, 2-tur...) alohida qator qoʻshing va shu turning barcha PDF notalarini bitta ZIP faylga solib yuklang (yoki bitta PDF). Boʻsh qolsa tugma koʻrinmaydi.',
        maydonlar: [
          { nom: 'category', yorliq: 'Tur', tur: 'kopTilli', talab: true, izoh: 'Masalan: 1-tur' },
          { nom: 'title', yorliq: 'Nota nomi', tur: 'kopTilli', talab: true },
          { nom: 'fileUrl', yorliq: 'Nota fayli (ZIP yoki PDF)', tur: 'zip', talab: true },
        ],
      },
      {
        nom: 'formFields',
        yorliq: 'Ariza anketasi',
        tur: 'anketa',
        izoh: 'Saytdagi "Ariza topshirish" oynasida shu savollar chiqadi. Tushgan arizalar — "Tanlov arizalari" boʻlimida.',
      },
      {
        nom: 'participateTitle',
        yorliq: 'Ishtirok kartasi: sarlavha',
        tur: 'kopTilli',
        izoh: 'Boʻsh qolsa — "Ishtirok etish"',
        qoshimcha: true,
      },
      {
        nom: 'participateText',
        yorliq: 'Ishtirok kartasi: qisqa izoh',
        tur: 'kopTilli',
        izoh: 'Boʻsh qolsa — "Ariza onlayn, bir necha qadamda topshiriladi."',
        qoshimcha: true,
      },
      {
        nom: 'prepareTitle',
        yorliq: 'Ishtirok kartasi: roʻyxat sarlavhasi',
        tur: 'kopTilli',
        izoh: 'Boʻsh qolsa — "Oldindan tayyorlab qoʻying"',
        qoshimcha: true,
      },
      {
        nom: 'prepareList',
        yorliq: 'Ishtirok kartasi: tayyorlash kerak boʻlgan narsalar',
        tur: 'kopTilliRoyxat',
        izoh: 'Har bir band — alohida qatorda. Boʻsh qolsa — anketadagi fayl va katta matn savollaridan avtomatik olinadi.',
        qoshimcha: true,
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
    slugManbasi: 'title',
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
      { nom: 'price', yorliq: 'Chipta narxi', tur: 'kopTilli', izoh: 'Masalan: 70 000 soʻmdan' },
      { nom: 'ticketUrl', yorliq: 'Chipta havolasi', tur: 'havola' },
      { nom: 'shortDescription', yorliq: 'Qisqa tavsif', tur: 'kopTilliKatta', talab: true },
      { nom: 'performerNote', yorliq: 'Ijrochi jamoa', tur: 'kopTilli', qoshimcha: true },
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
    slugManbasi: 'title',
    suriladi: true,
    // Avval tartib raqami, keyin yangisi tepada
    saralash: [{ sortOrder: 'asc' }, { date: 'desc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: new Date(r.date).toISOString().slice(0, 10),
      belgi: { YANGILIK: 'Yangilik', MATBUOT: 'Matbuot', ELON: "Eʼlon" }[r.category as string],
      ochiqmi: r.published,
      rasm: r.coverUrl,
    }),
    maydonlar: [
      {
        nom: 'title',
        yorliq: 'Sarlavha',
        tur: 'kopTilli',
        talab: true,
        ixtiyoriyAgar: 'videoUrl',
        izoh:
          'Pastda post havolasi qoʻyilsa, sarlavha shart emas — saytda postning ' +
          'oʻzi koʻrinadi. Yozib qoʻysangiz, roʻyxatda va sahifada shu sarlavha chiqadi.',
      },
      {
        nom: 'category',
        yorliq: 'Turkumi',
        tur: 'tanlov',
        talab: true,
        yarim: true,
        variantlar: [
          { qiymat: 'YANGILIK', yorliq: 'Yangilik' },
          { qiymat: 'MATBUOT', yorliq: 'Matbuot' },
          { qiymat: 'ELON', yorliq: "Eʼlon" },
        ],
      },
      { nom: 'date', yorliq: 'Sanasi', tur: 'sana', talab: true, yarim: true },
      { nom: 'author', yorliq: 'Muallif / manba', tur: 'kopTilli', qoshimcha: true },
      {
        nom: 'excerpt',
        yorliq: 'Qisqa mazmuni',
        tur: 'kopTilliKatta',
        talab: true,
        ixtiyoriyAgar: 'videoUrl',
        izoh: 'Roʻyxatdagi kartochkada chiqadi. Post havolasi qoʻyilsa — shart emas',
      },
      {
        nom: 'body',
        yorliq: "Toʻliq matn",
        tur: 'kopTilliRoyxat',
        talab: true,
        ixtiyoriyAgar: 'videoUrl',
        izoh:
          'Har bir abzats alohida qatorda yoziladi. Post havolasi qoʻyilsa shart ' +
          'emas — matnni postning oʻzi koʻrsatadi',
      },
      { nom: 'coverUrl', yorliq: 'Muqova rasmi', tur: 'rasm', izoh: 'Gorizontal, 1200×800' },
      {
        nom: 'videoUrl',
        yorliq: 'Video yoki post havolasi (YouTube, Instagram, Telegram)',
        tur: 'postHavola',
        izoh:
          'Toʻliq havolani qoʻying — masalan https://youtu.be/… , ' +
          'https://www.instagram.com/reel/… yoki https://t.me/kanal/123 . ' +
          'Yangilik sahifasida muqova ostida chiqadi: YouTube va Instagram pleyer boʻlib ' +
          'oʻsha yerda ochiladi, Telegram posti esa matni va rasmi bilan toʻliq koʻrinadi. ' +
          'Boʻsh qoldirilsa hech narsa koʻrinmaydi.',
      },
      tanlangan,
      {
        ...tartib,
        qoshimcha: false,
        izoh: 'Kichik raqam yuqorida turadi: 1 — birinchi, 2 — ikkinchi. Roʻyxatda sudrab ham oʻzgartirish mumkin.',
      },
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
      'Uchta usuldan BITTASINI toʻldiring: YouTube ID, Instagram havolasi yoki ' +
      'video faylni yuklash. Instagram va yuklangan video uchun muqova rasmini ham qoʻying.',
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
        izoh: 'Toʻliq havolani qoʻysangiz ham boʻladi — ID oʻzi ajratiladi',
      },
      {
        nom: 'instagramUrl',
        yorliq: 'Instagram havolasi',
        tur: 'instagram',
        yarim: true,
        izoh:
          'Post yoki reel havolasi — masalan https://www.instagram.com/reel/ABC123/ . ' +
          'Ilovadagi «Ulashish» havolasi ham boʻladi: saqlaganda sayt uni haqiqiy ' +
          'havolaga aylantiradi. Muqova rasmi qoʻyilsa roʻyxatda chiroyli koʻrinadi.',
      },
      {
        nom: 'fileUrl',
        yorliq: 'Video fayl',
        tur: 'video',
        izoh: 'YouTube ham, Instagram ham boʻlmasa — videoni shu yerdan yuklang',
      },
      {
        nom: 'coverUrl',
        yorliq: 'Muqova rasmi',
        tur: 'rasm',
        izoh: 'Instagram va yuklangan video uchun. YouTube oʻz rasmini oladi',
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
        yorliq: "Yoʻnalishi",
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
      sarlavha: uz(r.name),
      tavsif: uz(r.role),
      ochiqmi: r.published,
      rasm: r.photoUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'F.I.SH.', tur: 'kopTilli', talab: true },
      { nom: 'role', yorliq: 'Lavozimi', tur: 'kopTilli', talab: true },
      { nom: 'photoUrl', yorliq: 'Surati', tur: 'rasm', izoh: 'Vertikal, 600×800' },
      {
        nom: 'bio',
        yorliq: "Qisqacha maʼlumot",
        tur: 'kopTilliKatta',
        izoh: 'Kartochkada chiqadi — 2–3 qator',
      },
      {
        nom: 'fullBio',
        yorliq: "Batafsil maʼlumot",
        tur: 'kopTilliKatta',
        izoh:
          'Rahbar ustiga bosilganda ochiladigan oynada chiqadi: tarjimai hol, ' +
          'mehnat faoliyati, yutuqlar. Boʻsh qator yangi abzatsni boshlaydi',
      },
      { nom: 'honorific', yorliq: 'Unvon / daraja', tur: 'kopTilli', qoshimcha: true },
      { nom: 'receptionDay', yorliq: 'Qabul kunlari', tur: 'kopTilli', qoshimcha: true },
      tartib,
      nashr,
    ],
  },

  // ============ EKSPERTLAR ============
  {
    kalit: 'ekspertlar',
    nom: 'Xorijiy ekspertlar',
    birlik: 'xorijiy ekspert',
    model: 'expert',
    filtr: { local: false },
    majburiy: { local: false },
    slugManbasi: 'name',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.name),
      tavsif: `${uz(r.country)} · ${uz(r.role)}`,
      ochiqmi: r.published,
      rasm: r.photoUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'F.I.SH.', tur: 'kopTilli', talab: true },
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
        yorliq: "Mutaxassislik yoʻnalishlari",
        tur: 'kopTilliRoyxat',
        izoh: 'Har bir yoʻnalish alohida qatorda',
      },
      { nom: 'cooperation', yorliq: 'Hamkorlik shakli', tur: 'kopTilli', qoshimcha: true },
      tartib,
      nashr,
    ],
  },

  // ============ MAHALLIY EKSPERTLAR ============
  {
    kalit: 'mahalliy-ekspertlar',
    nom: 'Mahalliy ekspertlar',
    birlik: 'mahalliy ekspert',
    model: 'expert',
    filtr: { local: true },
    // Davlat maydoni shaklda yoʻq — mahalliy ekspert doim Oʻzbekistondan
    majburiy: {
      local: true,
      countryCode: 'UZ',
      country: { uz: 'Oʻzbekiston', ru: 'Узбекистан', en: 'Uzbekistan' },
    },
    slugManbasi: 'name',
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.name),
      tavsif: uz(r.role),
      ochiqmi: r.published,
      rasm: r.photoUrl,
    }),
    maydonlar: [
      { nom: 'name', yorliq: 'F.I.SH.', tur: 'kopTilli', talab: true },
      { nom: 'role', yorliq: 'Lavozimi / kasbi', tur: 'kopTilli', talab: true },
      { nom: 'photoUrl', yorliq: 'Surati', tur: 'rasm', izoh: 'Vertikal, 600×800' },
      { nom: 'bio', yorliq: 'Biografiyasi', tur: 'kopTilliKatta', talab: true },
      {
        nom: 'specialties',
        yorliq: "Mutaxassislik yoʻnalishlari",
        tur: 'kopTilliRoyxat',
        izoh: 'Har bir yoʻnalish alohida qatorda',
      },
      { nom: 'cooperation', yorliq: 'Hamkorlik shakli', tur: 'kopTilli', qoshimcha: true },
      tartib,
      nashr,
    ],
  },

  // ============ PRESS-RELIZLAR ============
  {
    kalit: 'press',
    nom: 'Press-relizlar',
    birlik: 'press-reliz',
    model: 'pressRelease',
    saralash: [{ sortOrder: 'asc' }, { date: 'desc' }],
    izoh:
      'Saytdagi «Media → Matbuot uchun» boʻlimida chiqadi. Har bir yozuv bitta ' +
      'tadbirga tegishli: tadbir nomi, sanasi va press-reliz matni. Kartochka ' +
      'bosilganda toʻliq matn oynada ochiladi, fayl yuklangan boʻlsa yuklab olish ' +
      'tugmasi ham chiqadi.',
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: new Date(r.date).toISOString().slice(0, 10),
      belgi: r.fileUrl ? 'Fayl bor' : undefined,
      ochiqmi: r.published,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Tadbir nomi', tur: 'kopTilli', talab: true },
      { nom: 'date', yorliq: 'Sanasi', tur: 'sana', talab: true, yarim: true },
      {
        nom: 'summary',
        yorliq: 'Qisqa mazmuni',
        tur: 'kopTilliKatta',
        izoh: 'Roʻyxatdagi kartochkada chiqadi — 1-2 jumla',
      },
      {
        nom: 'body',
        yorliq: 'Press-reliz matni',
        tur: 'kopTilliRoyxat',
        talab: true,
        izoh: 'Har bir abzats alohida qatorda yoziladi',
      },
      {
        nom: 'fileUrl',
        yorliq: 'Press-reliz fayli',
        tur: 'fayl',
        izoh: 'PDF yoki Word. Boʻsh qoldirilsa yuklab olish tugmasi koʻrinmaydi',
      },
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
      {
        nom: 'meta',
        yorliq: 'Fayl haqida',
        tur: 'matn',
        yarim: true,
        bosh: '',
        uzunlik: 60,
        izoh: 'Masalan: PDF · 480 KB',
        qoshimcha: true,
      },
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
    izoh: '"Birlashma haqida" sahifasida raqamlangan kartochkalar boʻlib chiqadi.',
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
      { nom: 'tag', yorliq: 'Yorliq', tur: 'kopTilli', talab: true, izoh: 'Masalan: I yoʻnalish' },
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
    birlik: "koʻrsatkich",
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
      { nom: 'suffix', yorliq: 'Qoʻshimcha belgi', tur: 'matn', yarim: true, bosh: '', uzunlik: 8, izoh: 'Masalan: +' },
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
          { qiymat: 'graduation-cap', yorliq: 'Taʼlim' },
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
      { nom: 'logoText', yorliq: 'Logotip matni', tur: 'matn', talab: true, yarim: true, uzunlik: 60, izoh: 'Rasm boʻlmasa shu matn chiqadi' },
      { nom: 'country', yorliq: 'Davlati', tur: 'kopTilli', talab: true },
      { nom: 'logoUrl', yorliq: 'Logotip', tur: 'rasm', izoh: 'PNG, shaffof fon' },
      { nom: 'url', yorliq: 'Rasmiy sayti', tur: 'havola', yarim: true, qoshimcha: true },
      {
        nom: 'agreement',
        qoshimcha: true,
        yorliq: 'Hamkorlik asosi',
        tur: 'matn',
        uzunlik: 200,
        izoh: 'Faqat ichki foydalanish uchun — saytda chiqmaydi',
      },
      tartib,
      nashr,
    ],
  },

  // ============ XALQARO SAHIFALAR ============
  {
    kalit: 'xalqaro',
    nom: 'Xalqaro sahifalar',
    birlik: 'sahifa',
    model: 'internationalPage',
    slugManbasi: 'title',
    bandSluglar: ['loyihalar'],
    bogliqlar: { links: 'links' },
    saralash: [{ sortOrder: 'asc' }, { id: 'asc' }],
    izoh:
      'Menyudagi «Xalqaro» roʻyxatiga va /xalqaro sahifasiga avtomatik chiqadi. ' +
      'Yangi sahifa qoʻshish uchun kod oʻzgartirish shart emas.',
    qator: (r) => ({
      id: r.id,
      sarlavha: uz(r.title),
      tavsif: `/xalqaro/${r.slug}`,
      ochiqmi: r.published,
      rasm: r.coverUrl,
    }),
    maydonlar: [
      { nom: 'title', yorliq: 'Sahifa nomi', tur: 'kopTilli', talab: true },
      {
        nom: 'summary',
        yorliq: 'Qisqa tavsif',
        tur: 'kopTilliKatta',
        talab: true,
        izoh: 'Bannerda sarlavha ostida va /xalqaro roʻyxatidagi kartochkada chiqadi',
      },
      {
        nom: 'body',
        yorliq: 'Asosiy matn',
        tur: 'kopTilliKatta',
        izoh: 'Boʻsh qator yangi abzatsni boshlaydi',
      },
      { nom: 'coverUrl', yorliq: 'Muqova rasmi', tur: 'rasm', izoh: 'Gorizontal, 1600×900' },
      {
        nom: 'links',
        yorliq: 'Foydali havolalar',
        tur: 'qatorlar',
        excel: true,
        izoh: 'Sahifa oxirida roʻyxat boʻlib chiqadi — hamkor tashkilotlar, hujjatlar va h.k.',
        maydonlar: [
          { nom: 'label', yorliq: 'Havola nomi', tur: 'kopTilli', talab: true },
          { nom: 'url', yorliq: 'Manzil', tur: 'havola', talab: true },
        ],
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
      'Kulrang yozuv — matnning koddagi kaliti, u qaysi sahifada chiqishini koʻrsatadi. ' +
      'Maydon boʻsh qoldirilsa, saytda standart matn koʻrinadi. ' +
      'Kontent (yangiliklar, jamoalar, hujjatlar...), missiya matni va kontakt ' +
      'maʼlumotlari bu yerda emas — oʻz boʻlimlarida tahrirlanadi.',
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
        izoh: 'Uch tilda ham toʻldiring — boʻsh til uchun standart matn ishlatiladi',
      },
    ],
  },
];

export function bolimTop(kalit: string): Bolim | undefined {
  return BOLIMLAR.find((b) => b.kalit === kalit);
}
