import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check } from 'lucide-react';

// Drag a rectangle on an image. Returns normalized {x, y, width, height} (0-1).
// Coordinates are clamped to image bounds.
//
// Props:
//   imageUrl: string — source image
//   initialBbox: { x, y, width, height } | null — pre-existing bbox to show + edit
//   color: tailwind border colour class (e.g. 'border-amber-500'); defaults amber
//   onChange: (bbox | null) => void — called on every release/clear
//   readOnly: boolean — render bbox without allowing drag
export default function BboxDrawCanvas({ imageUrl, initialBbox = null, color = 'border-amber-500', onChange, readOnly = false }) {
  const containerRef = useRef(null);
  const [bbox, setBbox] = useState(initialBbox);
  const [dragStart, setDragStart] = useState(null); // { x, y } normalized
  const [dragCurrent, setDragCurrent] = useState(null);

  // Re-sync if parent swaps the image or initial bbox
  useEffect(() => {
    setBbox(initialBbox);
  }, [imageUrl, initialBbox]);

  const fillTone = color.includes('amber') ? 'bg-amber-500/15'
    : color.includes('emerald') ? 'bg-emerald-500/15'
    : color.includes('red') ? 'bg-red-500/15'
    : 'bg-indigo-500/15';

  const getNorm = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handleDown = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const p = getNorm(e);
    setDragStart(p);
    setDragCurrent(p);
    setBbox(null);
  };

  const handleMove = (e) => {
    if (readOnly || !dragStart) return;
    e.preventDefault();
    setDragCurrent(getNorm(e));
  };

  const handleUp = () => {
    if (readOnly || !dragStart || !dragCurrent) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);
    setDragStart(null);
    setDragCurrent(null);
    // Ignore tiny accidental drags
    if (width < 0.02 || height < 0.02) {
      onChange && onChange(null);
      return;
    }
    const next = { x, y, width, height };
    setBbox(next);
    onChange && onChange(next);
  };

  const handleClear = () => {
    setBbox(null);
    onChange && onChange(null);
  };

  // Live drag rectangle (shown while drawing)
  const liveRect = dragStart && dragCurrent ? {
    left: Math.min(dragStart.x, dragCurrent.x),
    top: Math.min(dragStart.y, dragCurrent.y),
    width: Math.abs(dragCurrent.x - dragStart.x),
    height: Math.abs(dragCurrent.y - dragStart.y),
  } : null;

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
        className={`relative w-full rounded-lg overflow-hidden bg-slate-100 select-none ${readOnly ? '' : 'cursor-crosshair'}`}
        style={{ touchAction: 'none' }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Finding" className="w-full block pointer-events-none" draggable={false} />
        ) : (
          <div className="aspect-video flex items-center justify-center text-slate-400 text-sm">No image</div>
        )}

        {/* Confirmed bbox */}
        {bbox && !liveRect && (
          <div
            className={`absolute border-2 rounded ${color} ${fillTone}`}
            style={{
              left: `${bbox.x * 100}%`,
              top: `${bbox.y * 100}%`,
              width: `${bbox.width * 100}%`,
              height: `${bbox.height * 100}%`,
            }}
          />
        )}

        {/* Live drag rectangle */}
        {liveRect && (
          <div
            className={`absolute border-2 border-dashed rounded ${color} ${fillTone}`}
            style={{
              left: `${liveRect.left * 100}%`,
              top: `${liveRect.top * 100}%`,
              width: `${liveRect.width * 100}%`,
              height: `${liveRect.height * 100}%`,
            }}
          />
        )}

        {!readOnly && !bbox && !liveRect && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/70 text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
              Drag to draw a box around the defect
            </div>
          </div>
        )}
      </div>

      {!readOnly && bbox && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1 flex items-center gap-1.5 text-emerald-700 font-medium">
            <Check className="w-3.5 h-3.5" />
            Box: {(bbox.width * 100).toFixed(0)}% × {(bbox.height * 100).toFixed(0)}%
          </div>
          <Button size="sm" variant="ghost" onClick={handleClear} className="h-7 text-[11px] text-slate-500">
            <RefreshCw className="w-3 h-3 mr-1" /> Redraw
          </Button>
        </div>
      )}
    </div>
  );
}