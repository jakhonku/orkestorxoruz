import { cn } from '@/lib/utils';

/**
 * Admin paneldan kelgan uzun matnni abzatslarga boʻlib chiqaradi.
 *
 * Muharrir shaklda oddiy qilib yozadi — boʻsh qator yangi abzatsni boshlaydi.
 * Matn boʻsh boʻlsa hech narsa chizilmaydi, sahifada boʻsh joy qolmaydi.
 */
export function Abzatslar({ matn, className }: { matn: string; className?: string }) {
  const bandlar = matn
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (bandlar.length === 0) return null;

  return (
    <div className={cn('space-y-4 text-lg leading-relaxed text-muted-foreground', className)}>
      {bandlar.map((band, i) => (
        <p key={i} className="whitespace-pre-line">
          {band}
        </p>
      ))}
    </div>
  );
}
