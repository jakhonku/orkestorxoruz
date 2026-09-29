'use client';

import { useTranslations } from 'next-intl';

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
 * Sana: kun / oy / yil — uchta ro'yxat. Brauzerning sana oynasidan qulayroq,
 * ayniqsa tug'ilgan yilni o'nlab yil orqaga varaqlash kerak bo'lganda.
 * Qiymat YYYY-MM-DD ko'rinishida, faqat uchalasi tanlanganda yoziladi.
 */
function SanaTanlash({ qiymat, ozgartir }: { qiymat: string; ozgartir: (v: string) => void }) {
  const t = useTranslations('Ariza');
  // Chala tanlov ham eslab qolinadi: "2001--" kabi
  const [y = '', m = '', d = ''] = qiymat.split('-');

  // Oy nomlari tarjima faylidan: brauzerlarning ko'pi o'zbekcha oylarni
  // bilmaydi ("M01" chiqaradi) va server bilan mos kelmay qoladi
  const oylar = t.raw('months') as string[];

  const bugun = new Date().getFullYear();
  const yillar = Array.from({ length: 106 }, (_, i) => bugun + 5 - i);
  const kunlar = Array.from({ length: 31 }, (_, i) => i + 1);

  const yoz = (yy: string, mm: string, dd: string) => ozgartir(`${yy}-${mm}-${dd}`);
  const p = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="grid grid-cols-3 gap-3">
      <Select value={d} className={KATTA} aria-label={t('day')} onChange={(e) => yoz(y, m, e.target.value)}>
        <option value="">{t('day')}</option>
        {kunlar.map((k) => (
          <option key={k} value={p(k)}>
            {k}
          </option>
        ))}
      </Select>
      <Select value={m} className={KATTA} aria-label={t('month')} onChange={(e) => yoz(y, e.target.value, d)}>
        <option value="">{t('month')}</option>
        {oylar.map((nom, i) => (
          <option key={i} value={p(i + 1)}>
            {nom}
          </option>
        ))}
      </Select>
      <Select value={y} className={KATTA} aria-label={t('year')} onChange={(e) => yoz(e.target.value, m, d)}>
        <option value="">{t('year')}</option>
        {yillar.map((yil) => (
          <option key={yil} value={String(yil)}>
            {yil}
          </option>
        ))}
      </Select>
    </div>
  );
}
