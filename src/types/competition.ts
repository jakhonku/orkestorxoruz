import type { Localized } from './common';

export type CompetitionStatus = 'ochiq' | 'yopiq' | 'tez-kunda';
export type CompetitionKind = 'tanlov' | 'festival';

export interface JuryMember {
  name: string;
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
  timeline: TimelineStage[];
  jury: JuryMember[];
}
