import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Eye, CheckCircle2, Sparkles, Play, RotateCcw } from 'lucide-react';

// Condition score → color
const scoreColor = (score) => {
  if (score <= 1) return '#10b981';
  if (score === 2) return '#84cc16';
  if (score === 3) return '#f59e0b';
  if (score === 4) return '#f97316';
  return '#ef4444';
};

const scoreLabel = (score) => ({ 1: 'Excellent', 2: 'Good', 3: 'Fair', 4: 'Poor', 5: 'Failed' }[score] || 'Unknown');

// Descriptive AI classification per object type
const AI_CLASSIFICATION = {
  chair: { class: 'Chair', features: ['4 legs detected', 'Seat surface', 'Backrest'], category: 'Seating' },
  table: { class: 'Reading Table', features: ['Flat top surface', '4 support legs', 'Rectangular'], category: 'Furniture' },
  bookshelf: { class: 'Bookshelf', features: ['Vertical panel', 'Horizontal shelves', 'Book rows'], category: 'Storage' },
  desk: { class: 'Service Desk', features: ['Large top surface', 'Computer detected', 'Desk body'], category: 'Workstation' },
};

// Library room layout — top-down plan view
const FURNITURE = [
  { id: 'bs-a', type: 'bookshelf', x: 150, y: 60, w: 120, h: 40, score: 1, name: 'Bookshelf A' },
  { id: 'bs-b', type: 'bookshelf', x: 290, y: 60, w: 120, h: 40, score: 2, name: 'Bookshelf B' },
  { id: 'bs-c', type: 'bookshelf', x: 430, y: 60, w: 120, h: 40, score: 3, name: 'Bookshelf C (worn)' },
  { id: 'bs-d', type: 'bookshelf', x: 570, y: 60, w: 120, h: 40, score: 2, name: 'Bookshelf D' },
  { id: 'bs-e', type: 'bookshelf', x: 710, y: 60, w: 120, h: 40, score: 4, name: 'Bookshelf E (damaged)' },
  { id: 'ref-a', type: 'bookshelf', x: 50, y: 180, w: 40, h: 100, score: 1, name: 'Reference A' },
  { id: 'ref-b', type: 'bookshelf', x: 50, y: 320, w: 40, h: 100, score: 2, name: 'Reference B' },
  { id: 't1', type: 'table', x: 220, y: 260, w: 160, h: 90, score: 1, name: 'Reading Table 1' },
  { id: 't2', type: 'table', x: 520, y: 260, w: 160, h: 90, score: 2, name: 'Reading Table 2' },
  { id: 'c1a', type: 'chair', x: 240, y: 220, w: 40, h: 40, score: 2, name: 'Chair 1A' },
  { id: 'c1b', type: 'chair', x: 320, y: 220, w: 40, h: 40, score: 3, name: 'Chair 1B (loose)' },
  { id: 'c1c', type: 'chair', x: 240, y: 360, w: 40, h: 40, score: 2, name: 'Chair 1C' },
  { id: 'c1d', type: 'chair', x: 320, y: 360, w: 40, h: 40, score: 1, name: 'Chair 1D' },
  { id: 'c2a', type: 'chair', x: 540, y: 220, w: 40, h: 40, score: 1, name: 'Chair 2A' },
  { id: 'c2b', type: 'chair', x: 620, y: 220, w: 40, h: 40, score: 2, name: 'Chair 2B' },
  { id: 'c2c', type: 'chair', x: 540, y: 360, w: 40, h: 40, score: 5, name: 'Chair 2C (broken)' },
  { id: 'c2d', type: 'chair', x: 620, y: 360, w: 40, h: 40, score: 1, name: 'Chair 2D' },
  { id: 'desk', type: 'desk', x: 780, y: 480, w: 160, h: 70, score: 2, name: 'Librarian Desk' },
  { id: 'sc', type: 'chair', x: 840, y: 560, w: 40, h: 40, score: 1, name: 'Staff Chair' },
];

const furnitureFillByType = (type) => ({
  bookshelf: '#78350f',
  table: '#92400e',
  chair: '#7c2d12',
  desk: '#78350f',
}[type] || '#78350f');

