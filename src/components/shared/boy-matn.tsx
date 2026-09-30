import { boyMatnHtml } from '@/lib/boy-matn';
import { cn } from '@/lib/utils';

/** Admin panelda boyitilgan matn sifatida kiritilgan qiymatni ko'rsatadi */
export function BoyMatn({ matn, className }: { matn: string; className?: string }) {
  return (
    <div
      className={cn(
        'space-y-3 text-lg leading-relaxed text-muted-foreground',
        '[&_strong]:font-bold [&_strong]:text-navy [&_em]:italic [&_u]:underline',
        '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1',
        '[&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-navy',
        '[&_h4]:font-semibold [&_h4]:text-navy',
        className
      )}
      dangerouslySetInnerHTML={{ __html: boyMatnHtml(matn) }}
    />
  );
}
