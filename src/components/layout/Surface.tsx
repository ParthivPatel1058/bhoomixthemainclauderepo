import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The one card.
 *
 * Three treatments were in circulation — `.glass rounded-2xl p-6`, a plain
 * `rounded-2xl border border-border bg-card shadow-sm`, and a
 * `.glass rounded-3xl border-2 border-primary/10` — often two of them on the
 * same screen. This builds on the existing `.glass` utility rather than
 * replacing it, since 108 call sites already use it and they should all end up
 * looking like the same object.
 *
 * The hover treatment is inherited from `SectionCard`, which was well judged
 * and had zero usages; folding it in here is what let that file be deleted.
 */

interface SurfaceProps {
  children: ReactNode;
  /**
   * `glass` floats over the crop photography — the default, and what most of
   * the app already does. `solid` is for dense content where a blurred
   * backdrop hurts legibility: tables, long forms, receipts. `inset` recedes,
   * for a well inside another surface.
   */
  variant?: 'glass' | 'solid' | 'inset';
  /** Lift and warm the border on hover. Only for surfaces that are links. */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: ElementType;
  className?: string;
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

const VARIANT = {
  glass: 'glass',
  solid: 'border border-border bg-card shadow-raised',
  inset: 'border border-border/60 bg-muted/40',
} as const;

export default function Surface({
  children,
  variant = 'glass',
  interactive = false,
  padding = 'md',
  as: Tag = 'div',
  className,
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        'rounded-lg transition-all duration-500 ease-[var(--ease-editorial)]',
        VARIANT[variant],
        PADDING[padding],
        interactive &&
          'hover:-translate-y-1 hover:border-secondary/40 hover:shadow-floating',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
