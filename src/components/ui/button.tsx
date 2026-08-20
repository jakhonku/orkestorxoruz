'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-navy-700 via-navy to-navy-600 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg hover:from-navy-800 hover:to-navy-700',
        gold:
          'bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-navy-950 shadow-[0_4px_18px_rgba(201,162,39,0.40),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,162,39,0.55)] hover:from-amber-300 hover:to-gold-400 border border-gold-300/30',
        outline:
          'border border-navy/25 bg-transparent text-navy hover:bg-navy hover:text-white hover:-translate-y-0.5 hover:border-navy',
        ghost: 'text-navy hover:bg-navy/8 hover:-translate-y-0.5',
        link: 'text-navy underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
