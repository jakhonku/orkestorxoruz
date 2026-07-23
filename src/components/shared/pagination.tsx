'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors',
            p === page
              ? 'bg-navy text-white shadow-soft'
              : 'border border-navy/15 text-navy hover:bg-navy/5'
          )}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
