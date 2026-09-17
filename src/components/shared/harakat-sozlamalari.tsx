'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Saytdagi barcha animatsiyalar uchun umumiy sozlama.
 *
 * `reducedMotion="user"` — tizimda "harakatni kamaytirish" yoqilgan bo'lsa
 * (macOS: Sozlamalar → Maxsus imkoniyatlar → Displey → Reduce motion;
 * Windows: "Show animations" o'chirilgan) siljish va masshtab animatsiyalari
 * bajarilmaydi, faqat shaffoflik qoladi.
 *
 * Bu nafaqat qulaylik masalasi: shunday sozlama yoqilgan kompyuterlarda
 * o'nlab elementning bir vaqtda siljishi seziladigan to'xtalishlarga
 * olib kelardi.
 */
export function HarakatSozlamalari({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
