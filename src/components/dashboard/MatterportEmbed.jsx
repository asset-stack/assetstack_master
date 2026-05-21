import React from 'react';
import { Box, ExternalLink } from 'lucide-react';

/**
 * Matterport 3D tour embed.
 * Pass a model ID (the "m" query param of a Matterport showcase URL).
 * Default points to the South West Sports Centre tour.
 */
export default function MatterportEmbed({
  modelId = '4xXzHXiFbDV',
  title = 'South West Sports Centre',
  subtitle = '3D Digital Twin · Matterport',
  height = 260,
  urlParams = '',
}) {
  const baseParams = `play=1&qs=1&brand=0&hr=0&help=0`;
  const src = `https://my.matterport.com/show/?m=${modelId}&${baseParams}${urlParams ? '&' + urlParams : ''}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>
        <a
          href={`https://my.matterport.com/show/?m=${modelId}`}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="relative bg-slate-900" style={{ height }}>
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