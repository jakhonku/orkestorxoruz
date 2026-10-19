import type { Localized } from './common';

export type CompetitionStatus = 'ochiq' | 'yopiq' | 'tez-kunda';
export type CompetitionKind = 'tanlov' | 'festival';

export interface JuryMember {
  name: Localized;
  country: Localized;
  title: Localized;
}

export interface TimelineStage {
  date: Localized;
  title: Localized;
  description: Localized;
}

export interface Competition {
  slug: string;
  title: Localized;
  kind: CompetitionKind;
  status: CompetitionStatus;
  /** Ariza qabul qilishning oxirgi kuni (YYYY-MM-DD) */
  applicationDeadline?: string;
  /** Batafsil sahifa ochiqmi: "Tez kunda" holatida admin belgilaydi, boshqa holatlarda doim ochiq */
  detailOpen?: boolean;
  cover: string;
  date: Localized;
  location: Localized;
  shortDescription: Localized;
  regulations: Localized;
  /** Nizomning yuklab olinadigan fayli (PDF va h.k.) */
  regulationsFile?: string;
  /** Bogʻlanish uchun telefon raqam */
  contactPhone?: string;
  /** Mukofot jamgʻarmasi */
  prizeFund?: Localized;
  /** "Ishtirok etish" kartasi: boʻsh maydonlar uchun standart matn ishlatiladi */
  participateTitle?: Localized;
  participateText?: Localized;
  prepareTitle?: Localized;
  prepareList?: Localized<string[]>;
  /** Shu tanlovning tayyor hujjatlari (yuklab olinadi) */
  documents?: { title: Localized; file: string }[];
  timeline: TimelineStage[];
  jury: JuryMember[];
}
