'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Lock, SendHorizontal } from 'lucide-react';
import { Modal } from '@/components/shared/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { tanlovArizasi, type XatoKodi } from '@/server/forms/amallar';
import { Tuzoq, XatoXabari } from './forma-yordam';
import type { CompetitionStatus } from '@/types';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function ApplyModal({
  status,
  competitionId,
}: {
  status: CompetitionStatus;
  /** Ariza qaysi tanlovga tegishli ekani — bazaga shu bilan yoziladi */
  competitionId?: number;
}) {
  const t = useTranslations('Competitions');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [tuzoq, setTuzoq] = useState('');
  const [xato, setXato] = useState<XatoKodi | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [yuborilmoqda, boshla] = useTransition();

  const disabled = status !== 'ochiq';

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = tc('required');
    if (!form.email.trim()) e.email = tc('required');
    else if (!emailRe.test(form.email)) e.email = tc('invalidEmail');
    if (!form.phone.trim()) e.phone = tc('required');
    setErrors(e);
    return Object.keys(e).length === 0;
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
            <Field label={t('form_ensemble')}>
              <Input value={form.ensemble} onChange={(e) => set('ensemble', e.target.value)} />
            </Field>
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
            <Field label={t('form_category')}>
              <Input value={form.category} onChange={(e) => set('category', e.target.value)} />
            </Field>
            <Field label={t('form_message')}>
              <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} />
            </Field>
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

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
