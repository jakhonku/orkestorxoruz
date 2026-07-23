import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs, light = false }: { crumbs: Crumb[]; light?: boolean }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className={cn(
                    'transition-colors',
                    light ? 'text-white/60 hover:text-gold-300' : 'text-muted-foreground hover:text-navy'
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={cn('font-medium', light ? 'text-white' : 'text-navy')}>
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className={cn('h-3.5 w-3.5', light ? 'text-white/40' : 'text-muted-foreground')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
