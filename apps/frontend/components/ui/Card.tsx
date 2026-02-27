import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const base = "rounded-xl border border-border bg-surface shadow-sm";

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`${base} ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
