'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!emailRe.test(email)) {
      setError(tc('invalidEmail'));
      return;
    }
    // UI-only: backend endpoint will be wired here later.
    setError('');
    setDone(true);
    setEmail('');
  }

  const dark = variant === 'dark';

  if (done) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
          dark ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'
        )}
      >
        <Check className="h-4 w-4" />
        {tc('successMessage')}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletterPlaceholder')}
          className={cn(
            'h-12 flex-1 rounded-full px-5 text-sm outline-none transition-colors',
            dark
              ? 'bg-white/10 text-white placeholder:text-white/50 focus:bg-white/15'
              : 'border border-input bg-white text-navy-900 placeholder:text-muted-foreground focus:border-navy'
          )}
          aria-label={t('newsletterPlaceholder')}
        />
        <button
          type="submit"
          className={cn(
            'flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors',
            dark ? 'bg-gold text-navy-900 hover:bg-gold-600' : 'bg-navy text-white hover:bg-navy-800'
          )}
        >
          {t('newsletterButton')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p className={cn('mt-2 text-xs', dark ? 'text-gold-200' : 'text-red-600')}>{error}</p>
      )}
    </form>
  );
}
