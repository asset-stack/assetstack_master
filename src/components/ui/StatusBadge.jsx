import React from "react";
import {
  CheckCircle2, AlertTriangle, AlertOctagon, XCircle, Clock,
  CircleDot, MinusCircle, ShieldAlert,
} from "lucide-react";

/**
 * Colour-blind-safe status badge (WCAG): never relies on colour alone —
 * every status carries a distinct icon AND a text label.
 *
 * Usage: <StatusBadge status="critical" />  or  <StatusBadge status="moderate" label="Moderate wear" />
 */
const STATUS_MAP = {
  // generic health / review
  excellent: { label: "Excellent", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  good: { label: "Good", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  operational: { label: "Operational", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  approved: { label: "Approved", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  active: { label: "Active", icon: CircleDot, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },

  pending: { label: "Pending", icon: Clock, cls: "bg-slate-50 text-slate-600 border-slate-200" },
  degraded: { label: "Degraded", icon: AlertTriangle, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  warning: { label: "Warning", icon: AlertTriangle, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  moderate: { label: "Moderate", icon: AlertTriangle, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  minor: { label: "Minor", icon: CircleDot, cls: "bg-slate-50 text-slate-600 border-slate-200" },

  major: { label: "Major", icon: AlertOctagon, cls: "bg-orange-50 text-orange-700 border-orange-200" },
  critical: { label: "Critical", icon: ShieldAlert, cls: "bg-rose-50 text-rose-700 border-rose-200" },
  emergency: { label: "Emergency", icon: AlertOctagon, cls: "bg-rose-50 text-rose-700 border-rose-200" },
  offline: { label: "Offline", icon: MinusCircle, cls: "bg-slate-100 text-slate-500 border-slate-200" },
  rejected: { label: "Rejected", icon: XCircle, cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const FALLBACK = { label: "Unknown", icon: CircleDot, cls: "bg-slate-50 text-slate-600 border-slate-200" };

export default function StatusBadge({ status, label, className = "", iconOnly = false }) {
  const key = String(status || "").toLowerCase();
  const cfg = STATUS_MAP[key] || FALLBACK;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls} ${className}`}
      role="status"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {!iconOnly && <span>{label || cfg.label}</span>}
    </span>
  );
}