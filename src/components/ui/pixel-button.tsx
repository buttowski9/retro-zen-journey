import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pixelButtonVariants = cva(
  "btn-pixel inline-flex items-center justify-center gap-2 whitespace-nowrap text-pixel font-pixel disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        hero: "bg-gradient-to-r from-pixel-primary to-pixel-accent text-background border-pixel-primary shadow-glow",
        secondary: "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
        destructive: "bg-pixel-error text-foreground border-pixel-error hover:bg-pixel-error/90",
        outline: "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        quest: "bg-pixel-accent text-background border-pixel-accent hover:bg-pixel-accent/90 animate-pulse-glow",
        xp: "bg-gradient-to-r from-pixel-xp to-pixel-accent text-background border-pixel-xp",
        warning: "bg-pixel-warning text-background border-pixel-warning hover:bg-pixel-warning/90",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-pixel-sm",
        lg: "h-14 px-8 py-4 text-pixel-lg",
        xl: "h-16 px-10 py-5 text-pixel-xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pixelButtonVariants> {
  asChild?: boolean;
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(pixelButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
PixelButton.displayName = "PixelButton";

export { PixelButton, pixelButtonVariants };