// Deterministic confidence score per item
const confidenceFor = (item) => {
  const base = 85 + ((item.id.charCodeAt(0) + item.id.charCodeAt(item.id.length - 1)) % 14);
  return Math.min(99, base);
};

function FurnitureItem({ item, isDetected, isFocused, scanPhase }) {
  const color = scoreColor(item.score);
  const fill = furnitureFillByType(item.type);
  const dimmed = scanPhase === 'scanning' && !isDetected;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: dimmed ? 0.25 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <rect
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx={item.type === 'chair' ? 6 : 4}
        fill={fill}
        stroke={color}
        strokeWidth={2.5}
        opacity={0.85}
      />
      {/* Condition pill — only show once detected */}
      {(isDetected || scanPhase === 'done' || scanPhase === 'idle') && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <rect
            x={item.x + item.w / 2 - 14}
            y={item.y + item.h / 2 - 8}
            width={28}
            height={16}
            rx={8}
            fill={color}
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={item.x + item.w / 2}
            y={item.y + item.h / 2 + 4}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill="white"
          >
            {item.score}/5
          </text>
        </motion.g>
      )}

      {/* Highlight ring on focused item */}
      {isFocused && (
        <rect
          x={item.x - 6}
          y={item.y - 6}
          width={item.w + 12}
          height={item.h + 12}
          rx={10}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={3}
          strokeDasharray="6 4"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite" />
        </rect>
      )}
    </motion.g>
  );
}

function DetectionBox({ item, showLabel }) {
  const color = scoreColor(item.score);
  const classification = AI_CLASSIFICATION[item.type];
  const confidence = confidenceFor(item);
  const labelW = Math.max(130, classification.class.length * 8 + 50);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Corner brackets */}
      {[
        [item.x - 4, item.y - 4],
        [item.x + item.w + 4, item.y - 4],
        [item.x - 4, item.y + item.h + 4],
        [item.x + item.w + 4, item.y + item.h + 4],
      ].map(([cx, cy], i) => {
        const hFlip = i % 2 === 1 ? -1 : 1;
        const vFlip = i >= 2 ? -1 : 1;
        return (
          <path
            key={i}
            d={`M ${cx + 10 * hFlip} ${cy} L ${cx} ${cy} L ${cx} ${cy + 10 * vFlip}`}
            stroke="#22d3ee"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      {/* Dashed box */}
      <rect
        x={item.x - 4}
        y={item.y - 4}
        width={item.w + 8}
        height={item.h + 8}
        fill="rgba(34, 211, 238, 0.08)"
        stroke="#22d3ee"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* Classification label */}
      {showLabel && (
        <motion.g
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <rect
            x={item.x - 4}
            y={item.y - 28}
            width={labelW}
            height={22}
            rx={4}
            fill="#0f172a"
            stroke="#22d3ee"
            strokeWidth={1.5}
          />
          <circle cx={item.x + 6} cy={item.y - 17} r={3} fill="#22d3ee">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
          <text x={item.x + 14} y={item.y - 13} fontSize={10} fontWeight={700} fill="#22d3ee">
            {classification.class.toUpperCase()}
          </text>
          <text x={item.x + 14 + classification.class.length * 6.5} y={item.y - 13} fontSize={10} fontWeight={600} fill="#94a3b8">
            {confidence}%
          </text>
        </motion.g>
      )}
    </motion.g>
  );
}

function AssetOverlay({ overlay, index, hoveredAsset, setHoveredAsset, onAssetClick }) {
  const sx = 500 + (overlay.x || 0) * 45;
  const sy = 350 + (overlay.z || 0) * 45;
  const condition = overlay.condition || 'operational';
  const color = condition === 'critical' ? '#ef4444' : condition === 'degraded' ? '#f59e0b' : '#10b981';
  const isHovered = hoveredAsset === index;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setHoveredAsset(index)}
      onMouseLeave={() => setHoveredAsset(null)}
      onClick={() => onAssetClick && onAssetClick(overlay)}
    >
      <circle cx={sx} cy={sy} r={isHovered ? 24 : 18} fill={color} opacity={0.2}>
        <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={sx} cy={sy} r={10} fill={color} stroke="white" strokeWidth={2.5} />
      <circle cx={sx} cy={sy} r={4} fill="white" />

      {isHovered && (
        <g>
          <rect
            x={sx + 14}
            y={sy - 24}
            width={Math.max(120, (overlay.equipment_name?.length || 8) * 7)}
            height={28}
            rx={6}
            fill="#0f172a"
            stroke={color}
            strokeWidth={1.5}
          />
          <text x={sx + 22} y={sy - 6} fontSize={12} fontWeight={600} fill="white">
            {overlay.equipment_name || `Asset ${index + 1}`}
          </text>
        </g>
      )}
    </g>
  );
}

