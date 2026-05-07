import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, FileCheck } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function ComplianceStats({ requirements, documents }) {
  const today = new Date();

  const overdue = requirements.filter(r => r.next_due_date && parseISO(r.next_due_date) < today && r.compliance_status !== 'compliant').length;
  const dueSoon = requirements.filter(r => {
    if (!r.next_due_date) return false;
    const days = differenceInDays(parseISO(r.next_due_date), today);
    return days >= 0 && days <= 30;
  }).length;
  const compliant = requirements.filter(r => r.compliance_status === 'compliant').length;
  const expiringDocs = documents.filter(d => {
    if (!d.expiry_date) return false;
    const days = differenceInDays(parseISO(d.expiry_date), today);
    return days >= 0 && days <= 60;
  }).length;

  const stats = [
    { label: 'Compliant', value: compliant, icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Due in 30d', value: dueSoon, icon: Clock, color: 'text-amber-600' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-rose-600' },
    { label: 'Docs expiring', value: expiringDocs, icon: FileCheck, color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
              <Icon className="w-3 h-3" /> {s.label}
            </div>
            <div className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        );
      })}
    </div>
  );
}