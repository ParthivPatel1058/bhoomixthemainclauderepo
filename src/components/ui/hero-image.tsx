import { cn } from '@/lib/utils';

/**
 * Still photograph behind the hero.
 *
 * This replaced a looping timelapse. The video carried real engineering —
 * connection-aware sources, Save-Data and reduced-motion opt-outs, pausing when
 * off-screen — but a single optimised still is cheaper than all of it, and
 * cheapest is what this audience needs: rural Android phones on 3G, where even
 * a 0.30 MB video competes with the rest of the page for bandwidth.
 *
 * `fetchPriority="high"` because this is the LCP element. The intrinsic
 * width/height are set so the browser reserves the box before the bytes arrive
 * and the headline does not jump.
 */

interface HeroImageProps {
  className?: string;
}

export default function HeroImage({ className }: HeroImageProps) {
  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden', className)}>
      <img
        src="/media/hero-mountains.jpg"
        alt=""
        width={2000}
        height={1129}
        fetchPriority="high"
        decoding="async"
        className="h-full w-full object-cover"
      />

      {/* The scrim the headline sits on. Heaviest at the bottom left, where the
          type actually is, rather than an even wash over the whole frame. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/70 via-black/35 to-black/10" />
    </div>
  );
}
