import { ADMIN_RU, ADMIN_RU_QOSHIMCHA } from './admin-ru';

/**
 * Admin panel interfeysi ikki tilli: o'zbekcha (asosiy) va ruscha.
 *
 * Matnlar kodda o'zbekcha yoziladi; ruscha til tanlansa, brauzerda ekrandagi
 * matn shu lug'at (`admin-ru.ts`) bo'yicha almashtiriladi. Lug'atda yo'q matn
 * o'zbekcha qoladi — hech narsa buzilmaydi.
 */

export const ADMIN_TIL_KUKISI = 'admin-til';
export type AdminTil = 'uz' | 'ru';

export function adminTilOl(qiymat: string | undefined | null): AdminTil {
  return qiymat === 'ru' ? 'ru' : 'uz';
}

/** Kalit ham, ekrandagi matn ham bir xil ko'rinishga keltiriladi: ketma-ket bo'shliqlar bitta */
const tekisla = (s: string) => s.replace(/\s+/g, ' ').trim();

const TOCHIQ = new Map<string, string>();
const NAMUNALAR: { re: RegExp; ru: string }[] = [];

function lugatniYig() {
  if (TOCHIQ.size) return;
  for (const lugat of [ADMIN_RU, ADMIN_RU_QOSHIMCHA]) {
    for (const [uz, ru] of Object.entries(lugat)) {
      const kalit = tekisla(uz);
      if (!kalit.includes('{}')) {
        TOCHIQ.set(kalit, ru);
        continue;
      }
      // "Anketada {} ta savol" -> ^Anketada (.+?) ta savol$
      const qismlar = kalit.split('{}').map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      NAMUNALAR.push({ re: new RegExp(`^${qismlar.join('([\\s\\S]+?)')}$`), ru });
    }
  }
  // Uzunroq (aniqroq) namunalar oldin tekshiriladi
  NAMUNALAR.sort((a, b) => b.re.source.length - a.re.source.length);
}

/** Matn lug'atda bo'lsa — ruscha, bo'lmasa `null` */
function ruschasi(kalit: string): string | null {
  lugatniYig();
  const aniq = TOCHIQ.get(kalit);
  if (aniq !== undefined) return aniq;
  for (const { re, ru } of NAMUNALAR) {
    const m = re.exec(kalit);
    if (!m) continue;
    let i = 1;
    // O'zgaruvchan qism ham lug'atda (yoki namunada) bo'lsa tarjima qilinadi: "jamoa" -> "коллектив"
    return ru.replace(/\{\}/g, () => {
      const q = m[i++] ?? '';
      return ruschasi(tekisla(q)) ?? q;
    });
  }
  return null;
}

/** Atrofdagi bo'shliqlar saqlanadi: React matnni bo'laklab chiqarishi mumkin (" ta ") */
export function tarjimaQil(matn: string): string {
  const kalit = tekisla(matn);
  if (!kalit) return matn;
  const ru = ruschasi(kalit);
  if (ru === null || ru === kalit) return matn;
  const bosh = /^\s*/.exec(matn)?.[0] ?? '';
  const oxir = /\s*$/.exec(matn)?.[0] ?? '';
  return `${bosh}${ru}${oxir}`;
}
