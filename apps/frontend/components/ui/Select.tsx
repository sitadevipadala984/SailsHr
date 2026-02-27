import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectProps = {
  className?: string;
  error?: boolean;
  children: React.ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

const base =
  "w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:pointer-events-none";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, ...props }, ref) => {
    const errorClasses = error ? "border-error focus:border-error focus:ring-error/20" : "border-border";

    return (
      <select
        ref={ref}
        className={`${base} ${errorClasses} ${className}`.trim()}
        aria-invalid={error ?? undefined}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
