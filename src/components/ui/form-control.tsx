import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const controlVariants = cva(
  "min-h-11 w-full rounded-app border bg-surface-elevated px-3 text-sm text-content shadow-sm outline-none transition duration-fast ease-app placeholder:text-content-subtle hover:border-line-strong focus:border-success focus:ring-4 focus:ring-success/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-subtle",
  {
    variants: {
      state: {
        default: "border-line",
        error: "border-danger focus:border-danger focus:ring-danger/15",
        success: "border-success focus:border-success focus:ring-success/15"
      }
    },
    defaultVariants: {
      state: "default"
    }
  }
);

type ControlState = VariantProps<typeof controlVariants>;

export type InputProps = InputHTMLAttributes<HTMLInputElement> & ControlState;

export function Input({ className, state, ...props }: InputProps) {
  return (
    <input
      aria-invalid={state === "error" || undefined}
      className={cn(controlVariants({ state }), className)}
      {...props}
    />
  );
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & ControlState;

export function Select({ children, className, state, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={state === "error" || undefined}
      className={cn(controlVariants({ state }), "pr-9", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & ControlState;

export function Textarea({ className, state, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={state === "error" || undefined}
      className={cn(controlVariants({ state }), "min-h-24 resize-y py-3", className)}
      {...props}
    />
  );
}
