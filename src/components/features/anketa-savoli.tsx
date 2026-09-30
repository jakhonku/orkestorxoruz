'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalendarDays } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { tilda, variantlarTilda, type Savol } from '@/lib/anketa';
import { ArizaFayli } from './ariza-fayli';

/**
 * Admin tuzgan anketadagi bitta savolni chizadi.
 * Ariza sahifasidagi qadamlar shu komponentdan quriladi.
 */

export type JavobQiymati = string | string[];

/** Yorliq, izoh va xato bilan o'ralgan maydon */
export function Maydon({
  label,
  error,
  required,
  izoh,
  ixtiyoriy,
  as: Teg = 'label',
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  /** Yorliq ostidagi kichik tushuntirish */
  izoh?: string;
  /** Yorliqning o'ng tomonida kulrang "ixtiyoriy" yozuvi */
  ixtiyoriy?: string;
  /** Ichida bir nechta input bo'lsa `div` — `label` bosish ularni aralashtirib yuboradi */
  as?: 'label' | 'div';
  children: React.ReactNode;
}) {
  return (
    <Teg className="block">
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-medium text-navy-900">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </span>
        {ixtiyoriy && <span className="text-xs text-muted-foreground">{ixtiyoriy}</span>}
      </span>
      {izoh && <span className="-mt-1 mb-2 block text-xs text-muted-foreground">{izoh}</span>}
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </Teg>
  );
}

/** Kattaroq maydonlar — ariza sahifasida qulay bo'lishi uchun */
export const KATTA = 'h-12 rounded-xl px-4 text-[15px]';

export function AnketaSavoli({
  savol: s,
  locale,
  qiymat,
  xato,
  ozgartir,
  tanlovId,
  yuklanmoqda,
}: {
  savol: Savol;
  locale: string;
  qiymat: JavobQiymati | undefined;
  xato?: string;
  ozgartir: (v: JavobQiymati) => void;
  tanlovId?: number;
  yuklanmoqda: (ha: boolean) => void;
}) {
  const t = useTranslations('Competitions');
  const ta = useTranslations('Ariza');
  const yorliq = tilda(s.savol, locale);
  const izoh = tilda(s.izoh, locale);
  const matn = typeof qiymat === 'string' ? qiymat : '';
  const variantlar = variantlarTilda(s, locale);
  const ixtiyoriy = s.talab ? undefined : ta('optional');

  if (s.tur === 'bolim') return null;

  // Rozilik: bitta belgi, savol matni belgining yonida turadi
  if (s.tur === 'rozilik') {
    return (
      <div>
        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border bg-navy-50/40 px-4 py-3.5 text-[15px] text-navy-900 transition-colors',
            xato ? 'border-red-300' : 'border-input hover:border-navy/40',
          )}
        >
          <input
            type="checkbox"
            checked={matn === 'ha'}
            onChange={(e) => ozgartir(e.target.checked ? 'ha' : '')}
            className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
          />
          <span>
            {yorliq}
            {s.talab && <span className="ml-1 text-red-600">*</span>}
            {izoh && <span className="mt-0.5 block text-xs text-muted-foreground">{izoh}</span>}
          </span>
        </label>
        {xato && <span className="mt-1.5 block text-xs font-medium text-red-600">{xato}</span>}
      </div>
    );
  }

  // Fayl, variantlar va sana — ichida bir nechta boshqaruv bor, <label> bo'lmaydi
  if (s.tur === 'fayl') {
    return (
      <Maydon as="div" label={yorliq} required={s.talab} izoh={izoh} error={xato} ixtiyoriy={ixtiyoriy}>
        <ArizaFayli
          tanlovId={tanlovId}
          savolId={s.id}
          qabul={s.qabul}
          qiymat={matn}
          ozgartir={ozgartir}
          yuklanmoqda={yuklanmoqda}
        />
      </Maydon>
    );
  }

  if (s.tur === 'variant' || s.tur === 'belgilar') {
    const tanlangan = Array.isArray(qiymat) ? qiymat : matn ? [matn] : [];
    return (
      <Maydon as="div" label={yorliq} required={s.talab} izoh={izoh} error={xato} ixtiyoriy={ixtiyoriy}>
        <div className="grid gap-2 sm:grid-cols-2">
          {variantlar.map((v, i) => {
            const k = String(i);
            const belgilangan = tanlangan.includes(k);
            return (
              <label
                key={k}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition-colors',
                  belgilangan
                    ? 'border-navy bg-navy-50/60 text-navy'
                    : 'border-input bg-white text-navy-900 hover:border-navy/40',
                )}
              >
                <input
                  type={s.tur === 'variant' ? 'radio' : 'checkbox'}
                  name={s.id}
                  checked={belgilangan}
                  onChange={() =>
                    s.tur === 'variant'
                      ? ozgartir(k)
                      : ozgartir(belgilangan ? tanlangan.filter((x) => x !== k) : [...tanlangan, k])
                  }
                  className="h-4 w-4 shrink-0 accent-navy"
                />
                {v}
              </label>
            );
          })}
        </div>
      </Maydon>
    );
  }

  if (s.tur === 'sana') {
    return (
      <Maydon as="div" label={yorliq} required={s.talab} izoh={izoh} error={xato} ixtiyoriy={ixtiyoriy}>
        <SanaTanlash qiymat={matn} ozgartir={ozgartir} />
      </Maydon>
    );
  }

  let boshqaruv: React.ReactNode;
  switch (s.tur) {
    case 'matnKatta':
      boshqaruv = (
        <Textarea
          value={matn}
          maxLength={5000}
          rows={6}
          className="rounded-xl px-4 py-3 text-[15px]"
          onChange={(e) => ozgartir(e.target.value)}
        />
      );
      break;
    case 'tanlov':
      boshqaruv = (
        <Select value={matn} className={KATTA} onChange={(e) => ozgartir(e.target.value)}>
          <option value="">{t('form_choose')}</option>
          {variantlar.map((v, i) => (
            <option key={i} value={String(i)}>
              {v}
            </option>
          ))}
        </Select>
      );
      break;
    default:
      boshqaruv = (
        <Input
          type={s.tur === 'havola' ? 'url' : 'text'}
          inputMode={s.tur === 'raqam' ? 'decimal' : undefined}
          placeholder={s.tur === 'havola' ? 'https://' : undefined}
          maxLength={s.tur === 'havola' ? 2000 : 300}
          value={matn}
          className={KATTA}
          onChange={(e) => ozgartir(e.target.value)}
        />
      );
  }

  return (
    <Maydon label={yorliq} required={s.talab} izoh={izoh} error={xato} ixtiyoriy={ixtiyoriy}>
      {boshqaruv}
    </Maydon>
  );
}

