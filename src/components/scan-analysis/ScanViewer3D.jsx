import React, { useState } from 'react';
import DeskConditionDemo from './DeskConditionDemo';

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
        <DeskConditionDemo />
      )}
    </div>
  );
}