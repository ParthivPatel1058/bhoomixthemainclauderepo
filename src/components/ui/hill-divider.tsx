import { cn } from '@/lib/utils';

/**
 * The ridge that hands the hero photograph over to the page below it.
 *
 * Two earlier attempts are worth recording, because both looked wrong for the
 * same underlying reason. A straight gradient fade read as the photo simply
 * running out. Replacing it with smooth bezier waves read as a decorative
 * ribbon - a sine curve is the one shape ground never makes.
 *
 * These profiles come from midpoint displacement, the classic fractal terrain
 * algorithm, generated once and pasted in as static path data. That produces
 * detail at several scales at once - broad rises, bumps on the rises, small
 * rocks on the bumps - which is what makes a silhouette read as land. Seeded,
 * so the ridge is identical on every build and costs nothing at runtime.
 *
 * Colour is the part that took longest to get right. Filling both ridges with
 * the page background produced two pale translucent bands lying over the
 * field, which read as fog rather than terrain. Each ridge now runs its own
 * vertical gradient: an earth tone at the crest, resolving to the exact page
 * background at the foot of the band. That is what makes it look like ground
 * catching light while still joining the page below with no visible seam.
 *
 * The far ridge is lighter and less saturated than the near one. That is
 * aerial perspective - haze washes out distant land - and it is doing more
 * work here than the difference in height is.
 */

interface HillDividerProps {
  /** Height of the ridge band in px. Taller reads as nearer. */
  height?: number;
  className?: string;
}

export default function HillDivider({ height = 190, className }: HillDividerProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0 w-full', className)}
      style={{ height }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 190"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Distant land: hazed toward the page, low saturation. */}
          <linearGradient id="hill-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--hill-far))" />
            <stop offset="100%" stopColor="hsl(var(--background))" />
          </linearGradient>
          {/* Near land: the darker, warmer ground the content sits on. */}
          <linearGradient id="hill-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--hill-near))" />
            <stop offset="72%" stopColor="hsl(var(--background))" />
            <stop offset="100%" stopColor="hsl(var(--background))" />
          </linearGradient>
        </defs>

        <path d="M0.0,72.0 L22.0,69.0 L45.0,73.0 L68.0,65.0 L90.0,64.0 L112.0,61.0 L135.0,62.0 L158.0,62.0 L180.0,58.0 L202.0,55.0 L225.0,52 L248.0,52 L270.0,52 L292.0,53.0 L315.0,56.0 L338.0,54.0 L360.0,53.0 L382.0,52 L405.0,52 L428.0,52 L450.0,52 L472.0,52 L495.0,52.0 L518.0,52 L540.0,52 L562.0,54.0 L585.0,55.0 L608.0,59.0 L630.0,63.0 L652.0,67.0 L675.0,66.0 L698.0,73.0 L720.0,77.0 L742.0,74.0 L765.0,75.0 L788.0,82.0 L810.0,81.0 L832.0,76.0 L855.0,75.0 L878.0,74.0 L900.0,73.0 L922.0,75.0 L945.0,73.0 L968.0,66.0 L990.0,64.0 L1012.0,64.0 L1035.0,63.0 L1058.0,63.0 L1080.0,69.0 L1102.0,67.0 L1125.0,63.0 L1148.0,60.0 L1170.0,54.0 L1192.0,54.0 L1215.0,53.0 L1238.0,54.0 L1260.0,52 L1282.0,52 L1305.0,52 L1328.0,55.0 L1350.0,56.0 L1372.0,58.0 L1395.0,58.0 L1418.0,58.0 L1440.0,58.0 L1440,190 L0,190 Z" fill="url(#hill-far)" />
        <path d="M0.0,123.0 L22.0,129.0 L45.0,129.0 L68.0,126.0 L90.0,127.0 L112.0,128.0 L135.0,127.0 L158.0,132.0 L180.0,134.0 L202.0,138.0 L225.0,138.0 L248.0,136.0 L270.0,138.0 L292.0,138.0 L315.0,139.0 L338.0,135.0 L360.0,135.0 L382.0,136.0 L405.0,134.0 L428.0,136.0 L450.0,140.0 L472.0,146.0 L495.0,148.0 L518.0,149.0 L540.0,152.0 L562.0,155.0 L585.0,155.0 L608.0,158.0 L630.0,157.0 L652.0,159.0 L675.0,163.0 L698.0,163.0 L720.0,162.0 L742.0,161.0 L765.0,156.0 L788.0,156.0 L810.0,155.0 L832.0,154.0 L855.0,154.0 L878.0,153.0 L900.0,153.0 L922.0,158.0 L945.0,161.0 L968.0,160.0 L990.0,162.0 L1012.0,163.0 L1035.0,163.0 L1058.0,163.0 L1080.0,162.0 L1102.0,160.0 L1125.0,158.0 L1148.0,156.0 L1170.0,158.0 L1192.0,153.0 L1215.0,146.0 L1238.0,145.0 L1260.0,141.0 L1282.0,142.0 L1305.0,144.0 L1328.0,141.0 L1350.0,140.0 L1372.0,142.0 L1395.0,141.0 L1418.0,141.0 L1440.0,142.0 L1440,190 L0,190 Z" fill="url(#hill-near)" />

        {/* Light catching the near crest. In the light theme the ridge already
            reads from the tonal step; in the dark theme both sides are near
            black and this rim is the only thing giving the shape an edge. */}
        <path
          d="M0.0,123.0 L22.0,129.0 L45.0,129.0 L68.0,126.0 L90.0,127.0 L112.0,128.0 L135.0,127.0 L158.0,132.0 L180.0,134.0 L202.0,138.0 L225.0,138.0 L248.0,136.0 L270.0,138.0 L292.0,138.0 L315.0,139.0 L338.0,135.0 L360.0,135.0 L382.0,136.0 L405.0,134.0 L428.0,136.0 L450.0,140.0 L472.0,146.0 L495.0,148.0 L518.0,149.0 L540.0,152.0 L562.0,155.0 L585.0,155.0 L608.0,158.0 L630.0,157.0 L652.0,159.0 L675.0,163.0 L698.0,163.0 L720.0,162.0 L742.0,161.0 L765.0,156.0 L788.0,156.0 L810.0,155.0 L832.0,154.0 L855.0,154.0 L878.0,153.0 L900.0,153.0 L922.0,158.0 L945.0,161.0 L968.0,160.0 L990.0,162.0 L1012.0,163.0 L1035.0,163.0 L1058.0,163.0 L1080.0,162.0 L1102.0,160.0 L1125.0,158.0 L1148.0,156.0 L1170.0,158.0 L1192.0,153.0 L1215.0,146.0 L1238.0,145.0 L1260.0,141.0 L1282.0,142.0 L1305.0,144.0 L1328.0,141.0 L1350.0,140.0 L1372.0,142.0 L1395.0,141.0 L1418.0,141.0 L1440.0,142.0"
          fill="none"
          stroke="hsl(var(--hill-rim))"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
