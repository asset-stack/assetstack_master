import React from 'react';
import { Calendar, ExternalLink, FileText } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Button } from '@/components/ui/button';

const STATUS_COLOR = {
  compliant: 'bg-emerald-100 text-emerald-700',
  due_soon: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  in_progress: 'bg-blue-100 text-blue-700',
  exempt: 'bg-slate-100 text-slate-600',
};

function computeStatus(req) {
  if (req.compliance_status && req.compliance_status !== 'compliant') return req.compliance_status;
  if (!req.next_due_date) return req.compliance_status || 'compliant';
  const days = differenceInDays(parseISO(req.next_due_date), new Date());
  if (days < 0) return 'overdue';
  if (days <= (req.lead_time_days || 30)) return 'due_soon';
  return 'compliant';
}

export default function RequirementsTable({ requirements, onEdit }) {
  if (!requirements.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No compliance requirements yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          <tr>
            <th className="text-left px-4 py-2.5">Requirement</th>
            <th className="text-left px-3 py-2.5">Category</th>
            <th className="text-left px-3 py-2.5">Frequency</th>
            <th className="text-left px-3 py-2.5">Next due</th>
            <th className="text-left px-3 py-2.5">Status</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {requirements.map(r => {
            const status = computeStatus(r);
            const days = r.next_due_date ? differenceInDays(parseISO(r.next_due_date), new Date()) : null;
            return (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-slate-900">{r.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    {r.regulation && <span>{r.regulation}</span>}
                    {r.regulation_url && <ExternalLink className="w-2.5 h-2.5" />}
                  </div>
                </td>
                <td className="px-3 py-3 text-[12px] text-slate-600 capitalize">{r.category?.replace('_', ' ')}</td>
                <td className="px-3 py-3 text-[12px] text-slate-600 capitalize">{r.frequency?.replace('_', ' ')}</td>
                <td className="px-3 py-3 text-[12px] text-slate-700">
                  {r.next_due_date ? (
                    <div>
                      <div className="flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {format(parseISO(r.next_due_date), 'MMM d, yyyy')}
                      </div>
                      {days !== null && (
                        <div className={`text-[10px] mt-0.5 ${days < 0 ? 'text-rose-600' : days <= 30 ? 'text-amber-600' : 'text-slate-500'}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                        </div>
                      )}
                    </div>
                  ) : '—'}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${STATUS_COLOR[status] || STATUS_COLOR.compliant}`}>
                    {status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => onEdit?.(r)} className="h-7 text-[11px]">
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}