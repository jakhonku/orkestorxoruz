'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * Sayt statistikasi: sahifa ochilganda koʻrish yoziladi, yopilganda
 * (yoki boshqa tabga oʻtilganda) sahifada turilgan vaqt yuboriladi.
 * Hech narsa koʻrinmaydi va xatolar jim yutiladi.
 */
export function Kuzatuvchi() {
  const pathname = usePathname();
  const locale = useLocale();
  const idRef = useRef<Promise<number | null>>(Promise.resolve(null));
  const boshlandi = useRef(0);
  const yuborilgan = useRef(0);

  useEffect(() => {
    boshlandi.current = Date.now();
    yuborilgan.current = 0;

    idRef.current = fetch('/api/korish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, locale }),
      keepalive: true,
    })
      .then((r) => r.json() as Promise<{ id: number | null }>)
      .then((j) => j.id)
      .catch(() => null);

    const yubor = () => {
      const sekund = Math.round((Date.now() - boshlandi.current) / 1000);
      if (sekund < 1 || sekund === yuborilgan.current) return;
      yuborilgan.current = sekund;
      idRef.current.then((id) => {
        if (!id) return;
        const data = new Blob([JSON.stringify({ id, sekund })], { type: 'application/json' });
        navigator.sendBeacon?.('/api/korish/davomiylik', data);
      });
    };
    const korinish = () => {
      if (document.visibilityState === 'hidden') yubor();
    };
    document.addEventListener('visibilitychange', korinish);
    window.addEventListener('pagehide', yubor);

    return () => {
      document.removeEventListener('visibilitychange', korinish);
      window.removeEventListener('pagehide', yubor);
      yubor(); // sahifadan sahifaga oʻtganda
    };
  }, [pathname, locale]);

  return null;
}
