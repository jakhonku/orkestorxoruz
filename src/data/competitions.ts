import type { Competition } from '@/types';
import { img } from '@/lib/images';

export const competitions: Competition[] = [
  {
    slug: 'navruz-sadolari',
    title: {
      uz: '"Navruz Sadolari" xalqaro festivali',
      ru: 'Международный фестиваль «Голоса Навруза»',
      en: '“Voices of Navruz” International Festival',
    },
    kind: 'festival',
    status: 'ochiq',
    cover: img('comp-navruz', 1600, 900),
    date: { uz: '2027-yil 15–21-mart', ru: '15–21 марта 2027', en: '15–21 March 2027' },
    location: { uz: 'Toshkent, Samarqand', ru: 'Ташкент, Самарканд', en: 'Tashkent, Samarkand' },
    shortDescription: {
      uz: 'Navro‘z bayramiga bag‘ishlangan orkestr va xor jamoalarining xalqaro festivali.',
      ru: 'Международный фестиваль оркестровых и хоровых коллективов, посвящённый Наврузу.',
      en: 'An international festival of orchestral and choral ensembles dedicated to Navruz.',
    },
    regulations: {
      uz: 'Festivalda 18 yoshdan oshgan professional va havaskor jamoalar ishtirok etishi mumkin. Dastur milliy va jahon musiqasidan iborat bo‘lishi shart. Ariza va videoyozuv onlayn topshiriladi.',
      ru: 'В фестивале могут участвовать профессиональные и любительские коллективы старше 18 лет. Программа должна включать национальную и мировую музыку. Заявка и видеозапись подаются онлайн.',
      en: 'Open to professional and amateur ensembles over 18. Programmes must include national and world music. Applications and video are submitted online.',
    },
    timeline: [
      { date: { uz: '2026-yil 1-dekabr', ru: '1 декабря 2026', en: '1 December 2026' }, title: { uz: 'Arizalar qabuli boshlanadi', ru: 'Начало приёма заявок', en: 'Applications open' }, description: { uz: 'Onlayn ro‘yxatdan o‘tish ochiladi.', ru: 'Открывается онлайн-регистрация.', en: 'Online registration opens.' } },
      { date: { uz: '2027-yil 1-fevral', ru: '1 февраля 2027', en: '1 February 2027' }, title: { uz: 'Arizalar yakuni', ru: 'Окончание приёма заявок', en: 'Applications close' }, description: { uz: 'Hujjatlar qabuli yakunlanadi.', ru: 'Приём документов завершается.', en: 'Document intake ends.' } },
      { date: { uz: '2027-yil 15-mart', ru: '15 марта 2027', en: '15 March 2027' }, title: { uz: 'Festival ochilishi', ru: 'Открытие фестиваля', en: 'Festival opening' }, description: { uz: 'Gala-konsert bilan ochiladi.', ru: 'Открывается гала-концертом.', en: 'Opens with a gala concert.' } },
    ],
    jury: [
      { name: 'Liliya Bekirova', country: { uz: 'Germaniya', ru: 'Германия', en: 'Germany' }, title: { uz: 'Xor dirijyori', ru: 'Хоровой дирижёр', en: 'Choral conductor' } },
      { name: 'Aziz Shohakimov', country: { uz: 'O‘zbekiston', ru: 'Узбекистан', en: 'Uzbekistan' }, title: { uz: 'Dirijyor', ru: 'Дирижёр', en: 'Conductor' } },
    ],
  },
  {
    slug: 'dilbar-abduraxmonova-tanlovi',
    title: {
      uz: 'Dilbar Abduraxmonova nomidagi Yosh dirijyorlar respublika tanlovi',
      ru: 'Республиканский конкурс молодых дирижёров имени Дильбар Абдурахмановой',
      en: 'Dilbar Abdurakhmanova National Young Conductors Competition',
    },
    kind: 'tanlov',
    status: 'ochiq',
    cover: img('comp-dilbar', 1600, 900),
    date: { uz: '2026-yil 10–17-oktyabr', ru: '10–17 октября 2026', en: '10–17 October 2026' },
    location: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    shortDescription: {
      uz: 'O‘zbekistonning birinchi ayol dirijyori xotirasiga bag‘ishlangan yosh dirijyorlar tanlovi.',
      ru: 'Конкурс молодых дирижёров памяти первой женщины-дирижёра Узбекистана.',
      en: 'A young conductors’ competition in memory of Uzbekistan’s first female conductor.',
    },
    regulations: {
      uz: 'Tanlovda 35 yoshgacha bo‘lgan dirijyorlar qatnashadi. Uch bosqich: dastlabki tanlov, yarim final va orkestr bilan final. G‘oliblar pul mukofoti va gastrol imkoniyatiga ega bo‘ladi.',
      ru: 'В конкурсе участвуют дирижёры до 35 лет. Три тура: отборочный, полуфинал и финал с оркестром. Победители получают денежные премии и гастрольные возможности.',
      en: 'Open to conductors under 35. Three rounds: preliminary, semi-final and a final with orchestra. Winners receive cash prizes and touring opportunities.',
    },
    timeline: [
      { date: { uz: '2026-yil 1-iyul', ru: '1 июля 2026', en: '1 July 2026' }, title: { uz: 'Ro‘yxatga olish', ru: 'Регистрация', en: 'Registration' }, description: { uz: 'Arizalar qabul qilinadi.', ru: 'Приём заявок.', en: 'Applications accepted.' } },
      { date: { uz: '2026-yil 10-oktyabr', ru: '10 октября 2026', en: '10 October 2026' }, title: { uz: 'Dastlabki bosqich', ru: 'Отборочный тур', en: 'Preliminary round' }, description: { uz: 'Nazariy va amaliy sinov.', ru: 'Теоретическое и практическое испытание.', en: 'Theory and practice test.' } },
      { date: { uz: '2026-yil 17-oktyabr', ru: '17 октября 2026', en: '17 October 2026' }, title: { uz: 'Final va mukofotlash', ru: 'Финал и награждение', en: 'Final and awards' }, description: { uz: 'Orkestr bilan final chiqishi.', ru: 'Финальное выступление с оркестром.', en: 'Final performance with orchestra.' } },
    ],
    jury: [
      { name: 'Denis Vlasenko', country: { uz: 'O‘zbekiston', ru: 'Узбекистан', en: 'Uzbekistan' }, title: { uz: 'Bosh dirijyor', ru: 'Главный дирижёр', en: 'Principal conductor' } },
      { name: 'Tigran Shiganyan', country: { uz: 'AQSh', ru: 'США', en: 'USA' }, title: { uz: 'Dirijyor, pedagog', ru: 'Дирижёр, педагог', en: 'Conductor, pedagogue' } },
    ],
  },
  {
    slug: 'muxtor-ashrafiy-tanlovi',
    title: {
      uz: 'Muxtor Ashrafiy nomidagi xalqaro tanlov',
      ru: 'Международный конкурс имени Мухтара Ашрафи',
      en: 'Mukhtor Ashrafiy International Competition',
    },
    kind: 'tanlov',
    status: 'tez-kunda',
    cover: img('comp-ashrafiy', 1600, 900),
    date: { uz: '2027-yil, aprel', ru: 'Апрель 2027', en: 'April 2027' },
    location: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    shortDescription: {
      uz: 'Buyuk o‘zbek bastakori va dirijyori sharafiga o‘tkaziladigan xalqaro musiqa tanlovi.',
      ru: 'Международный музыкальный конкурс в честь великого узбекского композитора и дирижёра.',
      en: 'An international music competition honouring the great Uzbek composer and conductor.',
    },
    regulations: {
      uz: 'Tanlov kompozitsiya, dirijyorlik va cholg‘u ijrochiligi yo‘nalishlarida o‘tkaziladi. Nizom keyinroq e’lon qilinadi.',
      ru: 'Конкурс проводится по направлениям композиции, дирижирования и инструментального исполнительства. Положение будет опубликовано позже.',
      en: 'Held in composition, conducting and instrumental performance. Regulations to be published later.',
    },
    timeline: [
      { date: { uz: '2026-yil, dekabr', ru: 'Декабрь 2026', en: 'December 2026' }, title: { uz: 'Nizom e’loni', ru: 'Публикация положения', en: 'Regulations published' }, description: { uz: 'To‘liq shartlar e’lon qilinadi.', ru: 'Будут объявлены полные условия.', en: 'Full terms announced.' } },
      { date: { uz: '2027-yil, aprel', ru: 'Апрель 2027', en: 'April 2027' }, title: { uz: 'Tanlov o‘tkaziladi', ru: 'Проведение конкурса', en: 'Competition held' }, description: { uz: 'Barcha bosqichlar o‘tkaziladi.', ru: 'Проводятся все туры.', en: 'All rounds take place.' } },
    ],
    jury: [
      { name: 'Nasser Sahim', country: { uz: 'Qatar', ru: 'Катар', en: 'Qatar' }, title: { uz: 'Bastakor', ru: 'Композитор', en: 'Composer' } },
    ],
  },
  {
    slug: 'damli-sozlar-navosi',
    title: {
      uz: '"Damli sozlar navosi" xalqaro festivali',
      ru: 'Международный фестиваль «Дамли созлар навоси»',
      en: '“Damli Sozlar Navosi” International Festival',
    },
    kind: 'festival',
    status: 'yopiq',
    cover: img('comp-damli', 1600, 900),
    date: { uz: '2026-yil 5–9-may', ru: '5–9 мая 2026', en: '5–9 May 2026' },
    location: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    shortDescription: {
      uz: 'Damli (nafasli) cholg‘u asboblari va duxovoy orkestrlariga bag‘ishlangan festival.',
      ru: 'Фестиваль, посвящённый духовым инструментам и духовым оркестрам.',
      en: 'A festival dedicated to wind instruments and wind orchestras.',
    },
    regulations: {
      uz: 'Festivalda duxovoy orkestrlar va nafasli cholg‘u solistlari ishtirok etadi. Arizalar qabuli yakunlangan.',
      ru: 'В фестивале участвуют духовые оркестры и солисты. Приём заявок завершён.',
      en: 'Wind orchestras and soloists take part. Applications are now closed.',
    },
    timeline: [
      { date: { uz: '2026-yil, mart', ru: 'Март 2026', en: 'March 2026' }, title: { uz: 'Arizalar yopildi', ru: 'Приём заявок завершён', en: 'Applications closed' }, description: { uz: 'Ishtirokchilar tasdiqlandi.', ru: 'Участники утверждены.', en: 'Participants confirmed.' } },
      { date: { uz: '2026-yil, may', ru: 'Май 2026', en: 'May 2026' }, title: { uz: 'Festival o‘tkazildi', ru: 'Фестиваль проведён', en: 'Festival held' }, description: { uz: 'Yakuniy gala-konsert bo‘lib o‘tdi.', ru: 'Состоялся заключительный гала-концерт.', en: 'Closing gala concert took place.' } },
    ],
    jury: [
      { name: 'Feruza Abdurahimova', country: { uz: 'O‘zbekiston', ru: 'Узбекистан', en: 'Uzbekistan' }, title: { uz: 'Dirijyor', ru: 'Дирижёр', en: 'Conductor' } },
    ],
  },
];

export function getCompetitionBySlug(slug: string): Competition | undefined {
  return competitions.find((c) => c.slug === slug);
}
