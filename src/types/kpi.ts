import type { Localized } from './common';

export interface KpiStat {
  /** numeric target for the animated counter */
  value: number;
  suffix: string;
  label: Localized;
  icon: string;
}

export interface Partner {
  name: string;
  logoText: string;
  /** Optional real logo image (public path). Falls back to logoText wordmark. */
  logo?: string;
  country: Localized;
  url?: string;
}
