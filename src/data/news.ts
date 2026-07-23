import type { MediaPhoto, MediaVideo, NewsArticle } from '@/types';
import { img } from '@/lib/images';

export const news: NewsArticle[] = [
  {
    slug: 'yangi-mavsum-ochildi',
    title: {
      uz: 'Yangi konsert mavsumi tantanali ravishda ochildi',
      ru: 'Торжественно открыт новый концертный сезон',
      en: 'The new concert season has officially opened',
    },
    category: 'yangilik',
    cover: img('news-season', 1200, 800),
    date: '2026-09-06',
    author: { uz: 'Matbuot xizmati', ru: 'Пресс-служба', en: 'Press office' },
    excerpt: {
      uz: 'Davlat simfonik orkestri ijrosidagi bayram konserti bilan yangi mavsum boshlandi.',
      ru: 'Новый сезон начался праздничным концертом Государственного симфонического оркестра.',
      en: 'The new season began with a festive concert by the State Symphony Orchestra.',
    },
    body: {
      uz: [
        'Kecha poytaxtda yangi konsert mavsumining tantanali ochilishi bo‘lib o‘tdi. Dasturda milliy bastakorlar asarlari va jahon klassikasi namunalari yangradi.',
        'Konsertda mamlakatning yetakchi solistlari ishtirok etdi. Tashkilotchilar mavsum davomida o‘nlab yangi loyihalarni amalga oshirishni rejalashtirmoqda.',
      ],
      ru: [
        'Вчера в столице состоялось торжественное открытие нового концертного сезона. В программе прозвучали произведения национальных композиторов и образцы мировой классики.',
        'В концерте приняли участие ведущие солисты страны. Организаторы планируют реализовать десятки новых проектов в течение сезона.',
      ],
      en: [
        'The gala opening of the new concert season took place in the capital yesterday, featuring works by national composers and world classics.',
        'Leading soloists of the country took part. Organisers plan to deliver dozens of new projects throughout the season.',
      ],
    },
    featured: true,
  },
  {
    slug: 'juilliard-hamkorlik',
    title: {
      uz: 'Juilliard School bilan hamkorlik memorandumi imzolandi',
      ru: 'Подписан меморандум о сотрудничестве с Juilliard School',
      en: 'Memorandum of cooperation signed with Juilliard School',
    },
    category: 'yangilik',
    cover: img('news-juilliard', 1200, 800),
    date: '2026-08-22',
    author: { uz: 'Xalqaro bo‘lim', ru: 'Международный отдел', en: 'International department' },
    excerpt: {
      uz: 'Yosh musiqachilar uchun malaka oshirish dasturi yo‘lga qo‘yiladi.',
      ru: 'Будет запущена программа повышения квалификации для молодых музыкантов.',
      en: 'A professional development programme for young musicians will be launched.',
    },
    body: {
      uz: [
        'Hujjatga ko‘ra, iste’dodli o‘zbek musiqachilari jahonning nufuzli ta’lim maskanida malaka oshirish imkoniyatiga ega bo‘ladi.',
        'Dastur master-klasslar, amaliyot va o‘zaro gastrollarni o‘z ichiga oladi.',
      ],
      ru: [
        'Согласно документу, талантливые узбекские музыканты получат возможность повысить квалификацию в престижном учебном заведении мира.',
        'Программа включает мастер-классы, практику и взаимные гастроли.',
      ],
      en: [
        'Under the agreement, talented Uzbek musicians will be able to develop their skills at one of the world’s most prestigious institutions.',
        'The programme includes master classes, practice and mutual tours.',
      ],
    },
    featured: true,
  },
  {
    slug: 'musiqa-poyezdi-yakunlandi',
    title: {
      uz: '"Musiqa poyezdi" loyihasi muvaffaqiyatli yakunlandi',
      ru: 'Проект «Музыкальный поезд» успешно завершён',
      en: 'The “Music Train” project concluded successfully',
    },
    category: 'yangilik',
    cover: img('news-train', 1200, 800),
    date: '2026-06-30',
    author: { uz: 'Matbuot xizmati', ru: 'Пресс-служба', en: 'Press office' },
    excerpt: {
      uz: 'Besh shaharda bo‘lib o‘tgan konsertlarni 12 mingdan ortiq tomoshabin tomosha qildi.',
      ru: 'Концерты в пяти городах посетили более 12 тысяч зрителей.',
      en: 'Concerts in five cities were attended by more than 12,000 spectators.',
    },
    body: {
      uz: [
        'Loyiha doirasida akademik musiqa mamlakatning turli hududlariga yetib bordi. Har bir shaharda ochiq konsertlar va ma’rifiy uchrashuvlar tashkil etildi.',
        'Tashkilotchilar loyihani kelgusi yilda ham davom ettirishni maqsad qilgan.',
      ],
      ru: [
        'В рамках проекта академическая музыка дошла до разных регионов страны. В каждом городе прошли открытые концерты и просветительские встречи.',
        'Организаторы намерены продолжить проект и в следующем году.',
      ],
      en: [
        'The project brought academic music to different regions of the country, with open concerts and educational meetings in each city.',
        'Organisers intend to continue the project next year.',
      ],
    },
  },
  {
    slug: 'yosh-dirijyorlar-tanlovi-elon',
    title: {
      uz: 'Yosh dirijyorlar tanloviga arizalar qabuli boshlandi',
      ru: 'Начался приём заявок на конкурс молодых дирижёров',
      en: 'Applications open for the young conductors’ competition',
    },
    category: 'elon',
    cover: img('news-competition', 1200, 800),
    date: '2026-07-01',
    author: { uz: 'Tashkiliy qo‘mita', ru: 'Оргкомитет', en: 'Organising committee' },
    excerpt: {
      uz: 'Dilbar Abduraxmonova nomidagi respublika tanlovida 35 yoshgacha dirijyorlar ishtirok etishi mumkin.',
      ru: 'В республиканском конкурсе имени Дильбар Абдурахмановой могут участвовать дирижёры до 35 лет.',
      en: 'Conductors under 35 may take part in the Dilbar Abdurakhmanova national competition.',
    },
    body: {
      uz: ['Arizalar onlayn tarzda qabul qilinadi. Batafsil shartlar bilan tanlov sahifasida tanishishingiz mumkin.'],
      ru: ['Заявки принимаются онлайн. С подробными условиями можно ознакомиться на странице конкурса.'],
      en: ['Applications are accepted online. Detailed terms are available on the competition page.'],
    },
  },
  {
    slug: 'xalqaro-forum-tayyorgarlik',
    title: {
      uz: 'Xalqaro forumga tayyorgarlik jadal davom etmoqda',
      ru: 'Подготовка к международному форуму идёт полным ходом',
      en: 'Preparations for the international forum are in full swing',
    },
    category: 'yangilik',
    cover: img('news-forum', 1200, 800),
    date: '2026-08-10',
    author: { uz: 'Matbuot xizmati', ru: 'Пресс-служба', en: 'Press office' },
    excerpt: {
      uz: '15 dan ortiq mamlakatdan jamoalar Toshkentga tashrif buyuradi.',
      ru: 'Коллективы из более чем 15 стран посетят Ташкент.',
      en: 'Ensembles from more than 15 countries will visit Tashkent.',
    },
    body: {
      uz: ['Forum dasturi konsertlar, konferensiya va hamkorlik uchrashuvlaridan iborat bo‘ladi.'],
      ru: ['Программа форума будет включать концерты, конференцию и встречи по сотрудничеству.'],
      en: ['The forum programme will include concerts, a conference and partnership meetings.'],
    },
  },
  {
    slug: 'matbuot-uchun-akkreditatsiya',
    title: {
      uz: 'OAV vakillari uchun akkreditatsiya ochiq',
      ru: 'Открыта аккредитация для представителей СМИ',
      en: 'Press accreditation is now open',
    },
    category: 'matbuot',
    cover: img('news-press', 1200, 800),
    date: '2026-08-15',
    author: { uz: 'Matbuot xizmati', ru: 'Пресс-служба', en: 'Press office' },
    excerpt: {
      uz: 'Jurnalistlar mavsum tadbirlarini yoritish uchun akkreditatsiyadan o‘tishi mumkin.',
      ru: 'Журналисты могут пройти аккредитацию для освещения событий сезона.',
      en: 'Journalists may accredit to cover the season’s events.',
    },
    body: {
      uz: ['Akkreditatsiya uchun matbuot xizmatiga murojaat qiling. Foto va matnli materiallar press-kitda mavjud.'],
      ru: ['Для аккредитации обращайтесь в пресс-службу. Фото и текстовые материалы доступны в пресс-ките.'],
      en: ['For accreditation, contact the press office. Photo and text materials are available in the press kit.'],
    },
  },
];

