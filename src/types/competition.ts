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
  cover: string;
  date: Localized;
  location: Localized;
  shortDescription: Localized;
  regulations: Localized;
  /** Nizomning yuklab olinadigan fayli (PDF va h.k.) */
  regulationsFile?: string;
  /** Mukofot jamg'armasi */
  prizeFund?: Localized;
  /** "Ishtirok etish" kartasi: bo'sh maydonlar uchun standart matn ishlatiladi */
  participateTitle?: Localized;
  participateText?: Localized;
  prepareTitle?: Localized;
  prepareList?: Localized<string[]>;
  timeline: TimelineStage[];
  jury: JuryMember[];
}
