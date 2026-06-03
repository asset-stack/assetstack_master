import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, RotateCcw, Loader2, CalendarClock } from 'lucide-react';
import { PriorityBadge, VerifyBadge } from './DefectStatusBadge';

export default function DefectTable({ defects, savingId, onVerify, onSchedule }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="text-left font-semibold px-3 py-2.5">Defect ID</th>
              <th className="text-left font-semibold px-3 py-2.5">Room</th>
              <th className="text-left font-semibold px-3 py-2.5 min-w-[280px]">Description</th>
              <th className="text-left font-semibold px-3 py-2.5 min-w-[220px]">Rectification</th>
              <th className="text-left font-semibold px-3 py-2.5">Origin</th>
              <th className="text-left font-semibold px-3 py-2.5">Priority</th>
              <th className="text-right font-semibold px-3 py-2.5">LoS</th>
              <th className="text-right font-semibold px-3 py-2.5">Crit.</th>
              <th className="text-left font-semibold px-3 py-2.5">Program</th>
              <th className="text-right font-semibold px-3 py-2.5">Year</th>
              <th className="text-right font-semibold px-3 py-2.5">Cost</th>
              <th className="text-left font-semibold px-3 py-2.5">Status</th>
              <th className="text-left font-semibold px-3 py-2.5">Capital Plan</th>
              <th className="text-right font-semibold px-3 py-2.5">Verify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {defects.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/60 align-top">
                <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{d.defect_id}</td>
                <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{d.room_name || d.room_code}</td>
                <td className="px-3 py-2.5 text-slate-700 leading-relaxed">{d.description}</td>
                <td className="px-3 py-2.5 text-slate-500 leading-relaxed">{d.rectification || '—'}</td>
                <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{d.origin || '—'}</td>
                <td className="px-3 py-2.5"><PriorityBadge priority={d.priority} /></td>
                <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{d.level_of_service ?? '—'}</td>
                <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{d.criticality_index ?? '—'}</td>
                <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{d.program || '—'}</td>
                <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{d.year ?? '—'}</td>
                <td className="px-3 py-2.5 text-right text-slate-700 tabular-nums whitespace-nowrap">
                  {d.factored_cost != null ? `$${Math.round(d.factored_cost).toLocaleString()}` : '—'}
                </td>
                <td className="px-3 py-2.5"><VerifyBadge status={d.verify_status} /></td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {d.linked_capital_plan_item_id ? (
                    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px]">
                      <CalendarClock className="w-3 h-3 mr-1" /> FY{d.scheduled_year}
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => onSchedule?.(d)}>
                      <CalendarClock className="w-3 h-3 mr-1" /> Schedule
                    </Button>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    {savingId === d.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : d.verify_status === 'pending' || !d.verify_status ? (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => onVerify(d, 'verified')} aria-label="Verify">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:bg-rose-50" onClick={() => onVerify(d, 'rejected')} aria-label="Reject">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:bg-slate-100" onClick={() => onVerify(d, 'pending')} aria-label="Reset">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}