import React from 'react';
import { Sparkles, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const severityColors = {
  minor: 'bg-blue-100 text-blue-700 border-blue-200',
  moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  major: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

export default function VerifyAIPanel({ report }) {
  const confidence = Math.round(report.ai_confidence || 0);
  const created = report.created_date ? formatDistanceToNow(new Date(report.created_date), { addSuffix: true }) : '';

  return (
    <div className="space-y-3">
      {/* AI Suggestion banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> AI Finding
          </div>
          <div className="flex items-center gap-1.5">
            <div className="text-[11px] font-semibold text-slate-600">{confidence}% confident</div>
            <div className="w-12 h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full ${confidence > 75 ? 'bg-emerald-500' : confidence > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="outline" className="capitalize bg-white">
            {report.anomaly_type?.replace(/_/g, ' ')}
          </Badge>
          <Badge className={severityColors[report.severity] || severityColors.minor}>
            {report.severity}
          </Badge>
          {report.condition_score != null && (
            <Badge variant="outline" className="bg-white">
              Grade C{report.condition_score}
            </Badge>
          )}
        </div>

        {report.ai_description && (
          <p className="text-sm text-slate-800 leading-relaxed">{report.ai_description}</p>
        )}
      </div>

      {/* Context */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-0.5">Asset</div>
          <div className="font-semibold text-slate-800 truncate">
            {report.equipment_name || <span className="text-amber-600">Unassigned</span>}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-0.5">Detected</div>
          <div className="font-semibold text-slate-800 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {created || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}