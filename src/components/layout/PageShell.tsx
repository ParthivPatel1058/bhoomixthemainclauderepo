import type { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import BackButton from '@/components/BackButton';
import { cn } from '@/lib/utils';

/**
 * The frame every page sits in.
 *
 * Before this existed, all twenty-one pages hand-typed their own version of
 * the same four lines — `min-h-screen`, `<Navigation />`, `<BackButton />`, a
 * container — and no two agreed. There were eleven distinct `container mx-auto`
 * rhythms in the app, which is why moving between pages felt like moving
 * between products. The width choice is now a named decision rather than
 * whatever padding the last page happened to use.
 */

interface PageShellProps {
  children: ReactNode;
  /**
   * Measure of the content column.
   * `narrow` for forms and reading, `default` for most pages, `wide` for
   * grids and tables that need the room, `full` to opt out of the container.
   */
  width?: 'narrow' | 'default' | 'wide' | 'full';
  /** Hide the back control — home and role-root screens have nowhere to go. */
  back?: boolean;
  /** Where back goes when there is no in-app history to pop. */
  backTo?: string;
  className?: string;
}

const WIDTHS = {
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: '',
} as const;

export default function PageShell({
  children,
  width = 'default',
  back = true,
  backTo = '/',
  className,
}: PageShellProps) {
  return (
    <div className="min-h-screen">
      <Navigation />

      {back && (
        <div className="px-4 pt-5 lg:px-6">
          <BackButton fallback={backTo} />
        </div>
      )}

      <main
        className={cn(
          'mx-auto w-full px-4 pb-20 pt-8 sm:px-6 lg:px-8',
          WIDTHS[width],
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
