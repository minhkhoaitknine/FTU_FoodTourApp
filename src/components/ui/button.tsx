import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-app px-4 text-sm font-semibold transition-colors duration-fast ease-app focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20 disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-brand text-content-inverse hover:bg-brand-strong",
        secondary: "bg-success text-content-inverse hover:bg-success/90",
        outline:
          "border border-line-strong bg-surface-elevated text-content hover:border-brand hover:text-brand-strong",
        ghost: "bg-transparent text-content hover:bg-surface-muted",
        danger: "bg-danger text-content-inverse hover:bg-danger/90"
      },
      size: {
        sm: "min-h-9 px-3 text-xs",
        md: "min-h-11 px-4 text-sm",
        lg: "min-h-12 px-5 text-base",
        icon: "size-11 min-h-11 px-0"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    loadingLabel?: string;
  };

export function Button({
  children,
  className,
  disabled,
  fullWidth,
  isLoading = false,
  loadingLabel,
  size,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ fullWidth, size, variant }), className)}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {isLoading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
