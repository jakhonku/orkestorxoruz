'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Saytdagi barcha animatsiyalar uchun umumiy sozlama.
 *
 * `reducedMotion="user"` — tizimda "harakatni kamaytirish" yoqilgan boʻlsa
 * (macOS: Sozlamalar → Maxsus imkoniyatlar → Displey → Reduce motion;
 * Windows: "Show animations" oʻchirilgan) siljish va masshtab animatsiyalari
 * bajarilmaydi, faqat shaffoflik qoladi.
 *
 * Bu nafaqat qulaylik masalasi: shunday sozlama yoqilgan kompyuterlarda
 * oʻnlab elementning bir vaqtda siljishi seziladigan toʻxtalishlarga
 * olib kelardi.
 */
export function HarakatSozlamalari({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
