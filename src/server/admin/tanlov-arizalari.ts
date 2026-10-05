import 'server-only';

import { javobMatni, javoblarniOqi } from '@/lib/anketa';
import type { Murojaat } from '@/app/admin/(panel)/arizalar/_components/murojaatlar-royxati';

/**
 * Tanlov arizasini admin paneldagi murojaat koʻrinishiga oʻgiradi.
 * "Arizalar va xabarlar" hamda "Tanlov arizalari" sahifalari shuni ishlatadi.
 */

export function sana(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Boʻsh maydonlar tafsilotlar roʻyxatiga tushmaydi */
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
    qisqa: [tanlovNomi(r), r.ensembleName, r.category, ...javoblar.filter((j) => j.tur !== 'fayl').slice(0, 2).map((j) => javobMatni(j.javob))]
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
      ['Yoʻnalish', r.category],
      ['Email', r.email],
      ['Telefon', r.phone],
      ...javoblar.map((j): [string, string] => [j.savol, j.tur === 'fayl' ? 'Faylni ochish' : sanaKorinishi(javobMatni(j.javob))]),
      ['Til', r.locale.toUpperCase()],
      ['Xabar', r.message],
    ]).map((q) => {
      const fayl = javoblar.find((j) => j.tur === 'fayl' && j.savol === q.yorliq);
      if (!fayl) return q;
      const yol = String(fayl.javob);
      return {
        ...q,
        havola: arizaFayliHavolasi(yol),
        // Rasm boʻlsa admin panelda oʻzi koʻrinadi (PDF va hujjatlar — havola boʻlib qoladi)
        rasm: /\.(jpe?g|png|webp)$/i.test(yol),
      };
    }),
  };
}

/** Yopiq bucketʼdagi faylni admin orqali ochadigan havola (muddati oʻtmaydi) */
export function arizaFayliHavolasi(yol: string, asos = ''): string {
  return `${asos}/api/admin/ariza-fayli?yol=${encodeURIComponent(yol)}`;
}

/** Sana javoblari (2002-01-30) jadvalda 30.01.2002 koʻrinishida chiqadi */
function sanaKorinishi(m: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(m) ? m.split('-').reverse().join('.') : m;
}
