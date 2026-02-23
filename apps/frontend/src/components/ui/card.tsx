import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <section className={`rounded-md border border-gray-200 bg-white p-6 shadow-sm ${className}`.trim()}>{children}</section>;
}
