import React, { useEffect, useRef, useState } from 'react';
import { audioService } from './audioService';
import { VoiceStatus } from './types';

interface BigAudioReactiveOrbProps {
  size?: number; // CSS pixel dimensions (e.g. 320, 360)
  status?: VoiceStatus;
  isActive?: boolean;
  isAiSpeaking?: boolean;
  forcedIntensity?: number;
  className?: string;
  onTap?: () => void;
}

/**
 * 3D High-definition spherical dot-matrix waveform Orb matching the user's reference image 2.
 * Powered directly by the mathematical wave projection engine from Libraries.dev ('thinking-orbs' wave mode)
 * with real-time audio FFT frequency displacement and buttery-smooth color transition lighting.
 */
export const BigAudioReactiveOrb: React.FC<BigAudioReactiveOrbProps> = ({
  size = 340,
  status = 'listening',
  isActive = true,
  isAiSpeaking = false,
  forcedIntensity,
  className = '',
  onTap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentIntensity, setCurrentIntensity] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let clock = 0;
    let smoothedIntensity = 0;
    const smoothedBands = new Array(16).fill(0);

    // Camera projection helper from Libraries.dev thinking-orbs engine
    const project3D = (yaw: number, pitch: number, cx: number, cy: number, scale: number) => {
      const sinPitch = Math.sin(pitch);
      const cosPitch = Math.cos(pitch);
      const sinYaw = Math.sin(yaw);
      const cosYaw = Math.cos(yaw);

      return (x: number, y: number, z: number): [number, number, number] => {
        // Rotate around yaw (Y-axis)
        const xYaw = x * cosYaw + z * sinYaw;
        const zYaw = -x * sinYaw + z * cosYaw;

        // Rotate around pitch (X-axis)
        const yPitch = y * cosPitch - zYaw * sinPitch;
        const zPitch = y * sinPitch + zYaw * cosPitch;

        // Project onto canvas plane
        return [cx + xYaw * scale, cy - yPitch * scale, zPitch];
      };
    };

    const render = () => {
      // 1. Fetch real-time audio analysis
      const audioData = audioService.getAudioFrequencyData();
      const rawIntensity =
        forcedIntensity !== undefined
          ? forcedIntensity
          : isAiSpeaking
          ? Math.max(audioData.intensity, 0.42)
          : status === 'listening'
          ? audioData.intensity
          : 0.05;

      // Silky audio envelope smoothing
      smoothedIntensity += (rawIntensity - smoothedIntensity) * 0.16;
      setCurrentIntensity(smoothedIntensity);

      for (let i = 0; i < 16; i++) {
        const target = audioData.frequencies[i] || 0;
        smoothedBands[i] += (target - smoothedBands[i]) * 0.2;
      }

      // 2. Increment animation clock with audio acceleration
      const clockSpeed = 1 + smoothedIntensity * 1.8;
      clock += 0.024 * clockSpeed;

      // 4. Canvas high-DPI sizing
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const renderSize = size;
      if (canvas.width !== renderSize * dpr || canvas.height !== renderSize * dpr) {
        canvas.width = renderSize * dpr;
        canvas.height = renderSize * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, renderSize, renderSize);

      const cx = renderSize / 2;
      const cy = renderSize / 2;
      const baseRadius = renderSize * 0.41;

      // 5. Clean 3D Wave Mathematics from Libraries.dev 'thinking-orbs' (no background lighting)
      // Camera: pitch = 0.38 rad (downward tilt matching Image 2), yaw = clock * 0.18 rad
      const yawAngle = clock * 0.18;
      const pitchAngle = 0.38;
      const project = project3D(yawAngle, pitchAngle, cx, cy, 1);

      const numRings = 17; // hand-tuned latitude rings
      const lonDensity = 46; // dots along the equator
      const dots: Array<{
        x: number;
        y: number;
        z: number;
        radius: number;
        white: number;
        alpha: number;
      }> = [];

      // Scale factor relative to 300px engine reference
      const rsScale = Math.pow(renderSize / 300, 0.6);

      for (let p = 0; p <= numRings; p++) {
        // Latitude from -PI/2 (south) to +PI/2 (north)
        const lat = -Math.PI / 2 + (p / numRings) * Math.PI;
        const cosLat = Math.cos(lat);
        const sinLat = Math.sin(lat);

        // Exact dual sinusoidal harmonic wave from Libraries.dev
        const waveBase =
          0.62 * Math.sin(clock * 2.1 - p * 0.52) +
          0.38 * Math.sin(clock * 1.27 + p * 0.83);

        // Audio resonance: frequency band resonance displaces rings during speech
        const bandIdx = Math.min(15, Math.floor((p / numRings) * 16));
        const bandResonance = smoothedBands[bandIdx] || smoothedIntensity;
        const audioWave = waveBase * (1 + bandResonance * 1.2);

        // Spherical undulation radius
        const undulationRadius = baseRadius * (0.88 + 0.105 * audioWave);
        const numDots = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity));

        for (let y = 0; y < numDots; y++) {
          const lon = (y / numDots) * 2 * Math.PI;

          // 3D coordinates on the modulated sphere
          const x3d = cosLat * Math.cos(lon) * undulationRadius;
          const y3d = sinLat * undulationRadius;
          const z3d = cosLat * Math.sin(lon) * undulationRadius;

          const [projX, projY, projZ] = project(x3d, y3d, z3d);

          // Front-to-back depth normalization (g in Libraries.dev)
          const depthNorm = (projZ / baseRadius + 1) / 2;
          const waveCrest = Math.max(0, audioWave);

          // Dot size tuned according to Libraries.dev wave engine
          // r = (rBase + rDepth * g) * (1 + 0.4 * d) * M
          const dotRadius =
            (0.68 + 1.82 * depthNorm) * (1 + 0.35 * waveCrest) * rsScale;

          // White level in Libraries.dev: white = 0.66 - 0.56 * g - 0.1 * d
          // In dark mode: color = (1 - white) * 255 (front dots = 230-255 bright platinum, back dots = 90-110)
          const whiteCalc = 0.66 - 0.56 * depthNorm - 0.1 * waveCrest;
          const clampedWhite = Math.min(1, Math.max(0, whiteCalc));

          // Alpha curve for realistic optical depth
          const alpha = 0.22 + 0.78 * Math.pow(depthNorm, 1.2);

          dots.push({
            x: projX,
            y: projY,
            z: projZ,
            radius: Math.max(0.4, dotRadius),
            white: clampedWhite,
            alpha,
          });
        }
      }

      // 6. Sort dots back-to-front (Z-sorting) for clean depth occlusion
      dots.sort((a, b) => a.z - b.z);

      // 7. Render dots with pure platinum/monochrome gradient matching Image 2
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        // Front dots are bright diamond white (255), back dots are soft charcoal platinum
        const lum = Math.round((1 - dot.white) * 255);

        ctx.fillStyle = `rgba(${lum}, ${lum}, ${lum}, ${dot.alpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, status, isAiSpeaking, forcedIntensity]);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      onClick={onTap}
    >
      <canvas
        ref={canvasRef}
        className="block cursor-pointer transition-transform duration-300"
        style={{ width: size, height: size }}
      />
    </div>
  );
};
