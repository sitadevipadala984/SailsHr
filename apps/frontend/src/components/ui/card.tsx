import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <section className={`rounded-xl border border-border bg-surface p-6 shadow-sm ${className}`.trim()}>{children}</section>;
}
