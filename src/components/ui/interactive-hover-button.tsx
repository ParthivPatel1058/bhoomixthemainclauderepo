import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  /** solid = opaque light pill, glass = frosted pill for photo backdrops. */
  variant?: "glass" | "solid";
  /** Optional leading icon, shown at rest. */
  icon?: React.ReactNode;
}

/**
 * Interactive hover button. At rest it is a clean pill; on hover the label
 * slides out to the right while a fill expands from the left to cover the
 * pill, revealing the label again with a trailing arrow.
 *
 * The expanding fill starts at scale-0 so nothing is visible at rest — a
 * statically visible dot would otherwise sit on top of the label.
 */
const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, variant = "glass", icon, ...props }, ref) => {
  const solid = variant === "solid";

  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-full border px-7 py-3.5 text-center text-[13px] font-semibold tracking-wide transition-colors duration-300",
        solid
          ? "border-white/25 bg-white text-foreground"
          : "border-white/30 bg-white/10 text-white backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {/* Expanding fill — hidden at rest */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-1/2 z-0 h-8 w-8 -translate-y-1/2 scale-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[6]",
          solid ? "bg-neutral-900" : "bg-white",
        )}
      />

      {/* Resting label */}
      <span className="relative z-10 flex items-center justify-center gap-2 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 group-hover:translate-x-8 group-hover:opacity-0">
        {icon}
        {text}
      </span>

      {/* Hover label */}
      <span
        className={cn(
          "absolute inset-0 z-10 flex -translate-x-8 items-center justify-center gap-2 opacity-0 transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 group-hover:translate-x-0 group-hover:opacity-100",
          solid ? "text-white" : "text-foreground",
        )}
      >
        {text}
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
