import type { Localized } from './common';

/** "Xalqaro" menyusidagi erkin sahifa — admin paneldan qoʻshiladi */
export interface InternationalPage {
  slug: string;
  title: Localized;
  /** Banner ostidagi kirish va roʻyxatdagi kartochka matni */
  summary: Localized;
  /** Asosiy matn — boʻsh qator yangi abzatsni boshlaydi */
  body: Localized;
  cover: string;
  links: InternationalLink[];
}

export interface InternationalLink {
  label: Localized;
  url: string;
}
