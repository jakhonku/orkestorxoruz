import type { Localized } from './common';

export type EventCategory = 'konsert' | 'festival' | 'forum' | 'tanlov';

export interface ConcertEvent {
  slug: string;
  title: Localized;
  category: EventCategory;
  poster: string;
  /** ISO date string, e.g. 2026-09-01 */
  date: string;
  time: string;
  venue: Localized;
  city: Localized;
  ticketUrl?: string;
  price?: Localized;
  shortDescription: Localized;
  featured?: boolean;
}
