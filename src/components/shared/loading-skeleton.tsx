import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
