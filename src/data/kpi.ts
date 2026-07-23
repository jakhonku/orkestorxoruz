import type { KpiStat, Partner } from '@/types';

export const kpiStats: KpiStat[] = [
  {
    value: 6,
    suffix: '+',
    icon: 'compass',
    label: {
      uz: 'strategik yo‘nalish',
      ru: 'стратегических направлений',
      en: 'strategic directions',
    },
  },
  {
    value: 4,
    suffix: '+',
    icon: 'globe',
    label: {
      uz: 'xalqaro loyiha',
      ru: 'международных проекта',
      en: 'international projects',
    },
  },
  {
    value: 4,
    suffix: '+',
    icon: 'landmark',
    label: {
      uz: 'respublika loyihasi',
      ru: 'республиканских проекта',
      en: 'national projects',
    },
  },
  {
    value: 5,
    suffix: '+',
    icon: 'trophy',
    label: {
      uz: 'tanlov va festival',
      ru: 'конкурсов и фестивалей',
      en: 'competitions & festivals',
    },
  },
  {
    value: 3,
    suffix: '+',
    icon: 'radio',
    label: {
      uz: 'media tashabbus',
      ru: 'медиаинициативы',
      en: 'media initiatives',
    },
  },
  {
    value: 10,
    suffix: '+',
    icon: 'graduation-cap',
    label: {
      uz: 'ta’lim dasturi',
      ru: 'образовательных программ',
      en: 'education programmes',
    },
  },
];

export const partners: Partner[] = [
  {
    name: 'BBC Proms',
    logoText: 'BBC PROMS',
    logo: '/partners/bbc-proms.png',
    country: { uz: 'Buyuk Britaniya', ru: 'Великобритания', en: 'United Kingdom' },
    url: 'https://www.bbc.co.uk/proms',
  },
  {
    name: 'The Juilliard School',
    logoText: 'JUILLIARD',
    logo: '/partners/juilliard.png',
    country: { uz: 'AQSh', ru: 'США', en: 'USA' },
    url: 'https://www.juilliard.edu',
  },
  {
    name: 'Grammy Awards',
    logoText: 'GRAMMY',
    logo: '/partners/grammy.png',
    country: { uz: 'AQSh', ru: 'США', en: 'USA' },
  },
  {
    name: 'Salzburg Festival',
    logoText: 'SALZBURG',
    country: { uz: 'Avstriya', ru: 'Австрия', en: 'Austria' },
  },
  {
    name: 'La Scala',
    logoText: 'LA SCALA',
    country: { uz: 'Italiya', ru: 'Италия', en: 'Italy' },
  },
  {
    name: 'Seoul Arts Center',
    logoText: 'SEOUL ARTS',
    country: { uz: 'Janubiy Koreya', ru: 'Южная Корея', en: 'South Korea' },
  },
];
