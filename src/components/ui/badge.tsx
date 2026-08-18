import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-navy/10 text-navy',
        gold: 'bg-gradient-to-r from-amber-400 via-gold-400 to-amber-500 text-navy-950 font-semibold shadow-sm',
        'gold-outline': 'border border-gold-400/50 bg-gold/15 text-gold-200 backdrop-blur-sm',
        outline: 'border border-navy/20 text-navy',
        success: 'bg-emerald-100 text-emerald-800',
        muted: 'bg-navy-50 text-navy-800 border border-navy/10',
        danger: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
