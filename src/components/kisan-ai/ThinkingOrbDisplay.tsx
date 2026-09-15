import React from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import type { OrbSize, OrbState } from 'thinking-orbs';

interface ThinkingOrbDisplayProps {
  state?: OrbState;
  /** The library ships two tuned sizes only; anything else is scaled. */
  size?: OrbSize;
  speed?: number;
  dark?: boolean;
  paused?: boolean;
  scale?: number;
  className?: string;
}

/**
 * Small activity orb used while an answer is being generated.
 *
 * `scale` exists because the library only ships 20px and 64px presets, and the
 * message row wants something between the two.
 */
export const ThinkingOrbDisplay: React.FC<ThinkingOrbDisplayProps> = ({
  state = 'working',
  size = 20,
  speed = 1,
  dark = true,
  paused = false,
  scale = 1,
  className = '',
}) => (
  <div
    className={`relative inline-flex items-center justify-center select-none ${className}`}
    style={scale !== 1 ? { width: size * scale, height: size * scale } : undefined}
    aria-hidden="true"
  >
    <div
      style={scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: 'center' } : undefined}
    >
      <ThinkingOrb
        state={state}
        size={size}
        theme={dark ? 'dark' : 'light'}
        speed={speed}
        paused={paused}
      />
    </div>
  </div>
);
