import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Camera, CheckCircle2 } from 'lucide-react';

// 8 viewpoints over the 2D library scene (viewBox 1000x700)
// Each defines a crop region + a human label
const VIEWS = [
  { label: 'Overview',        x: 0,   y: 0,   w: 1000, h: 700 },
  { label: 'North Shelves',   x: 100, y: 20,  w: 800,  h: 220 },
  { label: 'West Reference',  x: 20,  y: 150, w: 260,  h: 320 },
  { label: 'Reading Zone L',  x: 180, y: 180, w: 360,  h: 280 },
  { label: 'Reading Zone R',  x: 480, y: 180, w: 360,  h: 280 },
  { label: 'Critical Chair',  x: 480, y: 320, w: 260,  h: 220 },
  { label: 'Service Desk',    x: 700, y: 420, w: 280,  h: 220 },
  { label: 'Full Top-Down',   x: 0,   y: 0,   w: 1000, h: 700 },
];

// Simple library-room renderer → self-contained SVG string, no React deps at runtime
function buildSceneSvg(viewBox) {
  // Furniture copied from LibraryRoomView2D (kept in sync for visuals)
  const FURNITURE = [
    { id: 'bs-a', type: 'bookshelf', x: 150, y: 60, w: 120, h: 40, score: 1 },
    { id: 'bs-b', type: 'bookshelf', x: 290, y: 60, w: 120, h: 40, score: 2 },
    { id: 'bs-c', type: 'bookshelf', x: 430, y: 60, w: 120, h: 40, score: 3 },
    { id: 'bs-d', type: 'bookshelf', x: 570, y: 60, w: 120, h: 40, score: 2 },
    { id: 'bs-e', type: 'bookshelf', x: 710, y: 60, w: 120, h: 40, score: 4 },
    { id: 'ref-a', type: 'bookshelf', x: 50, y: 180, w: 40, h: 100, score: 1 },
    { id: 'ref-b', type: 'bookshelf', x: 50, y: 320, w: 40, h: 100, score: 2 },
    { id: 't1', type: 'table', x: 220, y: 260, w: 160, h: 90, score: 1 },
    { id: 't2', type: 'table', x: 520, y: 260, w: 160, h: 90, score: 2 },
    { id: 'c1a', type: 'chair', x: 240, y: 220, w: 40, h: 40, score: 2 },
    { id: 'c1b', type: 'chair', x: 320, y: 220, w: 40, h: 40, score: 3 },
    { id: 'c1c', type: 'chair', x: 240, y: 360, w: 40, h: 40, score: 2 },
    { id: 'c1d', type: 'chair', x: 320, y: 360, w: 40, h: 40, score: 1 },
    { id: 'c2a', type: 'chair', x: 540, y: 220, w: 40, h: 40, score: 1 },
    { id: 'c2b', type: 'chair', x: 620, y: 220, w: 40, h: 40, score: 2 },
    { id: 'c2c', type: 'chair', x: 540, y: 360, w: 40, h: 40, score: 5 },
    { id: 'c2d', type: 'chair', x: 620, y: 360, w: 40, h: 40, score: 1 },
    { id: 'desk', type: 'desk', x: 780, y: 480, w: 160, h: 70, score: 2 },
    { id: 'sc', type: 'chair', x: 840, y: 560, w: 40, h: 40, score: 1 },
  ];

  const fillOf = (t) => ({ bookshelf: '#78350f', table: '#92400e', chair: '#7c2d12', desk: '#78350f' }[t] || '#78350f');
  const scoreColor = (s) => s <= 1 ? '#10b981' : s === 2 ? '#84cc16' : s === 3 ? '#f59e0b' : s === 4 ? '#f97316' : '#ef4444';

  const itemsSvg = FURNITURE.map((f) => `
    <rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="${f.type === 'chair' ? 6 : 4}"
          fill="${fillOf(f.type)}" stroke="${scoreColor(f.score)}" stroke-width="2.5" opacity="0.9"/>
    <rect x="${f.x + f.w / 2 - 14}" y="${f.y + f.h / 2 - 8}" width="28" height="16" rx="8"
          fill="${scoreColor(f.score)}" stroke="white" stroke-width="1.5"/>
    <text x="${f.x + f.w / 2}" y="${f.y + f.h / 2 + 4}" text-anchor="middle"
          font-size="10" font-weight="700" fill="white" font-family="sans-serif">${f.score}/5</text>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="1024" height="768" preserveAspectRatio="xMidYMid meet">
  <defs>
    <pattern id="floor" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#d4a574"/>
      <path d="M 0 0 L 40 0 M 0 20 L 40 20" stroke="#a87849" stroke-width="0.5" opacity="0.4"/>
    </pattern>
    <linearGradient id="rug" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9f1239"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
  </defs>
  <rect x="40" y="40" width="920" height="620" fill="url(#floor)" rx="4"/>
  <rect x="40" y="40" width="920" height="620" fill="none" stroke="#fef3c7" stroke-width="12" rx="4"/>
  <rect x="200" y="230" width="520" height="180" fill="url(#rug)" rx="6" opacity="0.7"/>
  ${itemsSvg}
</svg>`;
}

async function svgToJpegFile(svgString, filename) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const res = await fetch(dataUrl);
    const jpgBlob = await res.blob();
    return new File([jpgBlob], filename, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function SVGFrameCapture({ scan, onComplete }) {
  const [status, setStatus] = useState('Preparing…');
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    const run = async () => {
      try {
        setStatus('Rendering scene views…');

        const frames = [];
        for (let i = 0; i < VIEWS.length; i++) {
          if (cancelled) return;
          const v = VIEWS[i];
          setCurrent(i + 1);
          setStatus(`Capturing ${v.label} (${i + 1}/${VIEWS.length})…`);

          const viewBox = `${v.x} ${v.y} ${v.w} ${v.h}`;
          const svg = buildSceneSvg(viewBox);
          const file = await svgToJpegFile(svg, `${scan.id}-frame-${i}.jpg`);
          const { file_url } = await base44.integrations.Core.UploadFile({ file });

          const frame = await base44.entities.ScanFrame.create({
            digital_twin_model_id: scan.id,
            digital_twin_model_name: scan.name,
            frame_index: i,
            angle_label: v.label,
            image_url: file_url,
            analysis_status: 'pending',
          });
          frames.push(frame);
        }

        if (cancelled) return;
        setStatus('Running AI analysis on all frames…');

        await Promise.all(frames.map(async (frame) => {
          await base44.entities.ScanFrame.update(frame.id, { analysis_status: 'analyzing' });
          try {
            const res = await base44.functions.invoke('analyzeScanCondition', {
              image_url: frame.image_url,
              digital_twin_model_id: scan.id,
              digital_twin_model_name: scan.name,
              equipment_name: `${scan.name} — ${frame.angle_label}`,
            });
            await base44.entities.ScanFrame.update(frame.id, {
              analysis_status: 'completed',
              findings_count: res?.data?.findings_count || 0,
            });
          } catch {
            await base44.entities.ScanFrame.update(frame.id, { analysis_status: 'failed' });
          }
        }));

        if (!scan.preview_image_url && frames[0]) {
          await base44.entities.DigitalTwinModel.update(scan.id, {
            preview_image_url: frames[0].image_url,
          });
        }

        setDone(true);
        setStatus('All frames captured and analyzed');
        onComplete && onComplete(frames);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan?.id]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4" /> Scene Frame Extraction
          </p>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
        <div className="text-xs font-medium text-slate-600">{current}/{VIEWS.length}</div>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          style={{ width: `${(current / VIEWS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}