import React from 'react';
import DigitalTwinModelViewer from './DigitalTwinModelViewer';
import MatterportWalkthrough from '@/components/digital-twin/MatterportWalkthrough';

export default function ScanViewer3D({ modelUrl, modelType = 'demo' }) {
  const canRenderModel = !!modelUrl && ['obj', 'gltf', 'glb'].includes(modelType);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden">
      {canRenderModel ? (
        <DigitalTwinModelViewer modelUrl={modelUrl} modelType={modelType} />
      ) : (
        <MatterportWalkthrough />
      )}
    </div>
  );
}