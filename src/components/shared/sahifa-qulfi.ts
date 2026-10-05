'use client';

import { useEffect } from 'react';

/**
 * Oyna ochiq turganda sahifaning orqa foni aylanmaydi.
 *
 * Nega hisoblagich kerak: ilgari har bir oyna `body.style.overflow` ni oʻzi
 * qoʻyib, oʻzi boʻshatardi. Ikkita oyna ustma-ust ochilganda (masalan galereya
 * ichidan surat oynasi) birinchisi yopilishi bilan scroll qaytib kelardi —
 * yoki aksincha, sahifa umuman aylanmay qolardi. Endi qulf faqat oxirgi oyna
 * yopilganda ochiladi.
 *
 * `ochiqmi` dan boshqa bogʻliqlik yoʻq, shuning uchun har bir qayta chizishda
 * qulf qoʻyilib-olinmaydi.
 */
let ochiqOynalar = 0;

export function useSahifaQulfi(ochiqmi: boolean) {
  useEffect(() => {
    if (!ochiqmi) return;

    ochiqOynalar += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      ochiqOynalar -= 1;
      if (ochiqOynalar <= 0) {
        ochiqOynalar = 0;
        document.body.style.overflow = '';
      }
    };
  }, [ochiqmi]);
}