// AI Inspection side-panel
function InspectionPanel({ item }) {
  if (!item) return null;
  const classification = AI_CLASSIFICATION[item.type];
  const confidence = confidenceFor(item);
  const color = scoreColor(item.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute right-3 top-16 w-72 bg-slate-900/95 backdrop-blur-xl border border-cyan-400/30 rounded-xl p-4 text-white shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Eye className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold">AI Inspecting</div>
          <div className="text-sm font-bold">{item.name}</div>
        </div>
      </div>

      {/* Classification */}
      <div className="mb-3">
        <div className="text-[10px] uppercase text-white/50 font-semibold mb-1">Classification</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{classification.class}</span>
          <span className="text-xs font-mono text-cyan-400">{confidence}%</span>
        </div>
        <div className="text-[10px] text-white/60 mt-0.5">{classification.category}</div>
        <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
          />
        </div>
      </div>

      {/* Detected features */}
      <div className="mb-3">
        <div className="text-[10px] uppercase text-white/50 font-semibold mb-1.5">Detected Features</div>
        <div className="space-y-1">
          {classification.features.map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-xs"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-white/80">{f}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Condition assessment */}
      <div className="pt-3 border-t border-white/10">
        <div className="text-[10px] uppercase text-white/50 font-semibold mb-1.5">Condition Assessment</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{scoreLabel(item.score)}</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: color, color: 'white' }}
          >
            {item.score}/5
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function LibraryRoomView2D({ overlays = [], hoveredAsset, setHoveredAsset, onAssetClick }) {
  const [scanPhase, setScanPhase] = useState('idle'); // idle | scanning | done
  const [detectedIds, setDetectedIds] = useState(new Set(FURNITURE.map(f => f.id)));
  const [focusedId, setFocusedId] = useState(null);
  const [scanProgress, setScanProgress] = useState(100);

  const focusedItem = useMemo(() => FURNITURE.find(f => f.id === focusedId), [focusedId]);

  // Run the scan animation sequence
  const runScan = () => {
    setScanPhase('scanning');
    setDetectedIds(new Set());
    setFocusedId(null);
    setScanProgress(0);

    // Ordered reveal — simulates the sweep detecting objects
    const order = [...FURNITURE].sort((a, b) => a.y - b.y || a.x - b.x);
    order.forEach((item, i) => {
      setTimeout(() => {
        setDetectedIds(prev => new Set([...prev, item.id]));
        setScanProgress(Math.round(((i + 1) / order.length) * 100));
      }, 200 + i * 180);
    });

    // Focus on a representative chair after full scan
    setTimeout(() => {
      setScanPhase('done');
      setFocusedId('c1b');
    }, 200 + order.length * 180 + 400);
  };

  const resetScan = () => {
    setScanPhase('idle');
    setDetectedIds(new Set(FURNITURE.map(f => f.id)));
    setFocusedId(null);
    setScanProgress(100);
  };

  // Auto-cycle focus through furniture types after scan completes
  useEffect(() => {
    if (scanPhase !== 'done') return;
    const samples = ['c1b', 't1', 'bs-c', 'desk'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % samples.length;
      setFocusedId(samples[i]);
    }, 3500);
    return () => clearInterval(interval);
  }, [scanPhase]);

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 1000 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="floor-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#d4a574" />
            <path d="M 0 0 L 40 0 M 0 20 L 40 20" stroke="#a87849" strokeWidth="0.5" opacity="0.4" />
          </pattern>
          <linearGradient id="rug-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <linearGradient id="scan-beam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="scan-pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floor */}
        <rect x="40" y="40" width="920" height="620" fill="url(#floor-pattern)" rx="4" />
        {/* Walls */}
        <rect x="40" y="40" width="920" height="620" fill="none" stroke="#fef3c7" strokeWidth="12" rx="4" />
        {/* Central rug */}
        <rect x="200" y="230" width="520" height="180" fill="url(#rug-gradient)" rx="6" opacity="0.7" />

        {/* LiDAR grid overlay during scanning */}
        {scanPhase === 'scanning' && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1={40}
                y1={40 + i * 32}
                x2={960}
                y2={40 + i * 32}
                stroke="#22d3ee"
                strokeWidth={0.5}
                opacity={0.15}
              />
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={40 + i * 32}
                y1={40}
                x2={40 + i * 32}
                y2={660}
                stroke="#22d3ee"
                strokeWidth={0.5}
                opacity={0.15}
              />
            ))}
          </motion.g>
        )}

        {/* Room label */}
        <text x="500" y="680" textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight={500}>
          Library Room — AI Spatial Scan Analysis
        </text>

        {/* Furniture */}
        {FURNITURE.map((item) => (
          <FurnitureItem
            key={item.id}
            item={item}
            isDetected={detectedIds.has(item.id)}
            isFocused={focusedId === item.id}
            scanPhase={scanPhase}
          />
        ))}

        {/* Detection boxes — visible on detected items during/after scan */}
        {(scanPhase === 'scanning' || scanPhase === 'done') &&
          FURNITURE.filter(f => detectedIds.has(f.id)).map((item) => (
            <DetectionBox
              key={`det-${item.id}`}
              item={item}
              showLabel={focusedId === item.id || scanPhase === 'done'}
            />
          ))}

        {/* Scanning beam — sweeps from top to bottom */}
        {scanPhase === 'scanning' && (
          <motion.rect
            initial={{ y: 40 }}
            animate={{ y: 620 }}
            transition={{ duration: FURNITURE.length * 0.18, ease: 'linear' }}
            x={40}
            width={920}
            height={60}
            fill="url(#scan-beam)"
          />
        )}

        {/* Asset overlays */}
        {overlays.map((o, i) => (
          <AssetOverlay
            key={i}
            overlay={o}
            index={i}
            hoveredAsset={hoveredAsset}
            setHoveredAsset={setHoveredAsset}
            onAssetClick={onAssetClick}
          />
        ))}
      </svg>

      {/* Scan controls */}
      <div className="absolute top-3 right-3 flex gap-2">
        {scanPhase !== 'scanning' && (
          <button
            onClick={runScan}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all"
          >
            {scanPhase === 'done' ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {scanPhase === 'done' ? 'Re-scan' : 'Run AI Scan'}
          </button>
        )}
        {scanPhase === 'done' && (
          <button
            onClick={resetScan}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10"
          >
            Reset
          </button>
        )}
      </div>

      {/* Scan progress bar */}
      {scanPhase === 'scanning' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 right-3 w-56 bg-slate-900/90 backdrop-blur-md border border-cyan-400/30 rounded-lg p-3 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-400">LiDAR Scanning</span>
            <span className="ml-auto text-xs font-mono">{scanProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${scanProgress}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
            />
          </div>
          <div className="mt-2 text-[10px] text-white/60">
            Objects detected: <span className="text-cyan-400 font-semibold">{detectedIds.size}</span> / {FURNITURE.length}
          </div>
        </motion.div>
      )}

      {/* AI Inspection panel */}
      <AnimatePresence>
        {scanPhase === 'done' && focusedItem && <InspectionPanel item={focusedItem} />}
      </AnimatePresence>

      {/* Idle prompt */}
      {scanPhase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-16 right-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg p-3 text-white max-w-[220px]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-400">AI Demo</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Click <span className="font-semibold text-white">Run AI Scan</span> to watch the system detect, classify and assess every object in the room.
          </p>
        </motion.div>
      )}
    </div>
  );
}