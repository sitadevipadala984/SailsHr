import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = {
  className?: string;
  error?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const base =
  "w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:pointer-events-none";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    const errorClasses = error ? "border-error focus:border-error focus:ring-error/20" : "border-border";

    return (
      <input
        ref={ref}
        className={`${base} ${errorClasses} ${className}`.trim()}
        aria-invalid={error ?? undefined}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
