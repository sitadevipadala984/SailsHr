import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./Spinner";

export type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white hover:opacity-90",
  secondary: "bg-muted text-text-primary hover:bg-border",
  danger: "bg-error text-white hover:opacity-90",
  ghost: "bg-transparent text-text-primary hover:bg-muted"
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = isLoading || disabled;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size === "lg" ? "md" : size === "sm" ? "sm" : "md"} className="shrink-0" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
