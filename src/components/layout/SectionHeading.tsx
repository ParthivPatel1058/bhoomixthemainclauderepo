import type { ReactNode } from 'react';
import Reveal from '@/components/Reveal';
import { cn } from '@/lib/utils';

/**
 * The in-page `h2` between blocks — one step down from `PageHeader`, and the
 * reason pages no longer reach for a second title style when they need to
 * break up a long screen.
 */

interface SectionHeadingProps {
  title: string;
  /** One line of context. Longer belongs in the section body. */
  note?: string;
  /** A "view all" link or filter control, aligned right. */
  action?: ReactNode;
  className?: string;
}

export default function SectionHeading({
  title,
  note,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal distance={14} className={cn('mb-5', className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          {note && <p className="mt-1.5 text-sm text-muted-foreground">{note}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </Reveal>
  );
}
