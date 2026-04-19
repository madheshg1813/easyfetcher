import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/15 text-destructive",
        outline: "border border-border text-foreground",
        amber: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
        purple: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
        green: "bg-green-500/15 text-green-600 dark:text-green-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
