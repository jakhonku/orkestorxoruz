import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { Localized } from '@/types';

/**
 * "Faoliyat" sahifasi (/faoliyat) mazmuni.
 *
 * Ro'yxati yo'q — bitta sahifa, shuning uchun `settings` jadvalida
 * kalit/qiymat bo'lib yotadi (xuddi sayt sozlamalari kabi).
 */

export type FaoliyatBloki = {
  title: Localized;
  text: Localized;
  href: string;
  icon: string;
};

export type FaoliyatSahifasi = {
  title: Localized;
  subtitle: Localized;
  intro: Localized;
  image: string;
  blocks: FaoliyatBloki[];
};

const BOSH: Localized = { uz: '', ru: '', en: '' };

/**
 * Sahifa hali to'ldirilmagan bo'lsa — menyudagi uchta yo'nalish
 * zaxira sifatida ko'rsatiladi, shunda sahifa bo'sh qolmaydi.
 */
const ZAXIRA_BLOKLAR: FaoliyatBloki[] = [
  {
    title: { uz: 'Loyihalar', ru: 'Проекты', en: 'Projects' },
    text: BOSH,
    href: '/loyihalar',
    icon: 'folder-kanban',
  },
  {
    title: {
      uz: 'Tanlov va festivallar',
      ru: 'Конкурсы и фестивали',
      en: 'Competitions and festivals',
    },
    text: BOSH,
    href: '/tanlovlar',
    icon: 'trophy',
  },
  {
    title: {
      uz: 'Talent platformasi',
      ru: 'Платформа талантов',
      en: 'Talent platform',
    },
    text: BOSH,
    href: '/talent',
    icon: 'graduation-cap',
  },
];

export const getFaoliyat = cache(async (): Promise<FaoliyatSahifasi> => {
  const rows = await db.setting.findMany({
    where: {
      key: {
        in: [
          'activityTitle',
          'activitySubtitle',
          'activityIntro',
          'activityImage',
          'activityBlocks',
        ],
      },
    },
  });
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;

  const bloklar = Array.isArray(s.activityBlocks)
    ? (s.activityBlocks as FaoliyatBloki[]).filter((b) => b?.href)
    : [];

  return {
    title: (s.activityTitle as Localized) ?? BOSH,
    subtitle: (s.activitySubtitle as Localized) ?? BOSH,
    intro: (s.activityIntro as Localized) ?? BOSH,
    image: (s.activityImage as string) ?? '',
    blocks: bloklar.length > 0 ? bloklar : ZAXIRA_BLOKLAR,
  };
});
