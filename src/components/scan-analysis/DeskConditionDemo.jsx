import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Ruler, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';

// Condition issues detected on the desk (bounding boxes + findings)
// Coordinates are percentages of the image area (0-1)
const CONDITION_ISSUES = [
  {
    id: 'scratch-1',
    type: 'Deep Scratch',
    severity: 'moderate',
    x: 0.22, y: 0.38, w: 0.18, h: 0.04,
    measurement: '14cm long × 2mm deep',
    finding: 'Surface coating compromised — risk of splinter formation',
  },
  {
    id: 'dent-1',
    type: 'Dent / Impact',
    severity: 'minor',
    x: 0.58, y: 0.32, w: 0.08, h: 0.07,
    measurement: '45mm diameter × 3mm deep',
    finding: 'Structural integrity intact, cosmetic only',
  },
  {
    id: 'stain-1',
    type: 'Stain / Discoloration',
    severity: 'minor',
    x: 0.72, y: 0.55, w: 0.14, h: 0.12,
    measurement: 'Area: 168cm²',
    finding: 'Liquid damage, surface finish degraded',
  },
  {
    id: 'edge-1',
    type: 'Edge Wear',
    severity: 'major',
    x: 0.08, y: 0.62, w: 0.16, h: 0.06,
    measurement: 'Edge rounding: 8mm deviation',
    finding: 'Material loss from repeated contact — repair required',
  },
  {
    id: 'corner-1',
    type: 'Corner Damage',
    severity: 'major',
    x: 0.42, y: 0.72, w: 0.1, h: 0.1,
    measurement: 'Chip: 25mm × 18mm',
    finding: 'Structural chip detected — priority repair',
  },
];

const severityColor = {
  minor: '#84cc16',
  moderate: '#f59e0b',
  major: '#f97316',
  critical: '#ef4444',
};

