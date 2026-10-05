'use client';

import {
  CHEGARA,
  RUXSAT_ETILGAN,
  faylTuri,
  hajmXatosi,
  turXatosi,
} from '@/lib/yuklash';

/**
 * Admin paneldan fayl yuklash.
 *
 * Uch qadam:
 *   1. Server bir martalik imzolangan manzil beradi (turi va hajmi tekshiriladi)
 *   2. Fayl brauzerdan toʻgʻridan-toʻgʻri Supabase Storageʼga ketadi — jarayon
 *      foizi koʻrinib turadi
 *   3. Yuklangani roʻyxatga qayd qilinadi
 *
 * Xatolar oʻzbekcha va tushunarli qilib qaytariladi.
 */

type Imzo = { imzoUrl: string; yol: string; url: string; tur: string };

/** Javobni JSON qilib oʻqiydi; server HTML qaytarsa ham tushunarli xato beradi */
async function javobniOq(javob: Response): Promise<Record<string, unknown>> {
  const matn = await javob.text();
  try {
    return JSON.parse(matn) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Faylni Storageʼga qoʻyadi va jarayon foizini xabar qilib turadi */
function storagegaQoy(imzoUrl: string, fayl: File, jarayon?: (foiz: number) => void) {
  return new Promise<void>((bajarildi, xato) => {
    const sorov = new XMLHttpRequest();
    sorov.open('PUT', imzoUrl);

    sorov.upload.onprogress = (h) => {
      if (h.lengthComputable && jarayon) jarayon(Math.round((h.loaded / h.total) * 100));
    };

    sorov.onload = () => {
      if (sorov.status >= 200 && sorov.status < 300) return bajarildi();
      if (sorov.status === 413) {
        return xato(new Error('Fayl juda katta — Storage qabul qilmadi (chegara 50 MB).'));
      }
      xato(new Error(`Yuklab boʻlmadi (${sorov.status}). Qaytadan urinib koʻring.`));
    };

    sorov.onerror = () =>
      xato(new Error('Internet uzildi. Aloqani tekshirib, qaytadan urinib koʻring.'));
    sorov.onabort = () => xato(new Error('Yuklash toʻxtatildi.'));

    // Supabase imzolangan manzil faylni shu koʻrinishda kutadi
    const forma = new FormData();
    forma.append('cacheControl', '3600');
    forma.append('', fayl);
    sorov.send(forma);
  });
}

export async function faylYukla(
  fayl: File,
  papka: string,
  jarayon?: (foiz: number) => void,
): Promise<string> {
  const tur = faylTuri(fayl.name, fayl.type);
  const tavsif = RUXSAT_ETILGAN[tur];

  // Brauzerda darhol tekshiramiz — notoʻgʻri fayl umuman yuborilmaydi
  if (!tavsif) throw new Error(turXatosi(fayl.name, tur));
  if (fayl.size > CHEGARA[tavsif.guruh]) throw new Error(hajmXatosi(tavsif.guruh, fayl.size));
  if (fayl.size === 0) throw new Error('Fayl boʻsh koʻrinadi. Boshqa faylni tanlang.');

  jarayon?.(0);

  const javob = await fetch('/api/admin/yuklash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom: fayl.name, tur, hajm: fayl.size, papka }),
  });
  const natija = await javobniOq(javob);

  if (!javob.ok || typeof natija.imzoUrl !== 'string') {
    const xabar =
      typeof natija.xato === 'string'
        ? natija.xato
        : javob.status === 401
          ? 'Sessiya tugagan. Sahifani yangilab, qaytadan kiring.'
          : 'Yuklashni boshlab boʻlmadi. Qaytadan urinib koʻring.';
    throw new Error(xabar);
  }

  const imzo = natija as unknown as Imzo;

  // Brauzer fayl turini aytmagan boʻlsa (.mov bilan shunday boʻladi) —
  // toʻgʻri turini oʻzimiz qoʻyamiz, aks holda video saytda ochilmaydi
  const yuboriladigan =
    fayl.type === imzo.tur ? fayl : new File([fayl], fayl.name, { type: imzo.tur });

  await storagegaQoy(imzo.imzoUrl, yuboriladigan, jarayon);

  // Roʻyxatga qayd — yozilmasa ham yuklash muvaffaqiyatli hisoblanadi
  void fetch('/api/admin/yuklash/qayd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imzo.url, nom: fayl.name, tur: imzo.tur, hajm: fayl.size, papka }),
  }).catch(() => {});

  return imzo.url;
}
