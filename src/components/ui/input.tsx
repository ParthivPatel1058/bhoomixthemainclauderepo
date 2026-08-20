import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // `bg-background/70` had lost its prefix and was sitting here as a
          // bare "/70", so the element had no background class at all: the
          // browser's default white input showed through and near-white
          // foreground text became unreadable on it in dark mode.
          "flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-base text-foreground ring-offset-background backdrop-blur-sm transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
