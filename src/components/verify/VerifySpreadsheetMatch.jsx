import React from 'react';
import { FileSpreadsheet, MapPin, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusLabel = {
  confirmed: { text: 'Matched to spreadsheet', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ai_only: { text: 'AI only — no spreadsheet match', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  sheet_only: { text: 'From spreadsheet — no scan photo', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export default function VerifySpreadsheetMatch({ report }) {
  const row = report.sheet_row || {};
  const status = report.reconciliation_status;
  const hasData = report.reconciliation_status && report.reconciliation_status !== 'unreconciled';

  if (!hasData) return null;

  const badge = statusLabel[status];

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200/60">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
          <FileSpreadsheet className="w-3.5 h-3.5" /> Inspector Spreadsheet
        </div>
        {badge && (
          <Badge className={`${badge.cls} text-[10px]`}>{badge.text}</Badge>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-2 text-xs">
        {row.defect_id && (
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Hash className="w-3 h-3 text-slate-400" /> {row.defect_id}
          </span>
        )}
        {(report.room_code || report.room_name || row.room_name) && (
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400" />
            {report.room_name || row.room_name || report.room_code}
          </span>
        )}
        {report.sheet_grade != null && (
          <Badge variant="outline" className="bg-white text-[10px]">
            Grade C{report.sheet_grade}
          </Badge>
        )}
      </div>

      {(row.notes || row.description) && (
        <p className="text-sm text-slate-800 leading-relaxed">{row.notes || row.description}</p>
      )}
    </div>
  );
}