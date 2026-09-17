import type { Localized } from './common';

/** "Xalqaro" menyusidagi erkin sahifa — admin paneldan qo'shiladi */
export interface InternationalPage {
  slug: string;
  title: Localized;
  /** Banner ostidagi kirish va ro'yxatdagi kartochka matni */
  summary: Localized;
  /** Asosiy matn — bo'sh qator yangi abzatsni boshlaydi */
  body: Localized;
  cover: string;
  links: InternationalLink[];
}

export interface InternationalLink {
  label: Localized;
  url: string;
}
