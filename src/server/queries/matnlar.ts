import 'server-only';
import { cache } from 'react';

import { db } from '@/lib/db';
import type { Locale } from '@/i18n/routing';

/**
 * Admin panelda tahrirlangan sahifa matnlari (`ui_texts`).
 *
 * Bu qiymatlar `messages/{uz,ru,en}.json` dagi standart matnlar ustidan
 * yoziladi. Baza javob bermasa yoki jadval hali yaratilmagan bo'lsa, sayt
 * standart matnlar bilan ishlayveradi.
 */

type Qiymat = { uz?: string; ru?: string; en?: string };

export const uiMatnlar = cache(async (locale: Locale): Promise<Record<string, string>> => {
  try {
    const qatorlar = await db.uiText.findMany({ select: { key: true, value: true } });

    const natija: Record<string, string> = {};
    for (const q of qatorlar) {
      const matn = (q.value as Qiymat)?.[locale];
      // Bo'sh qoldirilgan matn — "standartini ishlat" degani
      if (typeof matn === 'string' && matn.trim() !== '') natija[q.key] = matn;
    }
    return natija;
  } catch {
    return {};
  }
});

/** "Home.hero.title" kalitini ichma-ich obyektga joylaydi */
export function matnniJoylash(daraxt: Record<string, unknown>, kalit: string, qiymat: string) {
  const qismlar = kalit.split('.');
  let joriy = daraxt;

  for (const qism of qismlar.slice(0, -1)) {
    const keyingi = joriy[qism];
    if (typeof keyingi !== 'object' || keyingi === null || Array.isArray(keyingi)) return;
    joriy = keyingi as Record<string, unknown>;
  }

  const oxirgi = qismlar[qismlar.length - 1];
  // Faqat mavjud matnni almashtiramiz — koddan olib tashlangan kalit qo'shilmaydi
  if (typeof joriy[oxirgi] === 'string') joriy[oxirgi] = qiymat;
}
