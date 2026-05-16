import React, { useState, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { GitCompare, ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Before/after condition comparison slider.
 * Inspired by react-comparison-slider and react-before-after-slider-component.
 * Lets inspectors compare two scans of the same location across time to see deterioration.
 */
export default function ConditionTrendCompare({ currentScan }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [compareToId, setCompareToId] = useState(null);

  const { data: candidates = [] } = useQuery({
    queryKey: ['scansForCompare', currentScan?.location_id, currentScan?.id],
    queryFn: async () => {
      const all = await base44.entities.DigitalTwinModel.list('-scan_date', 30);
      return all.filter(
        (s) =>
          s.id !== currentScan?.id &&
          (s.location_id === currentScan?.location_id ||
            s.location_name === currentScan?.location_name) &&
          s.preview_image_url
      );
    },
    enabled: !!currentScan?.id
  });

  const compareScan = useMemo(
    () => candidates.find((s) => s.id === compareToId),
    [candidates, compareToId]
  );

  // Severity delta — total anomalies / pending review
  const delta = useMemo(() => {
    if (!compareScan) return null;
    const beforeAnomalies = compareScan.total_anomalies || 0;
    const afterAnomalies = currentScan.total_anomalies || 0;
    return {
      anomalies: afterAnomalies - beforeAnomalies,
      direction:
        afterAnomalies > beforeAnomalies
          ? 'worse'
          : afterAnomalies < beforeAnomalies
          ? 'better'
          : 'same'
    };
  }, [compareScan, currentScan]);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  };

  if (!currentScan?.preview_image_url) return null;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-indigo-600" />
          Condition Over Time
        </h4>
        {candidates.length > 0 ? (
          <Select value={compareToId || ''} onValueChange={setCompareToId}>
            <SelectTrigger className="w-[260px] h-8 text-xs">
              <SelectValue placeholder="Compare to previous scan…" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name} ·{' '}
                  {s.scan_date ? format(new Date(s.scan_date), 'MMM yyyy') : '—'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-[10px] text-slate-400">
            No previous scans of this location to compare
          </span>
        )}
      </div>

      {compareScan ? (
        <>
          {/* Delta summary */}
          {delta && (
            <div className="flex items-center gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded">
                <span className="text-slate-500">Before:</span>
                <span className="font-bold tabular-nums">
                  {compareScan.total_anomalies || 0} anomalies
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded">
                <span className="text-slate-500">After:</span>
                <span className="font-bold tabular-nums">
                  {currentScan.total_anomalies || 0} anomalies
                </span>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded font-bold text-[11px] ${
                  delta.direction === 'worse'
                    ? 'bg-rose-50 text-rose-700'
                    : delta.direction === 'better'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {delta.direction === 'worse' && <TrendingDown className="w-3 h-3" />}
                {delta.direction === 'better' && <TrendingUp className="w-3 h-3" />}
                {delta.direction === 'same' && <Minus className="w-3 h-3" />}
                {delta.anomalies > 0 ? '+' : ''}
                {delta.anomalies}
              </div>
            </div>
          )}

          {/* Slider */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden select-none cursor-ew-resize"
            onMouseDown={(e) => {
              setDragging(true);
              handleMove(e.clientX);
            }}
            onMouseMove={(e) => dragging && handleMove(e.clientX)}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onTouchStart={(e) => {
              setDragging(true);
              handleMove(e.touches[0].clientX);
            }}
            onTouchMove={(e) => dragging && handleMove(e.touches[0].clientX)}
            onTouchEnd={() => setDragging(false)}
          >
            {/* Before image */}
            <img
              src={compareScan.preview_image_url}
              alt="Before"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* After image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${position}%` }}
            >
              <img
                src={currentScan.preview_image_url}
                alt="After"
                draggable={false}
                className="absolute inset-0 h-full object-cover"
                style={{ width: `${(100 / position) * 100}%`, maxWidth: 'none' }}
              />
            </div>

            {/* Divider */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
              style={{ left: `${position}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                <GitCompare className="w-3.5 h-3.5 text-slate-700" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">
              BEFORE ·{' '}
              {compareScan.scan_date
                ? format(new Date(compareScan.scan_date), 'MMM yyyy')
                : 'Prior'}
            </div>
            <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">
              AFTER ·{' '}
              {currentScan.scan_date
                ? format(new Date(currentScan.scan_date), 'MMM yyyy')
                : 'Current'}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Drag the divider to compare
          </p>
        </>
      ) : (
        candidates.length > 0 && (
          <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
            Select a previous scan above to see deterioration over time
          </div>
        )
      )}
    </Card>
  );
}