// A photorealistic desk rendered as SVG so we can draw condition issues directly on it
function DeskSVG({ revealedIds, scanning }) {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* Wood grain gradient */}
        <linearGradient id="desk-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5a2b" />
          <stop offset="50%" stopColor="#a0693a" />
          <stop offset="100%" stopColor="#6b3f1f" />
        </linearGradient>
        <linearGradient id="desk-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5c3418" />
          <stop offset="100%" stopColor="#3d220f" />
        </linearGradient>
        <pattern id="wood-grain" width="200" height="20" patternUnits="userSpaceOnUse">
          <rect width="200" height="20" fill="url(#desk-top)" />
          <path d="M0 5 Q 50 3, 100 5 T 200 5" stroke="#6b3f1f" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M0 12 Q 60 10, 120 12 T 200 12" stroke="#6b3f1f" strokeWidth="0.4" fill="none" opacity="0.3" />
          <path d="M0 18 Q 40 16, 80 18 T 200 18" stroke="#6b3f1f" strokeWidth="0.3" fill="none" opacity="0.25" />
        </pattern>
        {/* Room background */}
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8e0d4" />
          <stop offset="100%" stopColor="#c9bfae" />
        </linearGradient>
      </defs>

      {/* Background / floor */}
      <rect width="800" height="500" fill="url(#bg-grad)" />
      <rect x="0" y="340" width="800" height="160" fill="#a89680" opacity="0.5" />

      {/* Desk side (front face) */}
      <rect x="80" y="200" width="640" height="180" fill="url(#desk-side)" rx="4" />

      {/* Desk legs */}
      <rect x="100" y="360" width="30" height="110" fill="#3d220f" />
      <rect x="670" y="360" width="30" height="110" fill="#3d220f" />

      {/* Desk top (angled perspective) */}
      <polygon points="60,200 740,200 780,150 100,150" fill="url(#desk-top)" />
      <polygon points="60,200 740,200 780,150 100,150" fill="url(#wood-grain)" opacity="0.6" />

      {/* Top surface — flat view for condition issues to be placed on */}
      <rect x="80" y="160" width="640" height="50" fill="url(#desk-top)" opacity="0.9" />
      <rect x="80" y="160" width="640" height="50" fill="url(#wood-grain)" opacity="0.5" />

      {/* Subtle shadow under desk */}
      <ellipse cx="400" cy="475" rx="320" ry="10" fill="#000" opacity="0.2" />

      {/* Wood grain lines on the top face */}
      <g opacity="0.3">
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d={`M 80 ${210 + i * 20} Q 300 ${205 + i * 20} 500 ${212 + i * 20} T 720 ${210 + i * 20}`}
            stroke="#5c3418"
            strokeWidth="0.8"
            fill="none"
          />
        ))}
      </g>

      {/* ======== CONDITION ISSUES (drawn directly on desk top) ======== */}

      {/* Scratch 1 — long diagonal mark */}
      {revealedIds.has('scratch-1') && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <line x1="195" y1="240" x2="340" y2="260" stroke="#2d1810" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="200" y1="242" x2="335" y2="258" stroke="#6b3f1f" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        </motion.g>
      )}

      {/* Dent 1 — circular impact */}
      {revealedIds.has('dent-1') && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ellipse cx="488" cy="228" rx="28" ry="22" fill="#5c3418" opacity="0.7" />
          <ellipse cx="488" cy="228" rx="20" ry="15" fill="#3d220f" opacity="0.5" />
          <ellipse cx="484" cy="224" rx="8" ry="6" fill="#8b5a2b" opacity="0.4" />
        </motion.g>
      )}

      {/* Stain 1 — coffee-like discoloration */}
      {revealedIds.has('stain-1') && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path
            d="M 580 290 Q 605 278, 640 285 Q 675 295, 680 320 Q 670 350, 630 352 Q 590 348, 578 325 Q 572 305, 580 290 Z"
            fill="#2d1810"
            opacity="0.45"
          />
          <path
            d="M 595 300 Q 620 293, 650 300 Q 665 315, 655 335 Q 630 342, 605 335 Q 590 320, 595 300 Z"
            fill="#1a0e08"
            opacity="0.35"
          />
        </motion.g>
      )}

      {/* Edge wear — rounded/worn edge on the left */}
      {revealedIds.has('edge-1') && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path d="M 80 320 Q 100 315, 140 318 Q 180 325, 210 322 L 210 340 L 80 340 Z" fill="#3d220f" opacity="0.55" />
          <path d="M 85 325 Q 130 320, 200 326" stroke="#2d1810" strokeWidth="1.5" fill="none" opacity="0.6" />
        </motion.g>
      )}

      {/* Corner damage — chip on the front edge */}
      {revealedIds.has('corner-1') && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <polygon points="360,370 420,365 435,378 425,395 380,400 355,390" fill="#1a0e08" opacity="0.7" />
          <polygon points="368,375 415,372 425,383 418,392 382,395 365,385" fill="#3d220f" opacity="0.6" />
          <line x1="370" y1="378" x2="420" y2="388" stroke="#2d1810" strokeWidth="0.8" />
        </motion.g>
      )}
    </svg>
  );
}