export const mediaVideos: MediaVideo[] = [
  { id: 'v1', title: { uz: 'Mavsum ochilishi — reportaj', ru: 'Открытие сезона — репортаж', en: 'Season opening — report' }, youtubeId: 'jNQXAC9IVRw', date: '2026-09-06' },
  { id: 'v2', title: { uz: 'Ashrafiy — "Amir Temur" simfoniyasi', ru: 'Ашрафи — симфония «Амир Темур»', en: 'Ashrafiy — “Amir Temur” Symphony' }, youtubeId: 'ScMzIvxBSi4', date: '2026-05-12' },
  { id: 'v3', title: { uz: 'Akademik xor — a cappella', ru: 'Академический хор — a cappella', en: 'Academic choir — a cappella' }, youtubeId: 'aqz-KE-bpKQ', date: '2026-04-20' },
  { id: 'v4', title: { uz: '"Musiqa poyezdi" — film', ru: '«Музыкальный поезд» — фильм', en: '“Music Train” — film' }, youtubeId: 'kxL4mSEQmvo', date: '2026-06-30' },
  { id: 'v5', title: { uz: 'Yosh dirijyorlar — master-klass', ru: 'Молодые дирижёры — мастер-класс', en: 'Young conductors — master class' }, youtubeId: 'M7lc1UVf-VE', date: '2026-03-15' },
  { id: 'v6', title: { uz: '"Turon" orkestri — konsert', ru: 'Оркестр «Турон» — концерт', en: '“Turon” orchestra — concert' }, youtubeId: 'e-ORhEE9VVg', date: '2026-02-10' },
];

