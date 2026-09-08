import React from 'react';

export interface PeelingEdgeOverlayProps {
  yLeft: number; // percentage on left edge (x = 0)
  cp1Y: number; // percentage at control point 1 (x = 35)
  cp2Y: number; // percentage at control point 2 (x = 70)
  yRight: number; // percentage on right edge (x = 100)
  isDarkOnTop?: boolean;
  direction?: 'to-light' | 'to-dark';
  className?: string;
}

/**
 * PeelingEdgeOverlay renders a fluid macOS Genie-style curved 3D physical crease
 * and specular wave along the exact cubic Bezier boundary between the two skins.
 *
 * Features:
 * - Fluid Cubic Bezier curve matching the Genie warp deformation
 * - Ambient liquid drop-shadow extending into the revealed layer
 * - Specular curled fold highlight along the lifted edge of the peeling skin
 * - Buttery feathered Gaussian blur edge filter (no harsh digital cuts)
 * - Direction badge ("PEELING UP (GENIE)" / "UNPEELING DOWN (GENIE)")
 */
export const PeelingEdgeOverlay: React.FC<PeelingEdgeOverlayProps> = ({
  yLeft,
  cp1Y,
  cp2Y,
  yRight,
  isDarkOnTop = true,
  direction = 'to-light',
  className = '',
}) => {
  // If the peel is completely out of view (above top or below bottom), avoid rendering
  const minY = Math.min(yLeft, cp1Y, cp2Y, yRight);
  const maxY = Math.max(yLeft, cp1Y, cp2Y, yRight);
  if (maxY < -15 || minY > 115) {
    return null;
  }

  // Mid-point estimation for floating label positioning
  const midY = 0.125 * yLeft + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * yRight;
  const shadowSpread = 4.2; // % downward spread of the cast shadow
  const curlSpread = 2.4; // % upward spread of the curled fold highlight

  // Main Bezier curve command string
  const mainCurve = `M 0 ${yLeft} C 35 ${cp1Y}, 70 ${cp2Y}, 100 ${yRight}`;
  const shadowCurve = `M 0 ${yLeft} C 35 ${cp1Y}, 70 ${cp2Y}, 100 ${yRight} L 100 ${yRight + shadowSpread} C 70 ${cp2Y + shadowSpread}, 35 ${cp1Y + shadowSpread}, 0 ${yLeft + shadowSpread} Z`;
  const curlCurve = `M 0 ${yLeft - curlSpread} C 35 ${cp1Y - curlSpread}, 70 ${cp2Y - curlSpread}, 100 ${yRight - curlSpread} L 100 ${yRight} C 70 ${cp2Y}, 35 ${cp1Y}, 0 ${yLeft} Z`;
  const featherCurve = `M 0 ${yLeft - 1.8} C 35 ${cp1Y - 1.8}, 70 ${cp2Y - 1.8}, 100 ${yRight - 1.8} L 100 ${yRight + 2.2} C 70 ${cp2Y + 2.2}, 35 ${cp1Y + 2.2}, 0 ${yLeft + 2.2} Z`;

  return (
    <div
      className={`absolute inset-0 pointer-events-none rounded-[34px] overflow-hidden z-40 ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Cast Drop Shadow Gradient extending downward into the revealed skin */}
          <linearGradient id="peelCastShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={isDarkOnTop ? '#000000' : '#110F15'}
              stopOpacity={isDarkOnTop ? 0.65 : 0.45}
            />
            <stop
              offset="40%"
              stopColor={isDarkOnTop ? '#000000' : '#110F15'}
              stopOpacity={isDarkOnTop ? 0.32 : 0.2}
            />
            <stop
              offset="100%"
              stopColor={isDarkOnTop ? '#000000' : '#110F15'}
              stopOpacity={0}
            />
          </linearGradient>

          {/* Curled Foil Specular Highlight extending upward into the peeling skin */}
          <linearGradient id="peelCurledHighlightGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity={isDarkOnTop ? 0.45 : 0.72}
            />
            <stop
              offset="50%"
              stopColor="#FFFFFF"
              stopOpacity={isDarkOnTop ? 0.18 : 0.3}
            />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>

          {/* Soft Feather Fade Gradient along the curved Genie wave boundary */}
          <linearGradient id="peelSoftFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.28} />
            <stop offset="50%" stopColor="#8AC637" stopOpacity={0.38} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.22} />
          </linearGradient>

          {/* Seam Line Gradient */}
          <linearGradient id="peelSeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.7} />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity={0.95} />
            <stop offset="65%" stopColor="#B8E65B" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.75} />
          </linearGradient>

          {/* Drop shadow filter for seam */}
          <filter id="peelEdgeFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.6" stdDeviation="2.0" floodColor="#000000" floodOpacity="0.55" />
          </filter>

          {/* Soft Feather Blur Filter for the buttery Genie seam transition */}
          <filter id="peelSoftFeatherFilter" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="1.0" />
          </filter>
        </defs>

        {/* 1. Cast Drop Shadow: Fluid band extending downward from the cut line */}
        <path d={shadowCurve} fill="url(#peelCastShadowGrad)" />

        {/* 2. Curled Foil Highlight: Fluid band extending slightly upward from the cut line */}
        <path d={curlCurve} fill="url(#peelCurledHighlightGrad)" />

        {/* 3. Soft Feathered Gradient Fade Band (dissolves hard cut lines into buttery liquid) */}
        <path d={featherCurve} fill="url(#peelSoftFadeGrad)" filter="url(#peelSoftFeatherFilter)" />

        {/* 4. Soft Dark Under-Seam for depth */}
        <path
          d={mainCurve}
          stroke={isDarkOnTop ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)'}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          transform="translate(0, 0.4)"
        />

        {/* 5. Crisp Glowing Specular Seam along the Genie Bezier curve */}
        <path
          d={mainCurve}
          stroke="url(#peelSeamGrad)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          filter="url(#peelEdgeFilter)"
        />

        {/* 6. Tactile Corner Peel Tab indicator on the leading right edge */}
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

      {/* Floating Peel Badge indicator along the fluid curve */}
      {midY > 5 && midY < 95 && (
        <div
          className="absolute right-3 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/80 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-transform duration-75"
          style={{ top: `${midY}%` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#8AC637] animate-pulse" />
          <span>
            {direction === 'to-light' ? 'GENIE PEEL UP' : 'GENIE UNPEEL DOWN'}
          </span>
          <span className="text-[#8AC637] text-[10px] font-bold">
            {direction === 'to-light' ? '↑' : '↓'}
          </span>
        </div>
      )}
    </div>
  );
};
