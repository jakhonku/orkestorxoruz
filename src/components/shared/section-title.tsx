import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  light?: boolean;
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  light = false,
}: SectionTitleProps) {
  return (
    <Reveal
      className={cn(
        'mb-12 flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.2em]',
            light ? 'text-gold-300' : 'text-gold'
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'font-serif text-3xl font-semibold leading-tight md:text-4xl',
          light ? 'text-white' : 'text-navy'
        )}
      >
        {title}
      </h2>
      <span className={cn('gold-rule', align === 'center' && 'mx-auto')} />
      {subtitle && (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed',
            light ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