export default function DeskConditionDemo() {
  const [phase, setPhase] = useState('idle'); // idle | scanning | done
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [focusedIssue, setFocusedIssue] = useState(null);
  const [progress, setProgress] = useState(0);

  const runScan = () => {
    setPhase('scanning');
    setRevealedIds(new Set());
    setFocusedIssue(null);
    setProgress(0);

    CONDITION_ISSUES.forEach((issue, i) => {
      setTimeout(() => {
        setRevealedIds((prev) => new Set([...prev, issue.id]));
        setProgress(Math.round(((i + 1) / CONDITION_ISSUES.length) * 100));
      }, 600 + i * 700);
    });

    setTimeout(() => {
      setPhase('done');
      setFocusedIssue(CONDITION_ISSUES[0]);
    }, 600 + CONDITION_ISSUES.length * 700 + 400);
  };

  const reset = () => {
    setPhase('idle');
    setRevealedIds(new Set());
    setFocusedIssue(null);
    setProgress(0);
  };

  // Auto-cycle focused issue after scan done
  useEffect(() => {
    if (phase !== 'done') return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % CONDITION_ISSUES.length;
      setFocusedIssue(CONDITION_ISSUES[i]);
    }, 3500);
    return () => clearInterval(interval);
  }, [phase]);

  const overallScore = phase === 'done' ? 3 : null;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
      {/* Desk illustration */}
      <div className="absolute inset-0">
        <DeskSVG revealedIds={revealedIds} scanning={phase === 'scanning'} />
      </div>

      {/* LiDAR grid overlay while scanning */}
      {phase === 'scanning' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#22d3ee30 1px, transparent 1px), linear-gradient(90deg, #22d3ee30 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Scanning beam */}
      {phase === 'scanning' && (
        <motion.div
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: (CONDITION_ISSUES.length * 0.7) + 0.6, ease: 'linear' }}
          className="absolute left-0 right-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.5), transparent)',
            boxShadow: '0 0 40px rgba(34, 211, 238, 0.6)',
          }}
        />
      )}

      {/* Bounding boxes over issues (SVG overlay aligned to image) */}
      {(phase === 'scanning' || phase === 'done') && (
        <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
          <AnimatePresence>
            {CONDITION_ISSUES.filter((i) => revealedIds.has(i.id)).map((issue) => {
              const isFocused = focusedIssue?.id === issue.id;
              const color = severityColor[issue.severity];
              const x = issue.x * 800;
              const y = issue.y * 500;
              const w = issue.w * 800;
              const h = issue.h * 500;
              return (
                <motion.g
                  key={issue.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={`${color}20`}
                    stroke={color}
                    strokeWidth={isFocused ? 3 : 2}
                    strokeDasharray={isFocused ? '0' : '4 3'}
                    rx={3}
                  >
                    {isFocused && (
                      <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1s" repeatCount="indefinite" />
                    )}
                  </rect>
                  {/* Label */}
                  <g>
                    <rect
                      x={x}
                      y={y - 18}
                      width={issue.type.length * 6.5 + 20}
                      height={16}
                      fill="#0f172a"
                      stroke={color}
                      strokeWidth={1}
                      rx={3}
                    />
                    <circle cx={x + 7} cy={y - 10} r={2.5} fill={color}>
                      <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <text x={x + 14} y={y - 6} fontSize={9} fontWeight={700} fill="white">
                      {issue.type.toUpperCase()}
                    </text>
                  </g>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      )}

      {/* HUD: Title */}
      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold">Wooden Desk — LiDAR Condition Scan</span>
        </div>
        <p className="text-[10px] text-white/60 mt-0.5">AI identifies surface defects and assesses severity</p>
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 flex gap-2">
        {phase === 'idle' && (
          <button
            onClick={runScan}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            Analyse Condition
          </button>
        )}
        {phase === 'done' && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Progress during scan */}
      {phase === 'scanning' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 right-3 w-60 bg-slate-900/90 backdrop-blur-md border border-cyan-400/30 rounded-lg p-3 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-cyan-400">Analysing Surface</span>
            <span className="ml-auto text-xs font-mono">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
            />
          </div>
          <div className="mt-2 text-[10px] text-white/60">
            Defects found: <span className="text-cyan-400 font-semibold">{revealedIds.size}</span> / {CONDITION_ISSUES.length}
          </div>
        </motion.div>
      )}

      {/* Inspection panel */}
      <AnimatePresence mode="wait">
        {phase === 'done' && focusedIssue && (
          <motion.div
            key={focusedIssue.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-3 top-16 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-white shadow-2xl"
            style={{ borderColor: `${severityColor[focusedIssue.severity]}60` }}
          >
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${severityColor[focusedIssue.severity]}30` }}
              >
                <AlertTriangle className="w-4 h-4" style={{ color: severityColor[focusedIssue.severity] }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: severityColor[focusedIssue.severity] }}>
                  {focusedIssue.severity} Defect
                </div>
                <div className="text-sm font-bold">{focusedIssue.type}</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[10px] uppercase text-white/50 font-semibold mb-1 flex items-center gap-1.5">
                <Ruler className="w-3 h-3" /> LiDAR Measurement
              </div>
              <div className="text-xs text-white/90 font-mono">{focusedIssue.measurement}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase text-white/50 font-semibold mb-1">AI Finding</div>
              <div className="text-xs text-white/80 leading-relaxed">{focusedIssue.finding}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final summary */}
      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wide text-white/60 font-semibold">Overall Condition</div>
              <div className="text-sm font-bold">
                {overallScore}/5 · Fair — {CONDITION_ISSUES.length} defects found
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      {phase !== 'idle' && (
        <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white/80">
          <div className="font-semibold text-white mb-1">Severity</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor.minor }} /> Minor</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor.moderate }} /> Moderate</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor.major }} /> Major</span>
          </div>
        </div>
      )}
    </div>
  );
}