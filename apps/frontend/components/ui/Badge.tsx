import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-muted text-text-primary",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-amber-500/15 text-amber-700 border border-amber-500/30",
  error: "bg-error/10 text-error border border-error/30",
  info: "bg-blue-500/15 text-blue-600 border border-blue-500/30"
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = "default", className = "", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`.trim()}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
