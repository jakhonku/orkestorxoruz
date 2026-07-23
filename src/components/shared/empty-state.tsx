import { SearchX } from 'lucide-react';

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy/15 bg-navy/[0.02] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy/5">
        <SearchX className="h-6 w-6 text-navy/40" />
      </div>
      <p className="font-serif text-lg font-semibold text-navy">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
