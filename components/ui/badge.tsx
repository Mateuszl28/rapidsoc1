import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground border-border/70",
        critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/40",
        high:     "bg-severity-high/15     text-severity-high     border-severity-high/40",
        medium:   "bg-severity-medium/15   text-severity-medium   border-severity-medium/40",
        low:      "bg-severity-low/15      text-severity-low      border-severity-low/40",
        info:     "bg-severity-info/15     text-severity-info     border-severity-info/40",
        success:  "bg-neon-green/15        text-neon-green        border-neon-green/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
