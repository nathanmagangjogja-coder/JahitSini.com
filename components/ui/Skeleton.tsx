import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-gray-100/80", className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border bg-white shadow-soft p-6 space-y-4",
        className
      )}
    >
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLine({
  width,
  className,
  ...props
}: {
  width?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-4", className)}
      style={width ? { width } : undefined}
      {...props}
    />
  );
}
