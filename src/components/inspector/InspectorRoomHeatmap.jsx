import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

// Live heatmap of rooms — color reflects worst condition found, opacity reflects coverage.
export default function InspectorRoomHeatmap({ rooms, inspectedIds, activeRoom, onPickRoom }) {
  const getRoomState = (room) => {
    const total = room.assets.length;
    const inspected = room.assets.filter((a) => inspectedIds.has(a.id));
    const coverage = total ? inspected.length / total : 0;

    let worstGrade = 0;
    inspected.forEach((a) => {
      const g = a._sessionGrade ?? a.specifications?.condition_grade;
      if (g > worstGrade) worstGrade = g;
    });

    let color = 'bg-slate-100 text-slate-500 border-slate-200';
    if (coverage > 0) {
      if (worstGrade >= 4) color = 'bg-red-100 text-red-700 border-red-300';
      else if (worstGrade === 3) color = 'bg-amber-100 text-amber-700 border-amber-300';
      else if (worstGrade > 0) color = 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }

    return { coverage, color, inspected: inspected.length, total };
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Rooms — Live Heatmap</h3>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Good</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Fair</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Poor</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {rooms.map((room) => {
          const { coverage, color, inspected, total } = getRoomState(room);
          const isActive = activeRoom?.roomName === room.roomName;
          return (
            <motion.button
              key={room.roomName}
              onClick={() => onPickRoom(room)}
              whileTap={{ scale: 0.97 }}
              className={`relative p-3 rounded-xl border-2 text-left transition-all ${color} ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
            >
              <div className="font-semibold text-sm truncate">{room.roomName}</div>
              <div className="text-[11px] mt-1 opacity-80">
                {inspected}/{total} done
              </div>
              <div className="h-1 mt-2 rounded-full bg-white/60 overflow-hidden">
                <div className="h-full bg-current opacity-60" style={{ width: `${coverage * 100}%` }} />
              </div>
              {coverage === 1 && (
                <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 opacity-80" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}