import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SWSCMissingList({ items = [] }) {
  if (items.length === 0) {
    return <Card className="p-8 text-center text-slate-500 text-sm">No missing assets — every spreadsheet row is in the DB.</Card>;
  }

  return (
    <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
      {items.slice(0, 200).map((item, i) => (
        <Card key={`${item.key}-${i}`} className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 truncate">
                {item.component_type} — {item.component_subtype}
              </p>
              <p className="text-xs text-slate-500">{item.room}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge variant="outline" className="text-[10px]">Grade {item.condition_grade}</Badge>
              <Badge variant="outline" className="text-[10px]">
                ${(item.replacement_value || 0).toLocaleString()}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}