import React from 'react';

export default function MatterportWalkthrough({
  title = 'South West Sports Centre',
  subtitle = 'Bunbury Council — Live Matterport Feed',
}) {
  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden">
      <iframe
        src="https://my.matterport.com/show/?m=4xXzHXiFbDV"
        title="Matterport 3D Walkthrough"
        className="w-full h-full border-0"
        allowFullScreen
        allow="xr-spatial-tracking"
      />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-slate-300">{subtitle}</p>
      </div>
    </div>
  );
}