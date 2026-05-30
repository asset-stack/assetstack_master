import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout-matching skeleton to reduce perceived wait. Prefer over bare spinners.
 * <PageSkeleton variant="cards" />  |  "table"  |  "list"
 */
export default function PageSkeleton({ variant = "cards", rows = 6, className = "" }) {
  if (variant === "table") {
    return (
      <div className={`space-y-2 ${className}`} aria-busy="true" aria-label="Loading">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // cards
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-8 w-3/4 rounded" />
          <Skeleton className="h-3 w-full rounded" />
        </div>
      ))}
    </div>
  );
}