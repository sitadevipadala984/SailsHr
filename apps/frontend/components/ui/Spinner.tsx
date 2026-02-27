import { forwardRef } from "react";

export type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.ComponentPropsWithoutRef<"div">;

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]"
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={`inline-block animate-spin rounded-full border-accent border-t-transparent ${sizeClasses[size]} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Spinner.displayName = "Spinner";
