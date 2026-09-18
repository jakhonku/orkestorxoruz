'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, GraduationCap, Loader2, Lock, LockOpen } from 'lucide-react';

import { talentHolatiniOzgartir } from '@/server/admin/sozlamalar';

/**
 * Talent platformasini yopib-ochadigan tugma (admin bosh sahifasi).
 *
 * Yopilganda «Talent» sahifasi saytda umuman ko‘rinmaydi: menyudan, footerdan,
 * bosh sahifadagi yo‘nalishlardan va «Faoliyat» kartochkalaridan chiqib ketadi,
 * manzili terilsa ham 404 qaytadi va ariza qabul qilinmaydi. Oldin kelgan
 * arizalar joyida qoladi.
 */
export function TalentTugmasi({ ochiq }: { ochiq: boolean }) {
  const router = useRouter();
  const [ochiqmi, setOchiqmi] = useState(ochiq);
  const [xato, setXato] = useState<string | null>(null);
  const [kutilmoqda, boshla] = useTransition();

  function almashtir() {
    setXato(null);
    const yangi = !ochiqmi;
    boshla(async () => {
      const natija = await talentHolatiniOzgartir(yangi);
      if (!natija.ok) {
        setXato(natija.xato);
        return;
      }
      setOchiqmi(yangi);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={
              ochiqmi
                ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'
                : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600'
            }
          >
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy">
              Talent platformasi:{' '}
              <span className={ochiqmi ? 'text-emerald-600' : 'text-red-600'}>
                {ochiqmi ? 'saytda ko‘rinmoqda' : 'saytda yopiq'}
              </span>
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {ochiqmi
                ? 'Sahifa saytda va menyuda ko‘rinib turibdi — yangi arizalar qabul qilinmoqda.'
                : 'Sahifa saytda ham, menyuda ham ko‘rinmayapti — yangi ariza qabul qilinmayapti.'}{' '}
              Kelib bo‘lgan arizalar «Arizalar va xabarlar» da turaveradi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={almashtir}
          disabled={kutilmoqda}
          className={
            ochiqmi
              ? 'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60'
              : 'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60'
          }
        >
          {kutilmoqda ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : ochiqmi ? (
            <Lock className="h-4 w-4" />
          ) : (
            <LockOpen className="h-4 w-4" />
          )}
          {kutilmoqda ? 'Bajarilmoqda...' : ochiqmi ? 'Vaqtincha yopish' : 'Qayta ochish'}
        </button>
      </div>

      {xato && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs leading-relaxed text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {xato}
        </p>
      )}
    </div>
  );
}
