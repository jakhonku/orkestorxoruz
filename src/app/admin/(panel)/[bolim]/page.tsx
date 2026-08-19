import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { royxatOlish } from '@/server/admin/amallar';
import { bolimTop } from '@/server/admin/registr';
import { Royxat } from '../_components/royxat';

type Props = { params: { bolim: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: bolimTop(params.bolim)?.nom ?? 'Bo‘lim' };
}

/** Registrga kiritilgan bo'limlar uchun umumiy ro'yxat sahifasi */
export default async function BolimRoyxatiSahifasi({ params }: Props) {
  const bolim = bolimTop(params.bolim);
  if (!bolim) notFound();

  const qatorlar = await royxatOlish(bolim.kalit);

  return (
    <Royxat
      kalit={bolim.kalit}
      nom={bolim.nom}
      birlik={bolim.birlik}
      izoh={bolim.izoh}
      qatorlar={qatorlar}
      qoshishMumkin={bolim.qoshishMumkin !== false}
    />
  );
}
