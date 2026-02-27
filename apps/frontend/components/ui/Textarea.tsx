import { forwardRef, type TextareaHTMLAttributes } from "react";

export type TextareaProps = {
  className?: string;
  error?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const base =
  "w-full min-h-[100px] resize-y rounded-lg border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:pointer-events-none";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    const errorClasses = error ? "border-error focus:border-error focus:ring-error/20" : "border-border";

    return (
      <textarea
        ref={ref}
        className={`${base} ${errorClasses} ${className}`.trim()}
        aria-invalid={error ?? undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
