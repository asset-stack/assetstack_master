import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// SLA thresholds (in days) by severity
const SLA = {
  critical: 1,
  major: 3,
  moderate: 7,
  minor: 14,
};

function daysAgo(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default function PendingReviewSLA() {
  const { data: pending = [] } = useQuery({
    queryKey: ['allPendingReports'],
    queryFn: () => base44.entities.ConditionReport.filter({ review_status: 'pending' }, '-created_date', 200),
    refetchInterval: 60_000,
  });

  if (!pending.length) return null;

  const overdue = pending.filter((r) => {
    const age = daysAgo(r.created_date);
    const limit = SLA[r.severity] ?? 7;
    return age > limit;
  });

  const oldestCritical = pending
    .filter((r) => r.severity === 'critical')
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];

  if (!overdue.length && !oldestCritical) return null;

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-red-900 text-sm">Review SLA Breach</h3>
            <Badge className="bg-red-600 text-white border-0">{overdue.length} overdue</Badge>
          </div>
          <p className="text-xs text-red-800 mt-1">
            {overdue.length > 0 && `${overdue.length} pending finding${overdue.length > 1 ? 's' : ''} past review SLA. `}
            {oldestCritical && (
              <>Oldest critical is <span className="font-semibold">{daysAgo(oldestCritical.created_date)} day(s)</span> old.</>
            )}
          </p>
          <div className="grid grid-cols-4 gap-2 mt-3 text-[11px]">
            {Object.entries(SLA).map(([sev, days]) => {
              const count = overdue.filter((r) => r.severity === sev).length;
              return (
                <div key={sev} className={`rounded-md p-1.5 text-center ${count > 0 ? 'bg-red-100 text-red-800' : 'bg-white text-slate-500'}`}>
                  <div className="font-bold capitalize">{sev}</div>
                  <div>{count} / SLA {days}d</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}