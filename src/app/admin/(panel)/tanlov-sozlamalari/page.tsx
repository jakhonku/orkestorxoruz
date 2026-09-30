import { TANLOV_MAYDONLARI } from '@/server/admin/sozlama-maydonlari';
import { getSettings } from '@/server/queries/settings';
import { sahifaRuxsati } from '@/server/admin/huquq';
import type { Qiymatlar } from '@/server/admin/turlar';
import { SozlamalarShakli } from '../sozlamalar/sozlamalar-shakli';

export const metadata = { title: 'Tanlov sozlamalari' };

export default async function TanlovSozlamalariSahifasi() {
  await sahifaRuxsati('tanlov-sozlamalari');
  const s = await getSettings();

  const boshlangich: Qiymatlar = {
    tanlovOpen: s.tanlovOpen,
    ishtirokQadamlar: s.ishtirok.steps,
    ishtirokSarlavha: s.ishtirok.title,
    ishtirokMatn: s.ishtirok.text,
    tayyorlashSarlavha: s.ishtirok.prepareTitle,
    tayyorlashRoyxat: s.ishtirok.prepareList,
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold text-navy">Tanlov sozlamalari</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tanlov va festivallarni saytda vaqtincha yopish-ochish hamda tanlov sahifasidagi
          «Ishtirok etish» kartasining umumiy matnlari. Alohida tanlovning o‘z matni
          kiritilgan bo‘lsa, o‘sha ustun turadi.
        </p>
      </div>

      <SozlamalarShakli
        toplam="tanlov"
        maydonlar={TANLOV_MAYDONLARI}
        boshlangich={boshlangich}
      />
    </div>
  );
}
