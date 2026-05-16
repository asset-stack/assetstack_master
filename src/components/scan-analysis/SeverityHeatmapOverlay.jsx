import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Flame } from 'lucide-react';

/**
 * Severity heatmap overlay — visualizes defect concentration as radial gradients
 * over the scan image. Inspired by industrial anomaly detection heat-map viewers.
 */
export default function SeverityHeatmapOverlay({ reports, imageUrl }) {
  const [enabled, setEnabled] = useState(false);

  const severityWeight = { minor: 0.25, moderate: 0.5, major: 0.75, critical: 1 };
  const severityColor = {
    minor: 'rgba(59, 130, 246, 0.6)',
    moderate: 'rgba(245, 158, 11, 0.7)',
    major: 'rgba(249, 115, 22, 0.75)',
    critical: 'rgba(239, 68, 68, 0.85)'
  };

  const relevant = reports.filter(
    (r) => r.image_url === imageUrl && r.bounding_box && r.review_status !== 'rejected'
  );

  if (relevant.length === 0) return null;

  return (
    <>
      {/* Toggle button — anchor in top-left of image */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-sm text-white rounded-md px-2 py-1.5 shadow-lg">
        <Flame className="w-3 h-3 text-orange-300" />
        <span className="text-[10px] font-semibold">Heatmap</span>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          className="scale-75 origin-left"
        />
      </div>

      {enabled && (
        <div className="absolute inset-0 pointer-events-none mix-blend-multiply">
          {relevant.map((r) => {
            const bbox = r.bounding_box;
            const cx = (bbox.x || 0) + (bbox.width || 0) / 2;
            const cy = (bbox.y || 0) + (bbox.height || 0) / 2;
            const weight = severityWeight[r.severity] || 0.5;
            const radius = 8 + weight * 18; // % of image width
            const color = severityColor[r.severity] || severityColor.moderate;

            return (
              <div
                key={r.id}
                className="absolute rounded-full"
                style={{
                  left: `${cx * 100}%`,
                  top: `${cy * 100}%`,
                  width: `${radius * 2}%`,
                  height: `${radius * 2}%`,
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                  filter: 'blur(8px)'
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}