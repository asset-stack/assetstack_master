import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, ChevronRight } from 'lucide-react';

export default function InspectorLocationPicker({ locations, assetCountsByLocation, onPick }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Pick a location</h2>
      {locations.map((loc) => {
        const count = assetCountsByLocation[loc.name] || 0;
        return (
          <Card
            key={loc.id}
            onClick={() => onPick(loc)}
            className="p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{loc.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {count} asset{count !== 1 ? 's' : ''} · {loc.location_type || 'building'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}