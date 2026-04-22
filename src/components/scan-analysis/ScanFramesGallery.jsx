import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ScanFramesGallery({ frames = [], selectedFrameId, onSelect }) {
  if (!frames.length) return null;

  const statusIcon = (s) => {
    if (s === 'completed') return <CheckCircle2 className="w-3 h-3 text-green-600" />;
    if (s === 'analyzing' || s === 'pending') return <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />;
    if (s === 'failed') return <AlertTriangle className="w-3 h-3 text-red-500" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <Camera className="w-4 h-4" /> Extracted LiDAR Frames ({frames.length})
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {frames.map((f) => {
          const selected = f.id === selectedFrameId;
          return (
            <button
              key={f.id}
              onClick={() => onSelect && onSelect(f)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src={f.image_url} alt={f.angle_label} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white">{f.angle_label}</span>
                  {statusIcon(f.analysis_status)}
                </div>
              </div>
              {f.findings_count > 0 && (
                <Badge className="absolute top-1 right-1 bg-red-500 text-white border-0 text-[9px] h-4 px-1.5">
                  {f.findings_count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}