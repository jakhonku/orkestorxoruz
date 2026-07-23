'use client';

import { useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, PlusCircle } from 'lucide-react';
import { Modal } from '@/components/shared/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { REGION_NAMES } from '@/lib/constants';
import { pick } from '@/lib/utils';
import type { EnsembleType, Region } from '@/types';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const types: EnsembleType[] = ['orkestr', 'xor', 'ansambl'];
const regions = Object.keys(REGION_NAMES) as Region[];

interface FormState {
  ensembleName: string;
  type: string;
  region: string;
  city: string;
  conductor: string;
  memberCount: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
}

const empty: FormState = {
  ensembleName: '',
  type: '',
  region: '',
  city: '',
  conductor: '',
  memberCount: '',
  contactName: '',
  email: '',
  phone: '',
  message: '',
};

/** CTA banner + modal application form for ensembles wishing to join the union. */
export function JoinEnsemble() {
  const t = useTranslations('Join');
  const te = useTranslations('Ensembles');
  const tc = useTranslations('Common');
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err: Partial<Record<keyof FormState, string>> = {};
    if (!form.ensembleName.trim()) err.ensembleName = tc('required');
    if (!form.type) err.type = tc('required');
    if (!form.region) err.region = tc('required');
    if (!form.contactName.trim()) err.contactName = tc('required');
    if (!form.email.trim()) err.email = tc('required');
    else if (!emailRe.test(form.email)) err.email = tc('invalidEmail');
    if (!form.phone.trim()) err.phone = tc('required');
    setErrors(err);
    if (Object.keys(err).length) return;
    // UI-only: POST to the ensemble-membership endpoint here later.
    setSubmitted(true);
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setForm(empty);
      setErrors({});
    }, 200);
  }

  return (
    <>
      {/* CTA banner */}
      <div className="relative mt-14 overflow-hidden rounded-3xl bg-navy px-6 py-12 shadow-soft-lg md:px-14">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 20%, rgba(201,162,39,0.25), transparent 45%)',
          }}
        />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-semibold text-white md:text-3xl">
              {t('ctaTitle')}
            </h2>
            <p className="mt-3 text-white/70">{t('ctaText')}</p>
          </div>
          <Button variant="gold" size="lg" className="shrink-0" onClick={() => setOpen(true)}>
            <PlusCircle className="h-5 w-5" />
            {t('ctaButton')}
          </Button>
        </div>
      </div>

      {/* Modal form */}
      <Modal open={open} onClose={close} title={t('modalTitle')}>
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
            <Field label={t('form_ensembleName')} error={errors.ensembleName} required>
              <Input value={form.ensembleName} onChange={(e) => set('ensembleName', e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('form_type')} error={errors.type} required>
                <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
                  <option value="">{t('typePlaceholder')}</option>
                  {types.map((tp) => (
                    <option key={tp} value={tp}>
                      {te(`type_${tp}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('form_region')} error={errors.region} required>
                <Select value={form.region} onChange={(e) => set('region', e.target.value)}>
                  <option value="">{t('regionPlaceholder')}</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {pick(REGION_NAMES[r], locale)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('form_city')}>
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label={t('form_conductor')}>
                <Input value={form.conductor} onChange={(e) => set('conductor', e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('form_memberCount')}>
                <Input
                  type="number"
                  min={1}
                  value={form.memberCount}
                  onChange={(e) => set('memberCount', e.target.value)}
                />
              </Field>
              <Field label={t('form_contactName')} error={errors.contactName} required>
                <Input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('form_email')} error={errors.email} required>
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label={t('form_phone')} error={errors.phone} required>
                <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
            </div>

            <Field label={t('form_message')}>
              <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} />
            </Field>

            <Button type="submit" className="w-full" size="lg">
              {tc('submit')}
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
