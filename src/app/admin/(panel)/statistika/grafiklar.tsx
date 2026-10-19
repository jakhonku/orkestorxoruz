import type { KunlikNuqta } from '@/server/queries/statistika';

const KOK = '#1e3a5f';
const OLTIN = '#c9a24b';

/** Kunlik koʻrishlar (chiziq) va tashrifchilar (chiziq) — yengil inline SVG */
export function KunlikGrafik({ kunlik }: { kunlik: KunlikNuqta[] }) {
  const W = 720;
  const H = 240;
  const L = 36;
  const B = 24;
  const T = 10;
  const R = 8;
  const max = Math.max(1, ...kunlik.map((k) => k.korishlar));
  const x = (i: number) => L + (kunlik.length <= 1 ? 0 : (i * (W - L - R)) / (kunlik.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const chiziq = (f: (k: KunlikNuqta) => number) =>
    kunlik.map((k, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(f(k)).toFixed(1)}`).join(' ');
  const belgilar = [0, 0.5, 1].map((p) => Math.round(max * p));
  const qadam = Math.max(1, Math.ceil(kunlik.length / 8));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Kunlik koʻrishlar grafigi">
      {belgilar.map((b) => (
        <g key={b}>
          <line x1={L} x2={W - R} y1={y(b)} y2={y(b)} stroke="currentColor" strokeOpacity="0.12" />
          <text x={L - 6} y={y(b) + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.6">
            {b}
          </text>
        </g>
      ))}
      <path d={chiziq((k) => k.korishlar)} fill="none" stroke={KOK} strokeWidth="2" />
      <path d={chiziq((k) => k.tashrifchilar)} fill="none" stroke={OLTIN} strokeWidth="2" />
      {kunlik.map((k, i) =>
        i % qadam === 0 ? (
          <text key={k.kun} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">
            {k.kun.slice(5).split('-').reverse().join('.')}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function Izoh() {
  return (
    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <i className="inline-block h-0.5 w-4" style={{ background: KOK }} /> Koʻrishlar
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block h-0.5 w-4" style={{ background: OLTIN }} /> Tashrifchilar
      </span>
    </div>
  );
}

/** Davlatlar boʻyicha gorizontal ustunlar */
export function DavlatGrafik({ davlatlar }: { davlatlar: { nom: string; soni: number }[] }) {
  const max = Math.max(1, ...davlatlar.map((d) => d.soni));
  return (
    <ul className="space-y-2">
      {davlatlar.map((d) => (
        <li key={d.nom} className="text-sm">
          <div className="flex justify-between">
            <span className="text-navy">{d.nom}</span>
            <span className="tabular-nums text-muted-foreground">{d.soni}</span>
          </div>
          <div className="mt-1 h-2 rounded bg-navy/10">
            <div className="h-2 rounded" style={{ width: `${(d.soni / max) * 100}%`, background: KOK }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
