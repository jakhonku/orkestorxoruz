import type { Project } from '@/types';
import { img } from '@/lib/images';

export const projects: Project[] = [
  // ---------------- Respublika ----------------
  {
    slug: 'mustaqillik-35-yillik-konserti',
    title: {
      uz: 'Mustaqillikning 35 yilligiga bag‘ishlangan gala-konsert',
      ru: 'Гала-концерт к 35-летию Независимости',
      en: '35th Independence Anniversary Gala Concert',
    },
    scope: 'respublika',
    cover: img('proj-mustaqillik', 1600, 900),
    period: { uz: '2026-yil, sentyabr', ru: 'Сентябрь 2026', en: 'September 2026' },
    location: { uz: 'Toshkent, "Istiqlol" saroyi', ru: 'Ташкент, дворец «Истиклол»', en: 'Tashkent, Istiqlol Palace' },
    shortDescription: {
      uz: 'Birlashgan simfonik orkestr va xor ishtirokidagi yirik bayram konserti.',
      ru: 'Масштабный праздничный концерт с участием объединённого симфонического оркестра и хора.',
      en: 'A large-scale festive concert with a combined symphony orchestra and choir.',
    },
    description: {
      uz: 'Konsertda milliy bastakorlarning eng yaxshi asarlari, yangi buyurtma kompozitsiyalar va jahon klassikasi namunalari yangraydi. Loyihaga mamlakatning yetakchi jamoalari jalb etiladi.',
      ru: 'В концерте прозвучат лучшие произведения национальных композиторов, новые заказные сочинения и образцы мировой классики. В проекте участвуют ведущие коллективы страны.',
      en: 'The concert features the finest works of national composers, newly commissioned pieces and world classics, engaging the country’s leading ensembles.',
    },
    results: [
      { label: { uz: 'Ijrochilar', ru: 'Исполнителей', en: 'Performers' }, value: '250+' },
      { label: { uz: 'Tomoshabinlar', ru: 'Зрителей', en: 'Audience' }, value: '3 000' },
      { label: { uz: 'Premyera asarlar', ru: 'Премьеры', en: 'Premieres' }, value: '4' },
    ],
    gallery: [
      { src: img('proj-must-g1'), caption: { uz: 'Bosh sahna', ru: 'Главная сцена', en: 'Main stage' } },
      { src: img('proj-must-g2'), caption: { uz: 'Birlashgan xor', ru: 'Объединённый хор', en: 'Combined choir' } },
    ],
    featured: true,
  },
  {
    slug: 'uzbekistan-orchestra-fest',
    title: {
      uz: '"Uzbekistan Orchestra Fest" forumi',
      ru: 'Форум «Uzbekistan Orchestra Fest»',
      en: '“Uzbekistan Orchestra Fest” Forum',
    },
    scope: 'respublika',
    cover: img('proj-orchfest', 1600, 900),
    period: { uz: '2026-yil, oktyabr', ru: 'Октябрь 2026', en: 'October 2026' },
    location: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    shortDescription: {
      uz: 'Respublika orkestrlari uchun yillik forum: konsertlar, master-klasslar va tajriba almashinuvi.',
      ru: 'Ежегодный форум оркестров республики: концерты, мастер-классы и обмен опытом.',
      en: 'An annual forum for national orchestras: concerts, master classes and exchange of experience.',
    },
    description: {
      uz: 'Forum davomida mamlakatning barcha hududlaridan orkestrlar to‘planib, umumiy repertuar ustida ishlaydi, dirijyorlik va cholg‘u ijrochiligi bo‘yicha seminarlar tashkil etiladi.',
      ru: 'В рамках форума собираются оркестры со всех регионов страны, работают над общим репертуаром, проводятся семинары по дирижированию и инструментальному исполнительству.',
      en: 'Orchestras from every region gather to work on shared repertoire, with seminars on conducting and instrumental performance.',
    },
    results: [
      { label: { uz: 'Jamoalar', ru: 'Коллективов', en: 'Ensembles' }, value: '12' },
      { label: { uz: 'Master-klasslar', ru: 'Мастер-классов', en: 'Master classes' }, value: '20+' },
    ],
    gallery: [
      { src: img('proj-orchfest-g1'), caption: { uz: 'Forum ochilishi', ru: 'Открытие форума', en: 'Forum opening' } },
    ],
  },
  {
    slug: 'musiqa-poyezdi',
    title: {
      uz: '"Musiqa poyezdi" gastrol loyihasi',
      ru: 'Гастрольный проект «Музыкальный поезд»',
      en: '“Music Train” Touring Project',
    },
    scope: 'respublika',
    cover: img('proj-train', 1600, 900),
    period: { uz: '2026-yil, may–iyun', ru: 'Май–июнь 2026', en: 'May–June 2026' },
    location: { uz: 'Toshkent–Samarqand–Buxoro–Xiva–Nukus', ru: 'Ташкент–Самарканд–Бухара–Хива–Нукус', en: 'Tashkent–Samarkand–Bukhara–Khiva–Nukus' },
    shortDescription: {
      uz: 'Poyezd orqali beshta shaharni bog‘lovchi ko‘chma konsert dasturi.',
      ru: 'Передвижная концертная программа, связывающая пять городов посредством поезда.',
      en: 'A travelling concert programme connecting five cities by train.',
    },
    description: {
      uz: 'Loyiha akademik musiqani mintaqalarga olib chiqadi: har bir shaharda ochiq konsertlar, maktab o‘quvchilari uchun ma’rifiy uchrashuvlar tashkil etiladi.',
      ru: 'Проект несёт академическую музыку в регионы: в каждом городе проходят открытые концерты и просветительские встречи для школьников.',
      en: 'The project brings academic music to the regions: each city hosts open concerts and educational meetings for schoolchildren.',
    },
    results: [
      { label: { uz: 'Shaharlar', ru: 'Городов', en: 'Cities' }, value: '5' },
      { label: { uz: 'Konsertlar', ru: 'Концертов', en: 'Concerts' }, value: '15' },
      { label: { uz: 'Tinglovchilar', ru: 'Слушателей', en: 'Listeners' }, value: '12 000' },
    ],
    gallery: [
      { src: img('proj-train-g1'), caption: { uz: 'Xivadagi konsert', ru: 'Концерт в Хиве', en: 'Concert in Khiva' } },
      { src: img('proj-train-g2'), caption: { uz: 'Vokzal sahnasi', ru: 'Сцена на вокзале', en: 'Station stage' } },
    ],
    featured: true,
  },
  // ---------------- Xalqaro ----------------
  {
    slug: 'tashkent-international-orchestra-choir-forum',
    title: {
      uz: '"Tashkent International Orchestra and Choir" forumi',
      ru: 'Форум «Tashkent International Orchestra and Choir»',
      en: '“Tashkent International Orchestra and Choir” Forum',
    },
    scope: 'xalqaro',
    cover: img('proj-tioc', 1600, 900),
    period: { uz: '2026-yil, noyabr', ru: 'Ноябрь 2026', en: 'November 2026' },
    location: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    shortDescription: {
      uz: 'Jahon orkestr va xor jamoalarini birlashtiruvchi xalqaro madaniy platforma.',
      ru: 'Международная культурная платформа, объединяющая мировые оркестровые и хоровые коллективы.',
      en: 'An international cultural platform uniting the world’s orchestral and choral ensembles.',
    },
    description: {
      uz: 'Forumga turli mamlakatlardan jamoalar, dirijyorlar va mutaxassislar taklif etiladi. Dastur konsertlar, konferensiya va hamkorlik uchrashuvlaridan iborat.',
      ru: 'На форум приглашаются коллективы, дирижёры и специалисты из разных стран. Программа включает концерты, конференцию и встречи по сотрудничеству.',
      en: 'The forum invites ensembles, conductors and specialists from many countries, with concerts, a conference and partnership meetings.',
    },
    results: [
      { label: { uz: 'Mamlakatlar', ru: 'Стран', en: 'Countries' }, value: '15+' },
      { label: { uz: 'Mehmon jamoalar', ru: 'Гостевых коллективов', en: 'Guest ensembles' }, value: '10' },
    ],
    gallery: [
      { src: img('proj-tioc-g1'), caption: { uz: 'Ochilish marosimi', ru: 'Церемония открытия', en: 'Opening ceremony' } },
    ],
    featured: true,
  },
  {
    slug: 'bbc-proms-franshizasi',
    title: {
      uz: '"BBC Proms" franshizasi',
      ru: 'Франшиза «BBC Proms»',
      en: '“BBC Proms” Franchise',
    },
    scope: 'xalqaro',
    cover: img('proj-proms', 1600, 900),
    period: { uz: '2027-yil (rejalashtirilmoqda)', ru: '2027 (планируется)', en: '2027 (planned)' },
    location: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    shortDescription: {
      uz: 'Dunyoga mashhur "Proms" formatini O‘zbekistonda joriy etish tashabbusi.',
      ru: 'Инициатива по внедрению всемирно известного формата «Proms» в Узбекистане.',
      en: 'An initiative to bring the world-famous “Proms” format to Uzbekistan.',
    },
    description: {
      uz: 'Loyiha keng auditoriya uchun ochiq, demokratik konsert formatini yaratishni maqsad qiladi. BBC Proms tashkilotchilar bilan hamkorlikda amalga oshiriladi.',
      ru: 'Проект нацелен на создание открытого демократичного концертного формата для широкой аудитории в сотрудничестве с организаторами BBC Proms.',
      en: 'The project aims to create an open, democratic concert format for a broad audience, in partnership with the BBC Proms organisers.',
    },
    results: [
      { label: { uz: 'Rejalashtirilgan konsertlar', ru: 'Планируемых концертов', en: 'Planned concerts' }, value: '8' },
    ],
    gallery: [
      { src: img('proj-proms-g1'), caption: { uz: 'Ochiq konsert', ru: 'Открытый концерт', en: 'Open-air concert' } },
    ],
  },
  {
    slug: 'juilliard-malaka-oshirish',
    title: {
      uz: 'Juilliard School malaka oshirish dasturi',
      ru: 'Программа повышения квалификации Juilliard School',
      en: 'Juilliard School Professional Development Programme',
    },
    scope: 'xalqaro',
    cover: img('proj-juilliard', 1600, 900),
    period: { uz: '2026–2027', ru: '2026–2027', en: '2026–2027' },
    location: { uz: 'Nyu-York / Toshkent', ru: 'Нью-Йорк / Ташкент', en: 'New York / Tashkent' },
    shortDescription: {
      uz: 'Yosh musiqachilar va dirijyorlar uchun jahon miqyosidagi ta’lim almashinuvi.',
      ru: 'Образовательный обмен мирового уровня для молодых музыкантов и дирижёров.',
      en: 'A world-class educational exchange for young musicians and conductors.',
    },
    description: {
      uz: 'Dasturga tanlab olingan iste’dodli musiqachilar Juilliard professorlaridan saboq oladi, master-klasslar va amaliyotda ishtirok etadi.',
      ru: 'Отобранные талантливые музыканты обучаются у профессоров Juilliard, участвуют в мастер-классах и практике.',
      en: 'Selected talented musicians study with Juilliard faculty and take part in master classes and practice.',
    },
    results: [
      { label: { uz: 'Stipendiatlar', ru: 'Стипендиатов', en: 'Fellows' }, value: '25' },
      { label: { uz: 'Master-klasslar', ru: 'Мастер-классов', en: 'Master classes' }, value: '30+' },
    ],
    gallery: [
      { src: img('proj-juilliard-g1'), caption: { uz: 'Master-klass', ru: 'Мастер-класс', en: 'Master class' } },
    ],
  },
  {
    slug: 'xalqaro-gastrollar',
    title: {
      uz: 'Xalqaro gastrollar dasturi',
      ru: 'Программа международных гастролей',
      en: 'International Touring Programme',
    },
    scope: 'xalqaro',
    cover: img('proj-tours', 1600, 900),
    period: { uz: '2026–2027', ru: '2026–2027', en: '2026–2027' },
    location: { uz: 'Italiya, Janubiy Koreya, AQSh, BAA', ru: 'Италия, Южная Корея, США, ОАЭ', en: 'Italy, South Korea, USA, UAE' },
    shortDescription: {
      uz: 'Milliy jamoalarning to‘rt qit’a bo‘ylab konsert gastrollari.',
      ru: 'Концертные гастроли национальных коллективов по четырём странам.',
      en: 'Concert tours of national ensembles across four countries.',
    },
    description: {
      uz: 'Gastrollar O‘zbekiston madaniyatini xorijda targ‘ib etadi, milliy bastakorlar asarlarini jahon sahnalarida namoyish etadi.',
      ru: 'Гастроли продвигают культуру Узбекистана за рубежом, представляя произведения национальных композиторов на мировых сценах.',
      en: 'The tours promote Uzbek culture abroad, presenting national composers’ works on world stages.',
    },
    results: [
      { label: { uz: 'Mamlakatlar', ru: 'Стран', en: 'Countries' }, value: '4' },
      { label: { uz: 'Konsertlar', ru: 'Концертов', en: 'Concerts' }, value: '18' },
    ],
    gallery: [
      { src: img('proj-tours-g1'), caption: { uz: 'Seul konserti', ru: 'Концерт в Сеуле', en: 'Concert in Seoul' } },
      { src: img('proj-tours-g2'), caption: { uz: 'Milan sahnasi', ru: 'Сцена в Милане', en: 'Milan stage' } },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
