import 'server-only';

import { javobMatni, javoblarniOqi } from '@/lib/anketa';
import type { Murojaat } from '@/app/admin/(panel)/arizalar/_components/murojaatlar-royxati';

/**
 * Tanlov arizasini admin paneldagi murojaat ko'rinishiga o'giradi.
 * "Arizalar va xabarlar" hamda "Tanlov arizalari" sahifalari shuni ishlatadi.
 */

export function sana(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Bo'sh maydonlar tafsilotlar ro'yxatiga tushmaydi */
export function qatorlar(juftlar: [string, string | number | null | undefined][]) {
  return juftlar
    .filter(([, q]) => q !== null && q !== undefined && String(q).trim() !== '')
    .map(([yorliq, qiymat]) => ({ yorliq, qiymat: String(qiymat) }));
}

export type TanlovArizaQatori = {
  id: number;
  fullName: string;
  ensembleName: string | null;
  email: string;
  phone: string;
  category: string | null;
  message: string | null;
  answers: unknown;
  locale: string;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  competition: { title: unknown } | null;
};

export function tanlovNomi(r: Pick<TanlovArizaQatori, 'competition'>): string | undefined {
  return (r.competition?.title as { uz?: string } | null)?.uz;
}

export function tanlovMurojaati(r: TanlovArizaQatori): Murojaat {
  const javoblar = javoblarniOqi(r.answers);

  return {
    id: r.id,
    tur: 'tanlov',
    sarlavha: r.fullName,
    qisqa: [tanlovNomi(r), r.ensembleName, r.category, ...javoblar.slice(0, 2).map((j) => javobMatni(j.javob))]
      .filter(Boolean)
      .join(' · '),
    status: r.status,
    sana: sana(r.createdAt),
    eslatma: r.adminNote,
    email: r.email,
    telefon: r.phone,
    tafsilotlar: qatorlar([
      ['Ishtirokchi', r.fullName],
      ['Tanlov', tanlovNomi(r)],
      ['Jamoa', r.ensembleName],
      ['Yo‘nalish', r.category],
      ['Email', r.email],
      ['Telefon', r.phone],
      ...javoblar.map((j): [string, string] => [j.savol, javobMatni(j.javob)]),
      ['Til', r.locale.toUpperCase()],
      ['Xabar', r.message],
    ]),
  };
}
