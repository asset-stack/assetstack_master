import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  deriveCondition, deriveLifeConsumed, deriveCRC, deriveDefectUrgency, fmtMoney,
} from '@/lib/assetMetrics';

const GRADE_COLOR = {
  1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  2: 'bg-lime-50 text-lime-700 border-lime-200',
  3: 'bg-amber-50 text-amber-700 border-amber-200',
  4: 'bg-orange-50 text-orange-700 border-orange-200',
  5: 'bg-rose-50 text-rose-700 border-rose-200',
};

const URGENCY_COLOR = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  High: 'bg-rose-100 text-rose-700 border-rose-200',
};

// Compact set of register-grade badges shown on cards/rows.
export default function AssetMetricsBadges({ equipment, compact = false }) {
  const grade = deriveCondition(equipment);
  const lc = deriveLifeConsumed(equipment);
  const crc = deriveCRC(equipment);
  const urgency = deriveDefectUrgency(equipment);

  return (
    <div className="flex items-center flex-wrap gap-1">
      {grade != null && (
        <Badge variant="outline" className={`text-[10px] font-semibold px-1.5 py-0 h-[18px] ${GRADE_COLOR[grade]}`}>
          C{grade}
        </Badge>
      )}
      {lc != null && (
        <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0 h-[18px] bg-slate-50 text-slate-700 border-slate-200 tabular-nums">
          {Math.round((1 - lc) * 100)}% life
        </Badge>
      )}
      {!compact && crc > 0 && (
        <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0 h-[18px] bg-indigo-50 text-indigo-700 border-indigo-200 tabular-nums">
          {fmtMoney(crc)}
        </Badge>
      )}
      {urgency && URGENCY_COLOR[urgency] && (
        <Badge variant="outline" className={`text-[10px] font-semibold px-1.5 py-0 h-[18px] ${URGENCY_COLOR[urgency]}`}>
          {urgency} defect
        </Badge>
      )}
    </div>
  );
}