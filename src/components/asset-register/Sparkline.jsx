import React from 'react';

export default function Sparkline({ points = [], width = 60, height = 18, color = '#6366f1' }) {
  if (!points.length) return <div style={{ width, height }} />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1 || 1);
  const path = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * (height - 2) - 1;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastX = (points.length - 1) * stepX;
  const lastY = height - ((points[points.length - 1] - min) / range) * (height - 2) - 1;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="1.8" fill={color} />
    </svg>
  );
}