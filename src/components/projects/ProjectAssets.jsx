import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectAssets({ equipmentIds = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!equipmentIds.length) {
      setItems([]);
      return;
    }
    setLoading(true);
    Promise.all(
      equipmentIds.map((id) => base44.entities.Equipment.get(id).catch(() => null))
    )
      .then((r) => setItems(r.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [equipmentIds.join(',')]);

  if (!equipmentIds.length) {
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No assets linked to this project yet.
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 text-center text-sm text-slate-500">Loading assets...</Card>
    );
  }

  return (
    <Card className="divide-y divide-slate-100">
      {items.map((eq) => {
        const healthColor =
          eq.health_score >= 80
            ? 'bg-emerald-500'
            : eq.health_score >= 50
            ? 'bg-amber-500'
            : 'bg-rose-500';
        return (
          <Link
            key={eq.id}
            to={`/Equipment?id=${eq.id}`}
            className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 truncate">{eq.name}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{eq.location}</span>
                  <span>·</span>
                  <span>{eq.type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${healthColor}`} />
                <span className="text-xs font-semibold text-slate-700 tabular-nums">
                  {Math.round(eq.health_score || 0)}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {eq.status}
              </Badge>
            </div>
          </Link>
        );
      })}
    </Card>
  );
}