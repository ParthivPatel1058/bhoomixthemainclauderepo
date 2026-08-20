import type { ReactNode } from 'react';
import Reveal from '@/components/Reveal';
import { cn } from '@/lib/utils';

/**
 * The one page title treatment.
 *
 * It replaces three that were running at once: an editorial serif on nine
 * pages, a `bg-clip-text` gradient on six more, a `gradient-text` class on a
 * seventh, and an extrabold sans on an eighth. Gradient-filled headings in
 * particular are the single most dated thing in the app — they read as a 2021
 * landing page and they measure poorly for contrast, since the light end of
 * the gradient is doing the same job as the dark end.
 *
 * The `stats` strip is the piece worth keeping an eye on. BhoomiX is a numbers
 * product for people who read numbers off boards for a living, so a page that
 * has figures worth quoting states them in the header, in tabular figures,
 * aligned. It carries information; it is not a decorative flourish, and a page
 * without real numbers should pass nothing and get nothing.
 */

export interface PageStat {
  label: string;
  value: string | number;
  /** Ochre highlight. At most one per header — the accent is single-use. */
  emphasis?: boolean;
}

interface PageHeaderProps {
  /** Short category label above the title. */
  eyebrow?: string;
  title: string;
  /** One or two sentences. Anything longer belongs in the page body. */
  lede?: string;
  /** Buttons or controls, aligned right of the title on wide screens. */
  action?: ReactNode;
  stats?: PageStat[];
  className?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  lede,
  action,
  stats,
  className,
}: PageHeaderProps) {
  return (
    <Reveal immediate blur distance={18} className={cn('mb-10', className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <span className="mb-4 flex items-center gap-3">
              {/* The rule anchors the eyebrow to the left margin so the block
                  reads as one mark rather than a floating caption. */}
              <span aria-hidden className="h-px w-8 bg-secondary" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-secondary">
                {eyebrow}
              </span>
            </span>
          )}

          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[0.95] tracking-[-0.03em] text-foreground">
            {title}
          </h1>

          {lede && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {lede}
            </p>
          )}
        </div>

        {action && <div className="flex flex-shrink-0 items-center gap-3">{action}</div>}
      </div>

      {stats && stats.length > 0 && (
        <dl className="mt-8 flex flex-wrap items-stretch gap-x-8 gap-y-4 border-t border-border pt-5">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[7rem]">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </dt>
              <dd
                data-numeric
                className={cn(
                  'mt-1 text-2xl font-semibold leading-none tracking-tight',
                  s.emphasis ? 'text-secondary' : 'text-foreground',
                )}
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Reveal>
  );
}
