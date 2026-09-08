import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  /** Width in px for text mode; height is fixed at 46. */
  width?: number;
}

/**
 * WebGL liquid-metal button. Each instance mounts its own shader canvas, and
 * browsers cap live WebGL contexts (~16), so reserve this for a handful of
 * hero/primary CTAs. Repeated buttons in grids use the CSS `.btn-metal`
 * finish instead, which looks the same without a GL context.
 */
export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  width,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  // The shader library ships no types. Rather than `any`, describe the two
  // methods this file actually calls — a wrong name is then a compile error
  // instead of a runtime one.
  /* Typed against the library's own class rather than `any`. That change is
     what surfaced the leak below: the cleanup used to call `destroy?.()`,
     which does not exist on ShaderMount — the optional call swallowed it, so
     the WebGL context was never released and every mount/unmount of this
     button burned one. The method is `dispose()`. */
  const shaderMount = useRef<ShaderMount | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const dimensions = useMemo(() => {
    if (viewMode === "icon") {
      return { width: 46, height: 46, innerWidth: 42, innerHeight: 42 };
    }
    const w = width ?? 172;
    return { width: w, height: 46, innerWidth: w - 4, innerHeight: 42 };
  }, [viewMode, width]);

  useEffect(() => {
    const styleId = "liquid-metal-canvas-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .liquid-metal-shader canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes lm-ripple {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    try {
      if (shaderRef.current) {
        shaderMount.current?.dispose();
        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          0.6,
        );
      }
    } catch (error) {
      console.error("Failed to mount liquid metal shader:", error);
    }

    return () => {
      shaderMount.current?.dispose();
      shaderMount.current = null;
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    shaderMount.current?.setSpeed?.(2.4);
    setTimeout(() => shaderMount.current?.setSpeed?.(isHovered ? 1 : 0.6), 300);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ };
      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 600);
    }
    onClick?.();
  };

  const springy = "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";

  return (
    <div className="relative inline-block">
      <div style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "relative",
            width: dimensions.width,
            height: dimensions.height,
            transformStyle: "preserve-3d",
            transition: springy,
          }}
        >
          {/* Label */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {viewMode === "icon" ? (
              <Sparkles
                size={16}
                style={{ color: "#4a4032", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
              />
            ) : (
              <span
                style={{
                  fontSize: 14,
                  color: "#3b3227",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(255,255,255,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            )}
          </div>

          {/* Inner plate */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : ""}`,
              zIndex: 20,
              transition: springy,
            }}
          >
            <div
              style={{
                width: dimensions.innerWidth,
                height: dimensions.innerHeight,
                margin: 2,
                borderRadius: 100,
                background: "linear-gradient(180deg, #f6f1e6 0%, #e0d3ba 100%)",
                boxShadow: isPressed ? "inset 0 2px 4px rgba(90,74,50,0.4)" : "none",
                transition: springy,
              }}
            />
          </div>

          {/* Shader */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : ""}`,
              zIndex: 10,
              transition: springy,
            }}
          >
            <div
              style={{
                height: dimensions.height,
                width: dimensions.width,
                borderRadius: 100,
                boxShadow: isPressed
                  ? "0 0 0 1px rgba(90,74,50,0.35), 0 1px 2px rgba(0,0,0,0.3)"
                  : isHovered
                    ? "0 0 0 1px rgba(90,74,50,0.3), 0 12px 26px rgba(40,32,20,0.28)"
                    : "0 0 0 1px rgba(90,74,50,0.25), 0 8px 20px rgba(40,32,20,0.22)",
                transition: springy,
              }}
            >
              <div
                ref={shaderRef}
                className="liquid-metal-shader"
                style={{
                  borderRadius: 100,
                  overflow: "hidden",
                  position: "relative",
                  width: dimensions.width,
                  height: dimensions.height,
                }}
              />
            </div>
          </div>

          {/* Hit area */}
          <button
            ref={buttonRef}
            onClick={handleClick}
            onMouseEnter={() => {
              setIsHovered(true);
              shaderMount.current?.setSpeed?.(1);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsPressed(false);
              shaderMount.current?.setSpeed?.(0.6);
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            aria-label={label}
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              outline: "none",
              zIndex: 40,
              transform: "translateZ(25px)",
              overflow: "hidden",
              borderRadius: 100,
            }}
          >
            {ripples.map((r) => (
              <span
                key={r.id}
                style={{
                  position: "absolute",
                  left: r.x,
                  top: r.y,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
                  pointerEvents: "none",
                  animation: "lm-ripple 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}
