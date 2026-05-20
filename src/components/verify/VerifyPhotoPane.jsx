import React, { useState } from 'react';
import { Maximize2, X, ZoomIn } from 'lucide-react';

export default function VerifyPhotoPane({ imageUrl, bbox, anomalyType }) {
  const [zoomed, setZoomed] = useState(false);

  if (!imageUrl) {
    return (
      <div className="bg-slate-100 rounded-2xl aspect-[4/3] flex items-center justify-center text-slate-400 text-sm">
        No image
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden group">
        <img src={imageUrl} alt="Asset for review" className="w-full aspect-[4/3] object-contain" />
        {bbox && (
          <div
            className="absolute border-2 border-red-500 bg-red-500/15 shadow-lg"
            style={{
              left: `${(bbox.x || 0) * 100}%`,
              top: `${(bbox.y || 0) * 100}%`,
              width: `${(bbox.width || 0) * 100}%`,
              height: `${(bbox.height || 0) * 100}%`,
            }}
          >
            {anomalyType && (
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap capitalize">
                {anomalyType.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setZoomed(true)}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-6xl w-full">
            <img src={imageUrl} alt="Zoomed" className="w-full max-h-[90vh] object-contain" />
            {bbox && (
              <div
                className="absolute border-2 border-red-500 bg-red-500/15"
                style={{
                  left: `${(bbox.x || 0) * 100}%`,
                  top: `${(bbox.y || 0) * 100}%`,
                  width: `${(bbox.width || 0) * 100}%`,
                  height: `${(bbox.height || 0) * 100}%`,
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}