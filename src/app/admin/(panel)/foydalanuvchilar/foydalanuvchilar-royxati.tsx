'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, KeyRound, Plus, Shield, Trash2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  faollikAlmashtirish,
  foydalanuvchiOchirish,
  foydalanuvchiQoshish,
  parolniOzgartirish,
  rolniOzgartirish,
} from '@/server/admin/foydalanuvchilar';

export type Foydalanuvchi = {
  id: number;
  email: string;
  name: string;
  admin: boolean;
  faol: boolean;
  oxirgiKirish: string | null;
};

const INPUT =
  'h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-navy-900 focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15';

export function FoydalanuvchilarRoyxati({
  foydalanuvchilar,
  meniId,
}: {
  foydalanuvchilar: Foydalanuvchi[];
  meniId: number;
}) {
  const router = useRouter();
  const [xato, setXato] = useState<string | null>(null);
  const [shaklOchiq, setShaklOchiq] = useState(false);
  const [parolUchun, setParolUchun] = useState<number | null>(null);
  const [ochiriladigan, setOchiriladigan] = useState<number | null>(null);
  const [kutilmoqda, boshla] = useTransition();

  function amal(ish: () => Promise<{ ok: boolean; xato?: string }>, keyin?: () => void) {
    setXato(null);
    boshla(async () => {
      const natija = await ish();
      if (!natija.ok) {
        setXato(natija.xato ?? 'Xatolik yuz berdi.');
        return;
      }
      keyin?.();
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy">Foydalanuvchilar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <b className="font-semibold text-navy">Administrator</b> — hamma narsani boshqaradi,{' '}
            <b className="font-semibold text-navy">muharrir</b> — faqat kontentni tahrirlaydi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShaklOchiq((o) => !o)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-900"
        >
          {shaklOchiq ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {shaklOchiq ? 'Yopish' : 'Yangi foydalanuvchi'}
        </button>
      </div>

      {xato && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {xato}
        </p>
      )}

      {shaklOchiq && (
        <form
          action={(formData) =>
            amal(
              () => foydalanuvchiQoshish(formData),
              () => setShaklOchiq(false),
            )
          }
          className="mb-5 grid gap-4 rounded-2xl border border-border bg-white p-5 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">F.I.SH.</label>
            <input name="name" required className={INPUT} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
            <input name="email" type="email" required autoComplete="off" className={INPUT} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Parol</label>
            <input
              name="parol"
              type="text"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Kamida 8 ta belgi"
              className={INPUT}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Roli</label>
            <select name="role" defaultValue="MUHARRIR" className={INPUT}>
              <option value="MUHARRIR">Muharrir</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={kutilmoqda}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              Qo‘shish
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Parolni yozib oling — u shifrlanib saqlanadi va boshqa ko‘rsatilmaydi.
            </p>
          </div>
        </form>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
        {foydalanuvchilar.map((f) => (
          <li key={f.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-navy">
                  {f.name}
                  {f.admin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-900">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                  {f.id === meniId && (
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-medium text-navy/60">
                      siz
                    </span>
                  )}
                  {!f.faol && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                      bloklangan
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {f.email}
                  {f.oxirgiKirish && ` · oxirgi kirish: ${f.oxirgiKirish}`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setParolUchun(parolUchun === f.id ? null : f.id)}
                  title="Parolni almashtirish"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-navy-50 hover:text-navy"
                >
                  <KeyRound className="h-4 w-4" />
                </button>

                {f.id !== meniId && (
                  <>
                    <button
                      type="button"
                      disabled={kutilmoqda}
                      onClick={() => amal(() => rolniOzgartirish(f.id, !f.admin))}
                      className="h-8 rounded-lg border border-border px-2.5 text-xs font-medium text-navy transition-colors hover:border-gold/50 disabled:opacity-60"
                    >
                      {f.admin ? 'Muharrir qilish' : 'Admin qilish'}
                    </button>

                    <button
                      type="button"
                      disabled={kutilmoqda}
                      onClick={() => amal(() => faollikAlmashtirish(f.id))}
                      className={cn(
                        'h-8 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:opacity-60',
                        f.faol
                          ? 'border-border text-muted-foreground hover:text-navy'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
                      )}
                    >
                      {f.faol ? 'Bloklash' : 'Faollashtirish'}
                    </button>

                    {ochiriladigan === f.id ? (
                      <>
                        <button
                          type="button"
                          disabled={kutilmoqda}
                          onClick={() =>
                            amal(
                              () => foydalanuvchiOchirish(f.id),
                              () => setOchiriladigan(null),
                            )
                          }
                          className="h-8 rounded-lg bg-red-600 px-2.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          O‘chirilsin
                        </button>
                        <button
                          type="button"
                          onClick={() => setOchiriladigan(null)}
                          className="h-8 rounded-lg border border-border px-2.5 text-xs font-medium text-navy"
                        >
                          Bekor
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOchiriladigan(f.id)}
                        title="O‘chirish"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {parolUchun === f.id && (
              <ParolShakli
                onSaqla={(parol) =>
                  amal(
                    () => parolniOzgartirish(f.id, parol),
                    () => setParolUchun(null),
                  )
                }
                kutilmoqda={kutilmoqda}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParolShakli({
  onSaqla,
  kutilmoqda,
}: {
  onSaqla: (parol: string) => void;
  kutilmoqda: boolean;
}) {
  const [parol, setParol] = useState('');

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-navy-50/40 p-3">
      <input
        value={parol}
        onChange={(e) => setParol(e.target.value)}
        placeholder="Yangi parol — kamida 8 ta belgi"
        autoComplete="new-password"
        className={cn(INPUT, 'sm:max-w-xs')}
      />
      <button
        type="button"
        disabled={kutilmoqda || parol.length < 8}
        onClick={() => onSaqla(parol)}
        className="h-10 rounded-lg bg-navy px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        Parolni saqlash
      </button>
    </div>
  );
}
