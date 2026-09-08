import { useId } from 'react';

export interface PeelEdgeProps {
  /** Boundary height (%) at the left edge, the two control points, and right. */
  yLeft: number;
  cp1Y: number;
  cp2Y: number;
  yRight: number;
  /** Which skin is on top — decides shadow weight and highlight strength. */
  isDarkOnTop?: boolean;
}

/**
 * The crease where the outgoing skin lifts off the incoming one.
 *
 * On its own the peel is just a clip-path, and a clip-path has no thickness —
 * it reads as a shape cut out of paper. What sells it as a sheet peeling back
 * is this: a shadow cast down onto the layer being revealed, a specular
 * highlight along the curl of the lifted edge, a feathered band that dissolves
 * the hard boundary, and a seam line following the same Bézier.
 *
 * All of it is `pointer-events-none` and `aria-hidden`; it is decoration over
 * a live sidebar and must never intercept a click meant for the nav beneath.
 *
 * The design package's floating "GENIE PEEL UP ↑" debug badge is gone — it was
 * a development readout, not part of the effect.
 */
export function PeelEdge({ yLeft, cp1Y, cp2Y, yRight, isDarkOnTop = true }: PeelEdgeProps) {
  // Ids must be unique per instance: two sidebars render during a theme
  // change, and duplicate gradient ids resolve to whichever parsed last.
  const uid = useId().replace(/:/g, '');

  const minY = Math.min(yLeft, cp1Y, cp2Y, yRight);
  const maxY = Math.max(yLeft, cp1Y, cp2Y, yRight);
  // Fully off-screen in either direction: nothing to draw.
  if (maxY < -15 || minY > 115) return null;

  const shadowSpread = 4.2;
  const curlSpread = 2.4;

  const main = `M 0 ${yLeft} C 35 ${cp1Y}, 70 ${cp2Y}, 100 ${yRight}`;
  const shadow = `${main} L 100 ${yRight + shadowSpread} C 70 ${cp2Y + shadowSpread}, 35 ${cp1Y + shadowSpread}, 0 ${yLeft + shadowSpread} Z`;
  const curl = `M 0 ${yLeft - curlSpread} C 35 ${cp1Y - curlSpread}, 70 ${cp2Y - curlSpread}, 100 ${yRight - curlSpread} L 100 ${yRight} C 70 ${cp2Y}, 35 ${cp1Y}, 0 ${yLeft} Z`;
  const feather = `M 0 ${yLeft - 1.8} C 35 ${cp1Y - 1.8}, 70 ${cp2Y - 1.8}, 100 ${yRight - 1.8} L 100 ${yRight + 2.2} C 70 ${cp2Y + 2.2}, 35 ${cp1Y + 2.2}, 0 ${yLeft + 2.2} Z`;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40 overflow-hidden rounded-[34px]"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`peel-shadow-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000" stopOpacity={isDarkOnTop ? 0.65 : 0.45} />
            <stop offset="40%" stopColor="#000" stopOpacity={isDarkOnTop ? 0.32 : 0.2} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </linearGradient>

          <linearGradient id={`peel-curl-${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFF" stopOpacity={isDarkOnTop ? 0.45 : 0.72} />
            <stop offset="50%" stopColor="#FFF" stopOpacity={isDarkOnTop ? 0.18 : 0.3} />
            <stop offset="100%" stopColor="#FFF" stopOpacity={0} />
          </linearGradient>

          <linearGradient id={`peel-fade-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF" stopOpacity={0.28} />
            <stop offset="50%" stopColor="#8AC637" stopOpacity={0.38} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.22} />
          </linearGradient>

          <linearGradient id={`peel-seam-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF" stopOpacity={0.7} />
            <stop offset="35%" stopColor="#FFF" stopOpacity={0.95} />
            <stop offset="65%" stopColor="#B8E65B" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#FFF" stopOpacity={0.75} />
          </linearGradient>

          <filter id={`peel-drop-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.6" stdDeviation="2" floodColor="#000" floodOpacity="0.55" />
          </filter>

          <filter id={`peel-feather-${uid}`} x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>

        {/* Cast shadow falling onto the layer being revealed. */}
        <path d={shadow} fill={`url(#peel-shadow-${uid})`} />
        {/* Specular highlight on the curling underside of the lifted sheet. */}
        <path d={curl} fill={`url(#peel-curl-${uid})`} />
        {/* Feathered band so the boundary is never a hard digital cut. */}
        <path d={feather} fill={`url(#peel-fade-${uid})`} filter={`url(#peel-feather-${uid})`} />
        {/* Dark under-seam, offset a hair, for depth. */}
        <path
          d={main}
          stroke={isDarkOnTop ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)'}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          transform="translate(0, 0.4)"
        />
        {/* The lit seam itself. */}
        <path
          d={main}
          stroke={`url(#peel-seam-${uid})`}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          filter={`url(#peel-drop-${uid})`}
        />
        {/* The lifted corner tab, only while it is actually on the panel. */}
        {yRight > 6 && yRight < 94 && (
          <g transform={`translate(100, ${yRight})`}>
            <polygon
              points="0,0 -16,-6 -6,-16"
              fill={isDarkOnTop ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)'}
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="0.9"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export default PeelEdge;
