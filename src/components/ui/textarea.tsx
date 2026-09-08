import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Same dropped `bg-background/` prefix as input.tsx — left with no
        // background class, the browser default white showed through.
        "flex min-h-[80px] w-full rounded-2xl border border-input bg-background/70 px-4 py-3 text-sm text-foreground ring-offset-background backdrop-blur-sm transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 placeholder:text-muted-foreground hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
