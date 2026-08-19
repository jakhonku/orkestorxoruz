import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { yozuvOlish } from '@/server/admin/amallar';
import { bolimTop } from '@/server/admin/registr';
import type { Qiymatlar } from '@/server/admin/turlar';
import { Shakl } from '../../_components/shakl';

type Props = { params: { bolim: string; id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bolim = bolimTop(params.bolim);
  if (!bolim) return { title: 'Topilmadi' };
  return {
    title: params.id === 'yangi' ? `Yangi ${bolim.birlik}` : `${bolim.nom} — tahrirlash`,
  };
}

/** Yangi yozuv qo'shish (`/yangi`) va mavjudini tahrirlash (`/12`) sahifasi */
export default async function TahrirlashSahifasi({ params }: Props) {
  const bolim = bolimTop(params.bolim);
  if (!bolim) notFound();

  const yangiMi = params.id === 'yangi';
  const id = yangiMi ? null : Number(params.id);
  if (!yangiMi && !Number.isInteger(id)) notFound();

  let boshlangich: Qiymatlar = {};
  if (id !== null) {
    const yozuv = await yozuvOlish(bolim.kalit, id);
    if (!yozuv) notFound();
    boshlangich = yozuv;
  }

  return (
    <Shakl
      bolim={{
        kalit: bolim.kalit,
        nom: bolim.nom,
        birlik: bolim.birlik,
        izoh: bolim.izoh,
        maydonlar: bolim.maydonlar,
      }}
      id={id}
      boshlangich={boshlangich}
    />
  );
}
