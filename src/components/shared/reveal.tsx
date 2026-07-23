'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
}

const offset = 24;

function initialFor(direction: Direction) {
  switch (direction) {
    case 'up':
      return { opacity: 0, y: offset };
    case 'down':
      return { opacity: 0, y: -offset };
    case 'left':
      return { opacity: 0, x: offset };
    case 'right':
      return { opacity: 0, x: -offset };
    default:
      return { opacity: 0 };
  }
}

/** Soft scroll-triggered fade-in used across every section. */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={initialFor(direction)}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container: wrap items and give each an increasing index. */
export function RevealGroup({
  children,
  className,
  step = 0.1,
}: {
  children: ReactNode[];
  className?: string;
  step?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
