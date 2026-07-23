'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const empty: FormState = { name: '', email: '', subject: '', message: '' };

export function ContactForm() {
  const t = useTranslations('Contact');
  const tc = useTranslations('Common');
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [done, setDone] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) err.name = tc('required');
    if (!form.email.trim()) err.email = tc('required');
    else if (!emailRe.test(form.email)) err.email = tc('invalidEmail');
    if (!form.message.trim()) err.message = tc('required');
    setErrors(err);
    if (Object.keys(err).length) return;
    // UI-only: POST to the contact endpoint here later.
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-white p-10 text-center shadow-soft">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-7 w-7" />
        </span>
        <p className="font-serif text-xl font-semibold text-navy">{tc('successMessage')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-soft md:p-8"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('form_name')} error={errors.name} required>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label={t('form_email')} error={errors.email} required>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
      </div>
      <Field label={t('form_subject')}>
        <Input value={form.subject} onChange={(e) => set('subject', e.target.value)} />
      </Field>
      <Field label={t('form_message')} error={errors.message} required>
        <Textarea
          className="min-h-[160px]"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
        />
      </Field>
      <Button type="submit" size="lg">
        <Send className="h-4 w-4" />
        {tc('submit')}
      </Button>
    </form>
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
