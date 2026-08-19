'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';

import type { XatoKodi } from '@/server/forms/amallar';

/**
 * Formalarga umumiy qismlar: yashirin "tuzoq" maydoni va xato xabari.
 */

/**
 * Robotlarga qo'yilgan tuzoq. Odam bu maydonni ko'rmaydi va to'ldirmaydi;
 * to'ldirilgan bo'lsa, server arizani yozmaydi (lekin xato ham ko'rsatmaydi).
 */
export function Tuzoq({ qiymat, ozgartir }: { qiymat: string; ozgartir: (v: string) => void }) {
  return (
    <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
      <label>
        Ushbu maydonni bo‘sh qoldiring
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={qiymat}
          onChange={(e) => ozgartir(e.target.value)}
        />
      </label>
    </div>
  );
}

/** Server qaytargan xato kodini foydalanuvchi tilidagi matnga aylantiradi */
export function XatoXabari({ kod }: { kod: XatoKodi | null }) {
  const tc = useTranslations('Common');
  if (!kod) return null;

  const matn = kod === 'limit' ? tc('tooManyRequests') : tc('errorMessage');

  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {matn}
    </p>
  );
}
