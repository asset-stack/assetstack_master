import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function SWSCExtraList({ items = [] }) {
  if (items.length === 0) {
    return <Card className="p-8 text-center text-slate-500 text-sm">No extras — every DB record maps to a spreadsheet row.</Card>;
  }

  return (
    <>
      <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>These DB records don't match any row in the spreadsheet. They may be valid (added separately) or outdated. Not deleted automatically — review and delete manually if needed.</span>
      </div>
      <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
        {items.slice(0, 200).map((item) => (
          <Card key={item.equipment_id} className="p-3">
            <p className="font-semibold text-sm text-slate-900 truncate">{item.name}</p>
            <p className="text-xs text-slate-500">{item.room} • {item.component_type}</p>
          </Card>
        ))}
      </div>
    </>
  );
}