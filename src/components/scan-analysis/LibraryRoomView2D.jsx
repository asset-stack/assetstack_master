import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Eye, CheckCircle2, Sparkles, Play, RotateCcw, AlertTriangle, Activity, Ruler } from 'lucide-react';

// Condition score → color
const scoreColor = (score) => {
  if (score <= 1) return '#10b981';
  if (score === 2) return '#84cc16';
  if (score === 3) return '#f59e0b';
  if (score === 4) return '#f97316';
  return '#ef4444';
};

const scoreLabel = (score) => ({ 1: 'Excellent', 2: 'Good', 3: 'Fair', 4: 'Poor', 5: 'Failed' }[score] || 'Unknown');

// AI classification per asset type
const AI_CLASSIFICATION = {
  chair: { class: 'Chair', features: ['4 legs detected', 'Seat surface', 'Backrest'], category: 'Seating' },
  table: { class: 'Reading Table', features: ['Flat top surface', '4 support legs', 'Rectangular'], category: 'Furniture' },
  bookshelf: { class: 'Bookshelf', features: ['Vertical panel', 'Horizontal shelves', 'Book rows'], category: 'Storage' },
  desk: { class: 'Service Desk', features: ['Large top surface', 'Computer detected', 'Desk body'], category: 'Workstation' },
};

// Condition analysis findings per score (what LiDAR revealed)
const CONDITION_FINDINGS = {
  1: { summary: 'No surface deviations detected', findings: ['Geometry matches reference model', 'Surface reflectance uniform', 'No structural anomalies'], action: 'No action required' },
  2: { summary: 'Minor wear detected', findings: ['Surface reflectance variance: 4%', 'Minor edge rounding observed', 'No structural issues'], action: 'Routine inspection in 12 months' },
  3: { summary: 'Moderate wear detected', findings: ['Surface deviation: 8mm from reference', 'Visible material degradation', 'Joint alignment shifted 2°'], action: 'Schedule maintenance within 3 months' },
  4: { summary: 'Significant damage detected', findings: ['Surface deviation: 18mm from reference', 'Structural integrity compromised', 'Missing material in 2 regions'], action: 'Repair required — priority medium' },
  5: { summary: 'Critical failure detected', findings: ['Structural fracture identified', 'Surface deviation: 45mm', 'Component separation detected'], action: 'Replace immediately — do not use' },
};

