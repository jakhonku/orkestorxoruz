/**
 * Baza enum'lari <-> frontend tiplari o'rtasidagi moslik.
 *
 * Bazada enum'lar KATTA_HARF bilan (Postgres odati), frontendda esa
 * 'kichik-harf' ko'rinishida (mavjud tiplarni o'zgartirmaslik uchun).
 */
import type {
  CompetitionKind,
  CompetitionStatus,
  EnsembleType,
  EventCategory,
  NewsCategory,
  ProjectScope,
  Region,
} from '@/types';
import * as P from '@/generated/prisma/enums';

/** Ikki tomonlama moslik jadvalidan teskari jadval yasaydi */
function invert<A extends string, B extends string>(map: Record<A, B>): Record<B, A> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<B, A>;
}

// ---------- Jamoa turi ----------
export const ensembleTypeToDb: Record<EnsembleType, P.EnsembleType> = {
  orkestr: 'ORKESTR',
  xor: 'XOR',
  ansambl: 'ANSAMBL',
};
export const ensembleTypeFromDb = invert(ensembleTypeToDb);

// ---------- Viloyat ----------
export const regionToDb: Record<Region, P.Region> = {
  'toshkent-shahri': 'TOSHKENT_SHAHRI',
  toshkent: 'TOSHKENT',
  samarqand: 'SAMARQAND',
  buxoro: 'BUXORO',
  xorazm: 'XORAZM',
  fargona: 'FARGONA',
  andijon: 'ANDIJON',
  namangan: 'NAMANGAN',
  qashqadaryo: 'QASHQADARYO',
  surxondaryo: 'SURXONDARYO',
  navoiy: 'NAVOIY',
  jizzax: 'JIZZAX',
  sirdaryo: 'SIRDARYO',
  qoraqalpogiston: 'QORAQALPOGISTON',
};
export const regionFromDb = invert(regionToDb);

// ---------- Loyiha ko'lami ----------
export const projectScopeToDb: Record<ProjectScope, P.ProjectScope> = {
  respublika: 'RESPUBLIKA',
  xalqaro: 'XALQARO',
};
export const projectScopeFromDb = invert(projectScopeToDb);

// ---------- Tanlov turi ----------
export const competitionKindToDb: Record<CompetitionKind, P.CompetitionKind> = {
  tanlov: 'TANLOV',
  festival: 'FESTIVAL',
};
export const competitionKindFromDb = invert(competitionKindToDb);

// ---------- Tanlov holati ----------
export const competitionStatusToDb: Record<CompetitionStatus, P.CompetitionStatus> = {
  ochiq: 'OCHIQ',
  yopiq: 'YOPIQ',
  'tez-kunda': 'TEZ_KUNDA',
};
export const competitionStatusFromDb = invert(competitionStatusToDb);

// ---------- Tadbir turkumi ----------
export const eventCategoryToDb: Record<EventCategory, P.EventCategory> = {
  konsert: 'KONSERT',
  festival: 'FESTIVAL',
  forum: 'FORUM',
  tanlov: 'TANLOV',
};
export const eventCategoryFromDb = invert(eventCategoryToDb);

// ---------- Yangilik turkumi ----------
export const newsCategoryToDb: Record<NewsCategory, P.NewsCategory> = {
  yangilik: 'YANGILIK',
  matbuot: 'MATBUOT',
  elon: 'ELON',
};
export const newsCategoryFromDb = invert(newsCategoryToDb);

// ---------- Foto nisbati ----------
export const photoRatioToDb: Record<'portrait' | 'landscape' | 'square', P.PhotoRatio> = {
  portrait: 'PORTRAIT',
  landscape: 'LANDSCAPE',
  square: 'SQUARE',
};
export const photoRatioFromDb = invert(photoRatioToDb);
