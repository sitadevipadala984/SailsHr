import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90",
  secondary: "rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-muted"
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
