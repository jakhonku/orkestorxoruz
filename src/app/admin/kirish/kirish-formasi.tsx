'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { AlertCircle, LogIn } from 'lucide-react';

import { kirish, type KirishHolati } from '../actions';

function Tugma() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy text-sm font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60"
    >
      <LogIn className="h-4 w-4" />
      {pending ? 'Tekshirilmoqda...' : 'Kirish'}
    </button>
  );
}

export function KirishFormasi() {
  const [holat, action] = useFormState<KirishHolati, FormData>(kirish, {});

  return (
    <form action={action} className="space-y-4">
      {holat.xato && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {holat.xato}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
        />
      </div>

      <div>
        <label htmlFor="parol" className="mb-1.5 block text-sm font-medium text-navy">
          Parol
        </label>
        <input
          id="parol"
          name="parol"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
        />
      </div>

      <Tugma />
    </form>
  );
}