/**
 * Sana: bitta maydon, "KK.OO.YYYY". Raqam yozilganda nuqtalar o'zi qo'yiladi,
 * telefonda raqamli klaviatura ochiladi — tug'ilgan yilni ro'yxatdan
 * qidirib o'tirish shart emas. Qiymat YYYY-MM-DD ko'rinishida saqlanadi;
 * chala yozilgan sana "2001--" kabi qoladi va tekshiruvda xato beradi.
 */
function SanaTanlash({ qiymat, ozgartir }: { qiymat: string; ozgartir: (v: string) => void }) {
  const t = useTranslations('Ariza');

  const korsat = (raqamlar: string) =>
    [raqamlar.slice(0, 2), raqamlar.slice(2, 4), raqamlar.slice(4, 8)].filter(Boolean).join('.');

  // Saqlangan qiymatdan (qoralama) ko'rinish tiklanadi
  const boshlang = () => {
    const [y = '', m = '', d = ''] = qiymat.split('-');
    return korsat(`${d}${m}${y}`.replace(/\D/g, ''));
  };
  const [matn, setMatn] = useState(boshlang);

  const yoz = (xom: string) => {
    let r = xom.replace(/\D/g, '').slice(0, 8);
    const kun = r.slice(0, 2);
    const oy = r.slice(2, 4);
    // Kun 31 dan, oy 12 dan oshmasin
    if (kun.length === 2 && (Number(kun) < 1 || Number(kun) > 31)) r = `${kun.slice(0, 1)}${r.slice(2)}`;
    if (oy.length === 2 && (Number(oy) < 1 || Number(oy) > 12)) r = `${r.slice(0, 3)}${r.slice(4)}`;
    setMatn(korsat(r));
    ozgartir(r ? `${r.slice(4, 8)}-${r.slice(2, 4)}-${r.slice(0, 2)}` : '');
  };

  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/50" />
      <Input
        value={matn}
        inputMode="numeric"
        autoComplete="bday"
        maxLength={10}
        placeholder={t('datePh')}
        aria-label={t('datePh')}
        className={cn(KATTA, 'pl-12 tracking-wider')}
        onChange={(e) => yoz(e.target.value)}
      />
    </div>
  );
}
