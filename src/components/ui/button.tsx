import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn-sheen inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "btn-metal btn-metal-live",
        destructive: "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg",
        /* These two named a light border and a light fill but never a text
           colour, so the label fell back to `foreground` — dark ink. That was
           survivable while the inner pages had a light ground; now that every
           screen sits on the photograph it was dark text on a dark panel.
           Both state their own colour now, and the outline carries a real
           border and a shadow so it reads as a control rather than as a
           rectangle drawn on the landscape. */
        outline:
          "border border-white/35 bg-white/[0.14] text-white shadow-[0_1px_0_hsl(0_0%_100%_/_0.12)_inset,0_6px_18px_-8px_hsl(160_40%_3%_/_0.7)] backdrop-blur-xl hover:border-white/55 hover:bg-white/[0.24] hover:text-white",
        secondary:
          "btn-metal",
        ghost: "text-white/85 hover:bg-white/[0.12] hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
