import React from 'react';
import { Box, ExternalLink } from 'lucide-react';

/**
 * Digital twin preview — embeds the Matterport showcase tour used elsewhere
 * in the platform so visitors can navigate a real 3D digital twin.
 */
export default function DigitalTwinVideoPreview({
  modelId = 'SxQL3iGyoDo',
  title = 'Industrial Facility Digital Twin',
  subtitle = '3D Digital Twin · Matterport',
}) {
  const src = `https://my.matterport.com/show/?m=${modelId}&play=1&qs=1&brand=0&hr=0&help=0`;
  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/95 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
            <Box className="w-3 h-3 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">{title}</p>
            <p className="text-[9px] text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>
        <a
          href={`https://my.matterport.com/show/?m=${modelId}`}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="relative flex-1">
        <iframe
          title={title}
          src={src}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="xr-spatial-tracking; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}