// Library room layout — top-down plan view
const FURNITURE = [
  { id: 'bs-a', type: 'bookshelf', x: 150, y: 60, w: 120, h: 40, score: 1, name: 'Bookshelf A' },
  { id: 'bs-b', type: 'bookshelf', x: 290, y: 60, w: 120, h: 40, score: 2, name: 'Bookshelf B' },
  { id: 'bs-c', type: 'bookshelf', x: 430, y: 60, w: 120, h: 40, score: 3, name: 'Bookshelf C' },
  { id: 'bs-d', type: 'bookshelf', x: 570, y: 60, w: 120, h: 40, score: 2, name: 'Bookshelf D' },
  { id: 'bs-e', type: 'bookshelf', x: 710, y: 60, w: 120, h: 40, score: 4, name: 'Bookshelf E' },
  { id: 'ref-a', type: 'bookshelf', x: 50, y: 180, w: 40, h: 100, score: 1, name: 'Reference A' },
  { id: 'ref-b', type: 'bookshelf', x: 50, y: 320, w: 40, h: 100, score: 2, name: 'Reference B' },
  { id: 't1', type: 'table', x: 220, y: 260, w: 160, h: 90, score: 1, name: 'Reading Table 1' },
  { id: 't2', type: 'table', x: 520, y: 260, w: 160, h: 90, score: 2, name: 'Reading Table 2' },
  { id: 'c1a', type: 'chair', x: 240, y: 220, w: 40, h: 40, score: 2, name: 'Chair 1A' },
  { id: 'c1b', type: 'chair', x: 320, y: 220, w: 40, h: 40, score: 3, name: 'Chair 1B' },
  { id: 'c1c', type: 'chair', x: 240, y: 360, w: 40, h: 40, score: 2, name: 'Chair 1C' },
  { id: 'c1d', type: 'chair', x: 320, y: 360, w: 40, h: 40, score: 1, name: 'Chair 1D' },
  { id: 'c2a', type: 'chair', x: 540, y: 220, w: 40, h: 40, score: 1, name: 'Chair 2A' },
  { id: 'c2b', type: 'chair', x: 620, y: 220, w: 40, h: 40, score: 2, name: 'Chair 2B' },
  { id: 'c2c', type: 'chair', x: 540, y: 360, w: 40, h: 40, score: 5, name: 'Chair 2C' },
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

function FurnitureItem({ item, isDetected, isFocused, phase }) {
  const color = scoreColor(item.score);
  const fill = furnitureFillByType(item.type);
  const dimmed = phase === 'identifying' && !isDetected;

  // Show condition pill only after analysis phase
  const showCondition = phase === 'analyzing' || phase === 'done';

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: dimmed ? 0.2 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <rect
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx={item.type === 'chair' ? 6 : 4}
        fill={fill}
        stroke={showCondition ? color : '#64748b'}
        strokeWidth={2.5}
        opacity={0.85}
      />
      {/* Condition pill — only visible after condition analysis */}
      {showCondition && (
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

      {/* Focus ring */}
      {isFocused && (
        <rect
          x={item.x - 6}
          y={item.y - 6}
          width={item.w + 12}
          height={item.h + 12}
          rx={10}
          fill="none"
          stroke={phase === 'analyzing' || phase === 'done' ? '#a78bfa' : '#22d3ee'}
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

      {showLabel && (
        <motion.g initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <rect x={item.x - 4} y={item.y - 28} width={labelW} height={22} rx={4} fill="#0f172a" stroke="#22d3ee" strokeWidth={1.5} />
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

// Condition analysis overlay — shows point-cloud deviation heatmap on focused item
function ConditionHeatmap({ item }) {
  const color = scoreColor(item.score);
  // More "heat" dots for worse condition
  const density = item.score * 4 + 4;
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < density; i++) {
      const seed = (i * 9301 + 49297 + item.id.charCodeAt(0)) % 233280;
      const rx = (seed / 233280);
      const ry = ((seed * 7) % 233280) / 233280;
      arr.push({
        cx: item.x + rx * item.w,
        cy: item.y + ry * item.h,
        r: 2 + (ry * 3),
      });
    }
    return arr;
  }, [item, density]);

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={color} opacity={0.55}>
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${1.5 + (i % 3) * 0.5}s`} repeatCount="indefinite" begin={`${i * 0.08}s`} />
        </circle>
      ))}
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
          <rect x={sx + 14} y={sy - 24} width={Math.max(120, (overlay.equipment_name?.length || 8) * 7)} height={28} rx={6} fill="#0f172a" stroke={color} strokeWidth={1.5} />
          <text x={sx + 22} y={sy - 6} fontSize={12} fontWeight={600} fill="white">
            {overlay.equipment_name || `Asset ${index + 1}`}
          </text>
        </g>
      )}
    </g>
  );
}

// AI Inspection panel — different content per phase
function InspectionPanel({ item, phase }) {
  if (!item) return null;
  const classification = AI_CLASSIFICATION[item.type];
  const confidence = confidenceFor(item);
  const color = scoreColor(item.score);
  const findings = CONDITION_FINDINGS[item.score];

  const isConditionPhase = phase === 'analyzing' || phase === 'done';
  const headerColor = isConditionPhase ? 'text-violet-400' : 'text-cyan-400';
  const headerBg = isConditionPhase ? 'bg-violet-500/20' : 'bg-cyan-500/20';
  const borderColor = isConditionPhase ? 'border-violet-400/30' : 'border-cyan-400/30';

  return (
    <motion.div
      key={phase + item.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`absolute right-3 top-16 w-80 bg-slate-900/95 backdrop-blur-xl border ${borderColor} rounded-xl p-4 text-white shadow-2xl`}
    >
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
        <div className={`w-8 h-8 rounded-lg ${headerBg} flex items-center justify-center`}>
          {isConditionPhase ? <Activity className={`w-4 h-4 ${headerColor}`} /> : <Eye className={`w-4 h-4 ${headerColor}`} />}
        </div>
        <div>
          <div className={`text-[10px] uppercase tracking-wider ${headerColor} font-semibold`}>
            {isConditionPhase ? 'Condition Analysis' : 'Asset Identification'}
          </div>
          <div className="text-sm font-bold">{item.name}</div>
        </div>
      </div>

      {/* PHASE 1 — IDENTIFICATION */}
      {!isConditionPhase && (
        <>
          <div className="mb-3">
            <div className="text-[10px] uppercase text-white/50 font-semibold mb-1">Classification</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{classification.class}</span>
              <span className="text-xs font-mono text-cyan-400">{confidence}%</span>
            </div>
            <div className="text-[10px] text-white/60 mt-0.5">{classification.category}</div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300" />
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-white/50 font-semibold mb-1.5">Detected Features</div>
            <div className="space-y-1">
              {classification.features.map((f, i) => (
                <motion.div key={f} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-white/80">{f}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* PHASE 2 — CONDITION ANALYSIS */}
      {isConditionPhase && (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase text-white/50 font-semibold">Condition Score</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: color, color: 'white' }}>
                {item.score}/5 · {scoreLabel(item.score)}
              </span>
            </div>
            <div className="text-xs text-white/80 mt-2">{findings.summary}</div>
          </div>

          <div className="mb-3">
            <div className="text-[10px] uppercase text-white/50 font-semibold mb-1.5 flex items-center gap-1.5">
              <Ruler className="w-3 h-3" /> LiDAR Findings
            </div>
            <div className="space-y-1.5">
              {findings.findings.map((f, i) => (
                <motion.div key={f} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 text-xs">
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-white/80">{f}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="text-[10px] uppercase text-white/50 font-semibold mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> Recommended Action
            </div>
            <div className="text-xs font-semibold" style={{ color }}>{findings.action}</div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function LibraryRoomView2D({ overlays = [], hoveredAsset, setHoveredAsset, onAssetClick }) {
  // Phases: idle → identifying → identified → analyzing → done
  const [phase, setPhase] = useState('idle');
  const [detectedIds, setDetectedIds] = useState(new Set());
  const [focusedId, setFocusedId] = useState(null);
  const [progress, setProgress] = useState(0);

  const focusedItem = useMemo(() => FURNITURE.find(f => f.id === focusedId), [focusedId]);

  // ===== PHASE 1: Run Asset Identification =====
  const runIdentification = () => {
    setPhase('identifying');
    setDetectedIds(new Set());
    setFocusedId(null);
    setProgress(0);

    const order = [...FURNITURE].sort((a, b) => a.y - b.y || a.x - b.x);
    order.forEach((item, i) => {
      setTimeout(() => {
        setDetectedIds(prev => new Set([...prev, item.id]));
        setProgress(Math.round(((i + 1) / order.length) * 100));
      }, 200 + i * 150);
    });

    setTimeout(() => {
      setPhase('identified');
      setFocusedId('c1b'); // focus on a chair to demo classification
    }, 200 + order.length * 150 + 400);
  };

  // ===== PHASE 2: Run Condition Analysis =====
  const runConditionAnalysis = () => {
    setPhase('analyzing');
    setProgress(0);

    // Cycle through assets to show condition heatmap, then settle on a critical one
    const samples = ['c2c', 'bs-e', 'bs-c', 'c1b', 't2'];
    samples.forEach((id, i) => {
      setTimeout(() => {
        setFocusedId(id);
        setProgress(Math.round(((i + 1) / samples.length) * 100));
      }, 400 + i * 900);
    });

    setTimeout(() => {
      setPhase('done');
      setFocusedId('c2c'); // critical broken chair — final focus
    }, 400 + samples.length * 900 + 400);
  };

  const reset = () => {
    setPhase('idle');
    setDetectedIds(new Set());
    setFocusedId(null);
    setProgress(0);
  };

  // After "done", cycle focus through a few assets to showcase variety
  useEffect(() => {
    if (phase !== 'done') return;
    const samples = ['c2c', 'bs-e', 'bs-c', 't2', 'c1b'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % samples.length;
      setFocusedId(samples[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, [phase]);

  const isIdentifying = phase === 'identifying';
  const isAnalyzing = phase === 'analyzing';
  const showDetectionBoxes = phase === 'identifying' || phase === 'identified' || phase === 'analyzing' || phase === 'done';

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
          <linearGradient id="scan-beam-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="scan-beam-violet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="40" y="40" width="920" height="620" fill="url(#floor-pattern)" rx="4" />
        <rect x="40" y="40" width="920" height="620" fill="none" stroke="#fef3c7" strokeWidth="12" rx="4" />
        <rect x="200" y="230" width="520" height="180" fill="url(#rug-gradient)" rx="6" opacity="0.7" />

        {/* LiDAR grid overlay during scanning */}
        {(isIdentifying || isAnalyzing) && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h${i}`} x1={40} y1={40 + i * 32} x2={960} y2={40 + i * 32} stroke={isAnalyzing ? '#a78bfa' : '#22d3ee'} strokeWidth={0.5} opacity={0.15} />
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
              <line key={`v${i}`} x1={40 + i * 32} y1={40} x2={40 + i * 32} y2={660} stroke={isAnalyzing ? '#a78bfa' : '#22d3ee'} strokeWidth={0.5} opacity={0.15} />
            ))}
          </motion.g>
        )}

        <text x="500" y="680" textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight={500}>
          Library Room — LiDAR Asset Identification &amp; Condition Analysis
        </text>

        {/* Furniture */}
        {FURNITURE.map((item) => (
          <FurnitureItem
            key={item.id}
            item={item}
            isDetected={detectedIds.has(item.id)}
            isFocused={focusedId === item.id}
            phase={phase}
          />
        ))}

        {/* Detection boxes — shown from Phase 1 onward */}
        {showDetectionBoxes &&
          FURNITURE.filter(f => detectedIds.has(f.id) || phase !== 'identifying').map((item) => (
            <DetectionBox
              key={`det-${item.id}`}
              item={item}
              showLabel={focusedId === item.id || phase === 'identified'}
            />
          ))}

        {/* Condition heatmap on focused asset during/after Phase 2 */}
        {(isAnalyzing || phase === 'done') && focusedItem && (
          <ConditionHeatmap item={focusedItem} />
        )}

        {/* Phase 1 sweep beam (cyan, top→bottom) */}
        {isIdentifying && (
          <motion.rect
            initial={{ y: 40 }}
            animate={{ y: 620 }}
            transition={{ duration: FURNITURE.length * 0.15, ease: 'linear' }}
            x={40}
            width={920}
            height={60}
            fill="url(#scan-beam-cyan)"
          />
        )}

        {/* Phase 2 sweep beam (violet, left→right) */}
        {isAnalyzing && (
          <motion.rect
            initial={{ x: 40 }}
            animate={{ x: 900 }}
            transition={{ duration: 4, ease: 'linear' }}
            y={40}
            width={60}
            height={620}
            fill="url(#scan-beam-violet)"
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

      {/* Controls */}
      <div className="absolute top-3 right-3 flex gap-2">
        {phase === 'idle' && (
          <button onClick={runIdentification} className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all">
            <Play className="w-3.5 h-3.5" />
            Step 1 · Identify Assets
          </button>
        )}
        {phase === 'identified' && (
          <>
            <button onClick={runConditionAnalysis} className="flex items-center gap-1.5 bg-violet-500 hover:bg-violet-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-violet-500/30 transition-all">
              <Activity className="w-3.5 h-3.5" />
              Step 2 · Analyse Condition
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10">
              Reset
            </button>
          </>
        )}
        {phase === 'done' && (
          <button onClick={reset} className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo
          </button>
        )}
      </div>

      {/* Phase indicator / progress */}
      {(isIdentifying || isAnalyzing) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-16 right-3 w-60 bg-slate-900/90 backdrop-blur-md border rounded-lg p-3 text-white ${isAnalyzing ? 'border-violet-400/30' : 'border-cyan-400/30'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isAnalyzing ? <Activity className="w-3.5 h-3.5 text-violet-400 animate-pulse" /> : <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
            <span className={`text-[11px] font-bold uppercase tracking-wide ${isAnalyzing ? 'text-violet-400' : 'text-cyan-400'}`}>
              {isAnalyzing ? 'Condition Scan' : 'LiDAR Scan'}
            </span>
            <span className="ml-auto text-xs font-mono">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className={`h-full bg-gradient-to-r ${isAnalyzing ? 'from-violet-500 to-violet-300' : 'from-cyan-500 to-cyan-300'}`} />
          </div>
          <div className="mt-2 text-[10px] text-white/60">
            {isAnalyzing
              ? <>Measuring surface deviation & wear…</>
              : <>Objects identified: <span className="text-cyan-400 font-semibold">{detectedIds.size}</span> / {FURNITURE.length}</>}
          </div>
        </motion.div>
      )}

      {/* AI inspection panel */}
      <AnimatePresence mode="wait">
        {(phase === 'identified' || phase === 'analyzing' || phase === 'done') && focusedItem && (
          <InspectionPanel item={focusedItem} phase={phase} />
        )}
      </AnimatePresence>

      {/* Idle prompt */}
      {phase === 'idle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-16 right-3 w-60 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-lg p-3 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-400">2-Step AI Workflow</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-white/70">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[9px] flex items-center justify-center shrink-0 mt-px">1</span>
              <span><span className="font-semibold text-white">Identify</span> every asset in the room (chair, table, shelf…)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 font-bold text-[9px] flex items-center justify-center shrink-0 mt-px">2</span>
              <span><span className="font-semibold text-white">Analyse</span> each asset's condition from LiDAR data</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transition prompt after Phase 1 */}
      {phase === 'identified' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-violet-500/90 backdrop-blur-md border border-violet-300/40 rounded-lg px-4 py-2 text-white text-xs font-semibold shadow-xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {FURNITURE.length} assets identified · Ready for condition analysis →
        </motion.div>
      )}
    </div>
  );
}