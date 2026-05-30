import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Unified empty state. Use whenever a list/query returns no results.
 * <EmptyState icon={FileX} title="No reports yet" description="..." actionLabel="Add" onAction={fn} />
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}