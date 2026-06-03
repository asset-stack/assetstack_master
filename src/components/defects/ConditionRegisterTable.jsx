import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { gradeBadgeClass, gradeLabel } from './conditionGrade';

function SortHeader({ label, field, sort, onSort, align = 'left' }) {
  const active = sort.field === field;
  const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className={`px-3 py-2.5 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 hover:text-slate-800 ${active ? 'text-slate-800' : ''}`}
      >
        {label}
        <Icon className="w-3 h-3 opacity-60" />
      </button>
    </th>
  );
}

export default function ConditionRegisterTable({ rows, sort, onSort }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
            <tr>
              <SortHeader label="Room" field="room_code" sort={sort} onSort={onSort} />
              <SortHeader label="Group" field="group" sort={sort} onSort={onSort} />
              <th className="text-left font-semibold px-3 py-2.5 min-w-[180px]">Component</th>
              <th className="text-left font-semibold px-3 py-2.5 min-w-[260px]">Condition Description</th>
              <SortHeader label="Grade" field="condition_grade_current" sort={sort} onSort={onSort} align="right" />
              <SortHeader label="Crit." field="criticality" sort={sort} onSort={onSort} align="right" />
              <SortHeader label="Qty" field="quantity" sort={sort} onSort={onSort} align="right" />
              <SortHeader label="Repl. Cost" field="base_replacement_cost" sort={sort} onSort={onSort} align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 align-top">
                <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap font-medium">{c.room_code}<span className="block text-[11px] text-slate-400 font-normal">{c.room_name}</span></td>
                <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{c.group || '—'}</td>
                <td className="px-3 py-2.5 text-slate-800">{c.component_type}{c.subtype ? <span className="block text-[11px] text-slate-400">{c.subtype}</span> : null}</td>
                <td className="px-3 py-2.5 text-slate-600 leading-relaxed">{c.notes || '—'}</td>
                <td className="px-3 py-2.5 text-right">
                  {c.condition_grade_current != null ? (
                    <Badge className={`${gradeBadgeClass(c.condition_grade_current)} text-[11px]`}>
                      {Math.round(c.condition_grade_current)} · {gradeLabel(c.condition_grade_current)}
                    </Badge>
                  ) : '—'}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{c.criticality ?? '—'}</td>
                <td className="px-3 py-2.5 text-right text-slate-600 tabular-nums">{c.quantity ?? '—'} <span className="text-[11px] text-slate-400">{c.unit}</span></td>
                <td className="px-3 py-2.5 text-right text-slate-700 tabular-nums whitespace-nowrap">
                  {c.base_replacement_cost != null ? `$${Math.round(c.base_replacement_cost).toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}