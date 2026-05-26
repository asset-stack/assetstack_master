import React, { useState } from 'react';
import LibraryRoomView2D from './LibraryRoomView2D';
import DigitalTwinModelViewer from './DigitalTwinModelViewer';

export default function ScanViewer3D({ modelUrl, modelType = 'demo', overlays = [], onAssetClick }) {
  const [hoveredAsset, setHoveredAsset] = useState(null);
  const canRenderModel = !!modelUrl && ['obj', 'gltf', 'glb'].includes(modelType);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden">
      {canRenderModel ? (
        <DigitalTwinModelViewer modelUrl={modelUrl} modelType={modelType} />
      ) : (
        <LibraryRoomView2D
          overlays={overlays}
          hoveredAsset={hoveredAsset}
          setHoveredAsset={setHoveredAsset}
          onAssetClick={onAssetClick}
        />
      )}
    </div>
  );
}