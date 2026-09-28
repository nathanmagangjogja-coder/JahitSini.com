import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "blue" | "outline";
}) {
  const variants = {
    default: "bg-brand-bg text-brand-text border border-brand-border",
    success: "bg-green-50 text-brand-green-dark border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    blue: "bg-blue-50 text-brand-blue border border-blue-200",
    outline: "bg-transparent text-brand-text border border-brand-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
