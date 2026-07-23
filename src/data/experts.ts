import type { DocumentLink, Expert, Leader } from '@/types';
import { portrait } from '@/lib/images';

export const experts: Expert[] = [
  {
    slug: 'liliya-bekirova',
    name: 'Liliya Bekirova',
    countryCode: 'DE',
    country: { uz: 'Germaniya', ru: 'Германия', en: 'Germany' },
    photo: '/experts/bekirova.png',
    role: { uz: 'Xor dirijyori, pedagog', ru: 'Хоровой дирижёр, педагог', en: 'Choral conductor, pedagogue' },
    bio: {
      uz: 'Yevropaning yetakchi xor jamoalari bilan ishlagan tajribali dirijyor. Xor ijrochiligi metodikasi bo‘yicha mutaxassis.',
      ru: 'Опытный дирижёр, работавший с ведущими хоровыми коллективами Европы. Специалист по методике хорового исполнительства.',
      en: 'An experienced conductor who has worked with leading European choirs. A specialist in choral performance methodology.',
    },
    specialties: {
      uz: ['Xor dirijyorligi', 'Vokal texnikasi', 'A cappella repertuari'],
      ru: ['Хоровое дирижирование', 'Вокальная техника', 'Репертуар a cappella'],
      en: ['Choral conducting', 'Vocal technique', 'A cappella repertoire'],
    },
  },
  {
    slug: 'tigran-shiganyan',
    name: 'Tigran Shiganyan',
    countryCode: 'US',
    country: { uz: 'AQSh', ru: 'США', en: 'USA' },
    photo: '/experts/shiganyan.png',
    role: { uz: 'Dirijyor, professor', ru: 'Дирижёр, профессор', en: 'Conductor, professor' },
    bio: {
      uz: 'Simfonik orkestr dirijyorligi sohasidagi xalqaro ekspert. Ko‘plab yosh dirijyorlar ustozi.',
      ru: 'Международный эксперт в области симфонического дирижирования. Наставник многих молодых дирижёров.',
      en: 'An international expert in symphonic conducting and mentor to many young conductors.',
    },
    specialties: {
      uz: ['Simfonik dirijyorlik', 'Orkestr bilan ishlash', 'Interpretatsiya'],
      ru: ['Симфоническое дирижирование', 'Работа с оркестром', 'Интерпретация'],
      en: ['Symphonic conducting', 'Working with orchestra', 'Interpretation'],
    },
  },
  {
    slug: 'nasser-sahim',
    name: 'Nasser Sahim',
    countryCode: 'QA',
    country: { uz: 'Qatar', ru: 'Катар', en: 'Qatar' },
    photo: '/experts/sahim.png',
    role: { uz: 'Bastakor, san’at menejeri', ru: 'Композитор, арт-менеджер', en: 'Composer, arts manager' },
    bio: {
      uz: 'Sharq va G‘arb musiqiy an’analarini uyg‘unlashtiruvchi bastakor. Xalqaro festivallar tashkilotchisi.',
      ru: 'Композитор, соединяющий восточные и западные музыкальные традиции. Организатор международных фестивалей.',
      en: 'A composer blending Eastern and Western musical traditions, and organiser of international festivals.',
    },
    specialties: {
      uz: ['Kompozitsiya', 'Festival menejmenti', 'Madaniyatlararo loyihalar'],
      ru: ['Композиция', 'Фестивальный менеджмент', 'Межкультурные проекты'],
      en: ['Composition', 'Festival management', 'Cross-cultural projects'],
    },
  },
];

export const leaders: Leader[] = [
  {
    name: 'Botir Zokirov',
    role: { uz: 'Bosh direktor', ru: 'Генеральный директор', en: 'Director General' },
    photo: portrait('lead-1'),
    bio: {
      uz: 'Birlashmaning strategik rivojlanishi va xalqaro aloqalariga rahbarlik qiladi.',
      ru: 'Руководит стратегическим развитием и международными связями объединения.',
      en: 'Leads the union’s strategic development and international relations.',
    },
  },
  {
    name: 'Dilnoza Rahimova',
    role: { uz: 'Badiiy rahbar', ru: 'Художественный руководитель', en: 'Artistic Director' },
    photo: portrait('lead-2'),
    bio: {
      uz: 'Ijodiy dasturlar va repertuar siyosatini shakllantiradi.',
      ru: 'Формирует творческие программы и репертуарную политику.',
      en: 'Shapes creative programmes and repertoire policy.',
    },
  },
  {
    name: 'Sanjar Umarov',
    role: { uz: 'Loyihalar bo‘yicha direktor o‘rinbosari', ru: 'Заместитель директора по проектам', en: 'Deputy Director for Projects' },
    photo: portrait('lead-3'),
    bio: {
      uz: 'Respublika va xalqaro loyihalarni muvofiqlashtiradi.',
      ru: 'Координирует республиканские и международные проекты.',
      en: 'Coordinates national and international projects.',
    },
  },
  {
    name: 'Kamola Yusupova',
    role: { uz: 'Ta’lim dasturlari rahbari', ru: 'Руководитель образовательных программ', en: 'Head of Education Programmes' },
    photo: portrait('lead-4'),
    bio: {
      uz: 'Malaka oshirish va yoshlar bilan ishlash yo‘nalishini boshqaradi.',
      ru: 'Руководит направлением повышения квалификации и работы с молодёжью.',
      en: 'Directs professional development and youth engagement.',
    },
  },
];

export const documents: DocumentLink[] = [
  { title: { uz: 'Birlashma nizomi', ru: 'Устав объединения', en: 'Union charter' }, href: '#', meta: 'PDF · 480 KB' },
  { title: { uz: 'Yillik hisobot 2025', ru: 'Годовой отчёт 2025', en: 'Annual report 2025' }, href: '#', meta: 'PDF · 2.1 MB' },
  { title: { uz: 'Strategik rivojlanish rejasi', ru: 'План стратегического развития', en: 'Strategic development plan' }, href: '#', meta: 'PDF · 1.3 MB' },
  { title: { uz: 'Tanlovlar umumiy nizomi', ru: 'Общее положение о конкурсах', en: 'General competition regulations' }, href: '#', meta: 'PDF · 720 KB' },
];

export function getExpertBySlug(slug: string): Expert | undefined {
  return experts.find((e) => e.slug === slug);
}
