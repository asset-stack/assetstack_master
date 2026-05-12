import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Box, Maximize2 } from 'lucide-react';
import ScanSitePlanOverlay from './ScanSitePlanOverlay';

// Build a Matterport embed URL from any my.matterport.com link
function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const m = url.match(/[?&]m=([a-zA-Z0-9]+)/);
    if (!m) return null;
    return `https://my.matterport.com/show/?m=${m[1]}&play=1&qs=1`;
  } catch {
    return null;
  }
}

export default function LocationScansTab({ scans, equipment = [], conditionReports = [], workOrders = [] }) {
  const [activeId, setActiveId] = useState(scans[0]?.id);
  const active = scans.find(s => s.id === activeId) || scans[0];
  const embedUrl = toEmbedUrl(active?.file_url);
  const overlays = active?.asset_overlays || [];

  if (scans.length === 0) {
    return <p className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">No scans for this location.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Interactive site plan with asset overlay */}
      {overlays.length > 0 && (
        <ScanSitePlanOverlay
          overlays={overlays}
          equipment={equipment}
          conditionReports={conditionReports}
          workOrders={workOrders}
        />
      )}

      {/* Embedded Matterport viewer */}
      {embedUrl ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-sm text-slate-900">{active.name}</span>
            </div>
            <a href={active.file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Open full screen
            </a>
          </div>
          <div className="relative bg-slate-900" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={embedUrl}
              title={active.name}
              allow="xr-spatial-tracking; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>
      ) : (
        active?.preview_image_url && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <img src={active.preview_image_url} alt={active.name} className="w-full h-64 object-cover" />
            <div className="p-4 text-center text-sm text-slate-500">No embeddable 3D scan link for this asset yet.</div>
          </div>
        )
      )}

      {/* Scan list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scans.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`text-left bg-white rounded-xl border overflow-hidden transition-all ${active?.id === s.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}
          >
            {s.preview_image_url && <img src={s.preview_image_url} alt={s.name} className="w-full h-32 object-cover" />}
            <div className="p-3">
              <h4 className="font-semibold text-sm text-slate-900">{s.name}</h4>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{s.model_type}</Badge>
                {s.scan_date && <Badge variant="outline" className="text-xs">{s.scan_date}</Badge>}
                {s.total_anomalies > 0 && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">{s.total_anomalies} anomalies</Badge>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}