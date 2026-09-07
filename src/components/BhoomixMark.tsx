/**
 * The bhoomix mark.
 *
 * A rosette of overlapping rings turning around a still centre point. Drawn as
 * thin strokes rather than a filled plate so it can sit over imagery without
 * punching a hole in the texture beneath it, and stroke-based rather than a
 * font glyph so it stays crisp at any size and never waits on a webfont.
 *
 * Strokes use `currentColor`, so the caller sets the colour with a text class —
 * white over a photograph, brand green inside a light badge.
 */
export default function BhoomixMark({
  size = 84,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // Twelve rings stepped around a small orbit make the interference pattern.
  const petals = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.92">
        {petals.map((deg) => (
          <circle
            key={deg}
            cx="50"
            cy="50"
            r="21"
            transform={`rotate(${deg} 50 50) translate(0 -11)`}
          />
        ))}
      </g>

      {/* Centre dot, the still point the rosette turns around. */}
      <circle cx="50" cy="50" r="2.4" fill="currentColor" />
    </svg>
  );
}
