import React, { useState } from 'react';
import LibraryRoomView2D from './LibraryRoomView2D';

export default function ScanViewer3D({ modelUrl, modelType = 'demo', overlays = [], onAssetClick }) {
  const [hoveredAsset, setHoveredAsset] = useState(null);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden">
      {/* If a real model was uploaded, show preview fallback (3D rendering disabled) */}
      {modelUrl && (modelType === 'gltf' || modelType === 'glb') ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/80 p-8 text-center">
          <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <span className="text-3xl">🏛️</span>
          </div>
          <p className="font-semibold text-white">3D Model Uploaded</p>
          <p className="text-xs text-white/60 mt-1 max-w-sm">
            Interactive 3D rendering is temporarily unavailable. The model file is saved and assets can still be tagged.
          </p>
        </div>
      ) : (
        <LibraryRoomView2D
          overlays={overlays}
          hoveredAsset={hoveredAsset}
          setHoveredAsset={setHoveredAsset}
          onAssetClick={onAssetClick}
        />
      )}

      {/* HUD */}
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-semibold">Library Room — AI Scan</span>
        </div>
        <p className="text-[10px] text-white/60 mt-0.5">Run the scan to see objects classified in real time</p>
      </div>
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white/70">
        {overlays.length} assets overlaid
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white/80">
        <div className="font-semibold text-white mb-1">Condition</div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Good</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Fair</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
        </div>
      </div>
    </div>
  );
}