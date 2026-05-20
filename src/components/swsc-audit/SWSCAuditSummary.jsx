import React from 'react';
import { Card } from '@/components/ui/card';
import { FileSpreadsheet, Database, AlertTriangle, FileQuestion, FileX } from 'lucide-react';

export default function SWSCAuditSummary({ summary }) {
  const cards = [
    { label: 'Spreadsheet rows (SWSC)', value: summary.spreadsheet_rows_swsc, icon: FileSpreadsheet, color: 'text-slate-600' },
    { label: 'Unique assets in spreadsheet', value: summary.authoritative_unique_assets, icon: FileSpreadsheet, color: 'text-indigo-600' },
    { label: 'DB equipment (SWSC)', value: summary.db_swsc_equipment_total, icon: Database, color: 'text-slate-700' },
    { label: 'Field mismatches', value: summary.field_mismatches_count, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Missing in DB', value: summary.missing_in_db_count, icon: FileQuestion, color: 'text-rose-600' },
    { label: 'Extras in DB', value: summary.extra_in_db_count, icon: FileX, color: 'text-slate-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <c.icon className={`w-4 h-4 ${c.color}`} />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{c.label}</span>
          </div>
          <p className={`text-2xl font-bold ${c.color} tabular-nums`}>{c.value?.toLocaleString() || 0}</p>
        </Card>
      ))}
    </div>
  );
}