export const mediaPhotos: MediaPhoto[] = [
  { id: 'p1', src: img('gal-1', 800, 1100), caption: { uz: 'Simfonik kecha', ru: 'Симфонический вечер', en: 'Symphonic evening' }, ratio: 'portrait' },
  { id: 'p2', src: img('gal-2', 1100, 800), caption: { uz: 'Katta zal', ru: 'Большой зал', en: 'Grand hall' }, ratio: 'landscape' },
  { id: 'p3', src: img('gal-3', 900, 900), caption: { uz: 'Dirijyor', ru: 'Дирижёр', en: 'Conductor' }, ratio: 'square' },
  { id: 'p4', src: img('gal-4', 1100, 800), caption: { uz: 'Xor chiqishi', ru: 'Выступление хора', en: 'Choir performance' }, ratio: 'landscape' },
  { id: 'p5', src: img('gal-5', 800, 1100), caption: { uz: 'Solist', ru: 'Солист', en: 'Soloist' }, ratio: 'portrait' },
  { id: 'p6', src: img('gal-6', 900, 900), caption: { uz: 'Milliy cholg‘ular', ru: 'Национальные инструменты', en: 'National instruments' }, ratio: 'square' },
  { id: 'p7', src: img('gal-7', 1100, 800), caption: { uz: 'Ochiq konsert', ru: 'Открытый концерт', en: 'Open-air concert' }, ratio: 'landscape' },
  { id: 'p8', src: img('gal-8', 800, 1100), caption: { uz: 'Repetitsiya', ru: 'Репетиция', en: 'Rehearsal' }, ratio: 'portrait' },
  { id: 'p9', src: img('gal-9', 900, 900), caption: { uz: 'Gastrol', ru: 'Гастроли', en: 'Tour' }, ratio: 'square' },
];

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return news.find((n) => n.slug === slug);
}
