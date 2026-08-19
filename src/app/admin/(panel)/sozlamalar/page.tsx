import { SOZLAMA_MAYDONLARI } from '@/server/admin/sozlama-maydonlari';
import { getSettings } from '@/server/queries/settings';
import type { Qiymatlar } from '@/server/admin/turlar';
import { SozlamalarShakli } from './sozlamalar-shakli';

export const metadata = { title: 'Sayt sozlamalari' };

export default async function SozlamalarSahifasi() {
  const s = await getSettings();

  const boshlangich: Qiymatlar = {
    siteName: s.name,
    siteShortName: s.shortName,
    slogan: s.slogan,
    missionText: s.missionText,
    address: s.address,
    workingHours: s.workingHours,
    phone: s.phone,
    email: s.email,
    siteUrl: s.url,
    notifyEmail: s.notifyEmail,
    mapLat: String(s.mapCoords.lat),
    mapLng: String(s.mapCoords.lng),
    socials: s.socials,
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold text-navy">Sayt sozlamalari</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kontakt ma’lumotlari, shior va ijtimoiy tarmoq havolalari. Bular saytning barcha
          sahifalarida — sarlavha, footer va «Aloqa» bo‘limida ishlatiladi.
        </p>
      </div>

      <SozlamalarShakli maydonlar={SOZLAMA_MAYDONLARI} boshlangich={boshlangich} />
    </div>
  );
}
