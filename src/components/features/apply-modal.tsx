'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Lock, SendHorizontal } from 'lucide-react';
import { Modal } from '@/components/shared/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { tilda, variantlarTilda, type Savol } from '@/lib/anketa';
import { tanlovArizasi, type XatoKodi } from '@/server/forms/amallar';
import { Tuzoq, XatoXabari } from './forma-yordam';
import type { CompetitionStatus } from '@/types';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const havolaRe = /^https?:\/\/\S+$/i;
const sonRe = /^-?\d+([.,]\d+)?$/;

interface FormState {
  name: string;
  ensemble: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}

const empty: FormState = {
  name: '',
  ensemble: '',
  email: '',
  phone: '',
  category: '',
  message: '',
};

/** Anketa javoblari: savol id -> matn yoki (bir nechta variant uchun) variant raqamlari */
type Javoblar = Record<string, string | string[]>;

export function ApplyModal({
  status,
  competitionId,
  anketa = [],
}: {
  status: CompetitionStatus;
  /** Ariza qaysi tanlovga tegishli ekani — bazaga shu bilan yoziladi */
  competitionId?: number;
  /**
   * Admin panelda tuzilgan anketa. Bo'sh bo'lsa — oddiy shakl
   * (jamoa nomi, yo'nalish, izoh) chiqadi.
   */
  anketa?: Savol[];
}) {
  const t = useTranslations('Competitions');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [javoblar, setJavoblar] = useState<Javoblar>({});
  const [javobXatolari, setJavobXatolari] = useState<Record<string, string>>({});
  const [tuzoq, setTuzoq] = useState('');
  const [xato, setXato] = useState<XatoKodi | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [yuborilmoqda, boshla] = useTransition();

  const disabled = status !== 'ochiq';
  const anketaBor = anketa.length > 0;

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function javobYoz(id: string, qiymat: string | string[]) {
    setJavoblar((j) => ({ ...j, [id]: qiymat }));
  }

  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = tc('required');
    if (!form.email.trim()) e.email = tc('required');
    else if (!emailRe.test(form.email)) e.email = tc('invalidEmail');
    if (!form.phone.trim()) e.phone = tc('required');
    setErrors(e);

    const je: Record<string, string> = {};
    for (const s of anketa) {
      const v = javoblar[s.id];
      const bosh = Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim();
      if (bosh) {
        if (s.talab) je[s.id] = tc('required');
        continue;
      }
      const matn = String(v).trim();
      if (s.tur === 'havola' && !havolaRe.test(matn)) je[s.id] = t('form_invalidUrl');
      if (s.tur === 'raqam' && !sonRe.test(matn)) je[s.id] = t('form_invalid');
    }
    setJavobXatolari(je);

    return Object.keys(e).length === 0 && Object.keys(je).length === 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setXato(null);
    boshla(async () => {
      const natija = await tanlovArizasi({
        competitionId: competitionId ?? null,
        fullName: form.name,
        ensembleName: form.ensemble,
        email: form.email,
        phone: form.phone,
        category: form.category,
        message: form.message,
        javoblar: anketaBor ? javoblar : undefined,
        locale,
        tuzoq,
      });
      if (natija.ok) setSubmitted(true);
      else setXato(natija.kod);
    });
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setForm(empty);
      setErrors({});
      setJavoblar({});
      setJavobXatolari({});
      setXato(null);
    }, 200);
  }

  return (
    <>
      <Button variant="gold" size="lg" disabled={disabled} className="group gap-2.5" onClick={() => setOpen(true)}>
        {disabled
          ? <Lock className="h-4 w-4" />
          : <SendHorizontal className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-rotate-12" />}
        {disabled ? t('status_yopiq') : t('applyButton')}
      </Button>

      <Modal open={open} onClose={close} title={t('applyTitle')}>
        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-7 w-7" />
            </span>
            <p className="font-serif text-lg font-semibold text-navy">{tc('successMessage')}</p>
            <Button className="mt-6" onClick={close}>
              {tc('close')}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label={t('form_name')} error={errors.name} required>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            {!anketaBor && (
              <Field label={t('form_ensemble')}>
                <Input value={form.ensemble} onChange={(e) => set('ensemble', e.target.value)} />
              </Field>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('form_email')} error={errors.email} required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <Field label={t('form_phone')} error={errors.phone} required>
                <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
            </div>
            {anketaBor ? (
              anketa.map((s) => (
                <AnketaSavoli
                  key={s.id}
                  savol={s}
                  locale={locale}
                  qiymat={javoblar[s.id]}
                  xato={javobXatolari[s.id]}
                  tanlangYorligi={t('form_choose')}
                  ozgartir={(v) => javobYoz(s.id, v)}
                />
              ))
            ) : (
              <>
                <Field label={t('form_category')}>
                  <Input value={form.category} onChange={(e) => set('category', e.target.value)} />
                </Field>
                <Field label={t('form_message')}>
                  <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} />
                </Field>
              </>
            )}
            <XatoXabari kod={xato} />
            <Tuzoq qiymat={tuzoq} ozgartir={setTuzoq} />

            <Button type="submit" className="w-full" size="lg" disabled={yuborilmoqda}>
              {yuborilmoqda ? tc('sending') : tc('submit')}
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}

/** Admin tuzgan anketadagi bitta savol */
function AnketaSavoli({
  savol: s,
  locale,
  qiymat,
  xato,
  tanlangYorligi,
  ozgartir,
}: {
  savol: Savol;
  locale: string;
  qiymat: string | string[] | undefined;
  xato?: string;
  tanlangYorligi: string;
  ozgartir: (v: string | string[]) => void;
}) {
  const yorliq = tilda(s.savol, locale);
  const izoh = tilda(s.izoh, locale);
  const matn = typeof qiymat === 'string' ? qiymat : '';
  const variantlar = variantlarTilda(s, locale);

  // Variantlar ro'yxati — bitta <label> ichiga bir nechta input sig'maydi
  if (s.tur === 'variant' || s.tur === 'belgilar') {
    const tanlangan = Array.isArray(qiymat) ? qiymat : matn ? [matn] : [];
    return (
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-navy">
          {yorliq}
          {s.talab && <span className="ml-0.5 text-red-500">*</span>}
        </legend>
        {izoh && <p className="mb-2 text-xs text-muted-foreground">{izoh}</p>}
        <div className="space-y-1.5">
          {variantlar.map((v, i) => {
            const k = String(i);
            const belgilangan = tanlangan.includes(k);
            return (
              <label
                key={k}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-input bg-white px-3.5 py-2.5 text-sm text-navy-900 transition-colors hover:border-navy/40"
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
        {xato && <span className="mt-1 block text-xs text-red-600">{xato}</span>}
      </fieldset>
    );
  }

  let boshqaruv: React.ReactNode;
  switch (s.tur) {
    case 'matnKatta':
      boshqaruv = (
        <Textarea value={matn} maxLength={5000} onChange={(e) => ozgartir(e.target.value)} />
      );
      break;
    case 'tanlov':
      boshqaruv = (
        <Select value={matn} onChange={(e) => ozgartir(e.target.value)}>
          <option value="">{tanlangYorligi}</option>
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
          type={s.tur === 'sana' ? 'date' : s.tur === 'havola' ? 'url' : 'text'}
          inputMode={s.tur === 'raqam' ? 'decimal' : undefined}
          placeholder={s.tur === 'havola' ? 'https://' : undefined}
          maxLength={s.tur === 'havola' ? 2000 : 300}
          value={matn}
          onChange={(e) => ozgartir(e.target.value)}
        />
      );
  }

  return (
    <Field label={yorliq} error={xato} required={s.talab} izoh={izoh}>
      {boshqaruv}
    </Field>
  );
}

function Field({
  label,
  error,
  required,
  izoh,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  /** Maydon ostidagi kichik tushuntirish */
  izoh?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {izoh && <span className="-mt-1 mb-1.5 block text-xs text-muted-foreground">{izoh}</span>}
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
