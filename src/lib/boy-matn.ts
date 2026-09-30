/**
 * Boyitilgan matn (qalin, qiya, ro'yxat...) — admin panelda tahrirlanadi,
 * saytda ko'rsatiladi. Faqat quyidagi teglar qoladi, boshqa hamma narsa
 * (atributlar, skriptlar, uslublar) olib tashlanadi.
 */
const RUXSAT: Record<string, string> = {
  b: 'strong',
  strong: 'strong',
  i: 'em',
  em: 'em',
  u: 'u',
  p: 'p',
  div: 'p',
  br: 'br',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  h2: 'h3',
  h3: 'h3',
  h4: 'h4',
};

const YAKKA = new Set(['br']);
const TEG = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;

function belgilarniQochir(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Matnda ruxsat etilgan teg bormi (aks holda oddiy matn) */
export function boyMatnmi(s: string): boolean {
  return /<\/?(b|strong|i|em|u|p|div|br|ul|ol|li|h[234])\b/i.test(s);
}

export function boyMatnniTozala(kirish: string): string {
  let chiqish = '';
  let oxirgi = 0;
  const ochiq: string[] = [];

  for (const m of kirish.matchAll(TEG)) {
    chiqish += belgilarniQochir(kirish.slice(oxirgi, m.index));
    oxirgi = (m.index ?? 0) + m[0].length;

    const nom = RUXSAT[m[1].toLowerCase()];
    if (!nom) continue;
    if (YAKKA.has(nom)) {
      chiqish += `<${nom}>`;
    } else if (m[0].startsWith('</')) {
      const i = ochiq.lastIndexOf(nom);
      if (i === -1) continue;
      // Ichkarida ochiq qolgan teglar avval yopiladi
      while (ochiq.length > i) chiqish += `</${ochiq.pop()}>`;
    } else {
      ochiq.push(nom);
      chiqish += `<${nom}>`;
    }
  }
  chiqish += belgilarniQochir(kirish.slice(oxirgi));
  while (ochiq.length) chiqish += `</${ochiq.pop()}>`;
  return chiqish;
}

/**
 * Bazadagi qiymatni HTML ga aylantiradi. Eski (oddiy) matnda teg yo'q —
 * u abzatslarga bo'linadi.
 */
export function boyMatnHtml(s: string): string {
  if (!s) return '';
  if (boyMatnmi(s)) return boyMatnniTozala(s);
  return s
    .split(/\n{2,}/)
    .map((p) => `<p>${belgilarniQochir(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Teglarsiz matn — bo'shligini tekshirish va qisqa ko'rinish uchun */
export function boyMatnOddiy(s: string): string {
  return s.replace(TEG, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
