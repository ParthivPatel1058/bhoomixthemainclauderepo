import { cn } from '@/lib/utils';

/**
 * Three balls bouncing in sequence, each casting a shadow that flattens and
 * fades as the ball rises.
 *
 * Ported from a styled-components original to plain CSS in `index.css`, the
 * same way `ui/theme-switch.tsx` and the sidebar's day/night switch were —
 * this project has no CSS-in-JS runtime, and a styled-components wrapper would
 * also re-inject the keyframes once per mounted spinner.
 *
 * Colours are the original's: white balls, a near-black shadow. That means it
 * needs a dark surface underneath, which is what every loading screen in this
 * app already sits on.
 */
export function BounceLoader({
  className,
  label = 'Loading',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className={cn('bounce-loader', className)}>
      {/* The three shadows are siblings rather than children of the balls:
          they animate on their own curve, and nesting them would inherit the
          ball's vertical travel and defeat the effect. */}
      <span aria-hidden className="bounce-loader__ball" />
      <span aria-hidden className="bounce-loader__ball" />
      <span aria-hidden className="bounce-loader__ball" />
      <span aria-hidden className="bounce-loader__shadow" />
      <span aria-hidden className="bounce-loader__shadow" />
      <span aria-hidden className="bounce-loader__shadow" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default BounceLoader;
