import React from 'react';

/**
 * Lightweight module preview cards — branded illustrations to keep the page fast
 * and consistent with the home landing design language (no external video deps).
 */

const TONES = {
  blue: { bg: '#eef1ff', accent: '#1925aa', soft: '#dde2ff' },
  sky: { bg: '#e8f3ff', accent: '#1d4ed8', soft: '#cfe2ff' },
  violet: { bg: '#efeaff', accent: '#5b21b6', soft: '#ddd0ff' },
  emerald: { bg: '#e7f6ee', accent: '#047857', soft: '#cfeadd' },
  amber: { bg: '#fdf3df', accent: '#a16207', soft: '#f6e3b2' },
  rose: { bg: '#fde8ec', accent: '#9f1239', soft: '#fbd0d8' },
};

export default function ProductModulePreview({ tone = 'blue', children }) {
  const t = TONES[tone] || TONES.blue;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-8"
      style={{ background: `linear-gradient(135deg, ${t.bg} 0%, #ffffff 100%)` }}
    >
      <div className="relative w-full h-full">
        {children({ accent: t.accent, soft: t.soft, bg: t.bg })}
      </div>
    </div>
  );
}