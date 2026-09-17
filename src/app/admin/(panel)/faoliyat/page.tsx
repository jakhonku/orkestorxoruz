import { FAOLIYAT_MAYDONLARI } from '@/server/admin/sozlama-maydonlari';
import { getFaoliyat } from '@/server/queries/faoliyat';
import type { Qiymatlar } from '@/server/admin/turlar';
import { SozlamalarShakli } from '../sozlamalar/sozlamalar-shakli';

export const metadata = { title: 'Faoliyat sahifasi' };

export default async function FaoliyatSahifasi() {
  const f = await getFaoliyat();

  const boshlangich: Qiymatlar = {
    activityTitle: f.title,
    activitySubtitle: f.subtitle,
    activityIntro: f.intro,
    activityImage: f.image,
    activityBlocks: f.blocks,
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold text-navy">Faoliyat sahifasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saytdagi <span className="font-medium text-navy">/faoliyat</span> sahifasi — menyudagi
          «Faoliyat» shu yerga olib boradi. Banner, kirish matni va pastdagi yo‘nalish
          kartochkalari shu yerdan boshqariladi.
        </p>
      </div>

      <SozlamalarShakli
        toplam="faoliyat"
        maydonlar={FAOLIYAT_MAYDONLARI}
        boshlangich={boshlangich}
      />
    </div>
  );
}
