import { cn } from '@/lib/utils';

/**
 * Admin paneldan kelgan uzun matnni abzatslarga bo'lib chiqaradi.
 *
 * Muharrir shaklda oddiy qilib yozadi — bo'sh qator yangi abzatsni boshlaydi.
 * Matn bo'sh bo'lsa hech narsa chizilmaydi, sahifada bo'sh joy qolmaydi.
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
