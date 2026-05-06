import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SAMPLE_FINDINGS = [
  { type: 'Crack', severity: 'major', confidence: 92, color: 'red',    bbox: { x: 22, y: 35, w: 28, h: 14 } },
  { type: 'Corrosion', severity: 'moderate', confidence: 87, color: 'amber', bbox: { x: 58, y: 18, w: 22, h: 18 } },
  { type: 'Water damage', severity: 'minor', confidence: 76, color: 'blue', bbox: { x: 12, y: 70, w: 30, h: 20 } },
];

const SEVERITY_BADGE = {
  minor: 'bg-blue-100 text-blue-700',
  moderate: 'bg-amber-100 text-amber-700',
  major: 'bg-red-100 text-red-700',
  critical: 'bg-red-200 text-red-800',
};

export default function ScanDemo() {
  const [stage, setStage] = useState('idle'); // idle | scanning | results
  const [revealed, setRevealed] = useState(0);

  const start = () => {
    setStage('scanning');
    setRevealed(0);
    setTimeout(() => {
      setStage('results');
      SAMPLE_FINDINGS.forEach((_, i) => {
        setTimeout(() => setRevealed(i + 1), 400 * (i + 1));
      });
    }, 2000);
  };

  const reset = () => { setStage('idle'); setRevealed(0); };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-stretch">
      {/* Image with overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] border border-slate-200 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=900&q=80"
          alt="Concrete asset scan"
          className="w-full h-full object-cover"
        />

        {/* Scanning line */}
        <AnimatePresence>
          {stage === 'scanning' && (
            <>
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: 'linear' }}
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.8)]"
              />
              <div className="absolute inset-0 bg-emerald-500/5" />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" /> Analyzing pixels…
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Bounding boxes */}
        <AnimatePresence>
          {stage === 'results' && SAMPLE_FINDINGS.slice(0, revealed).map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute border-2 rounded ${
                f.color === 'red' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' :
                f.color === 'amber' ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]' :
                'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)]'
              }`}
              style={{
                left: `${f.bbox.x}%`, top: `${f.bbox.y}%`,
                width: `${f.bbox.w}%`, height: `${f.bbox.h}%`,
              }}
            >
              <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap ${
                f.color === 'red' ? 'bg-red-500' : f.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
              }`}>
                {f.type} · {f.confidence}%
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Idle overlay */}
        {stage === 'idle' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <Button onClick={start} size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-2xl">
              <Scan className="w-4 h-4 mr-2" /> Run AI scan on this image
            </Button>
          </div>
        )}
      </div>

      {/* Results panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-slate-900">AI Findings</h4>
          <Badge variant="outline" className="font-mono text-[10px]">model: gemini_3_1_pro</Badge>
        </div>

        <div className="flex-1 space-y-2.5">
          {stage === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <Scan className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">Click "Run AI scan" to analyze this asset photo.</p>
            </div>
          )}

          {stage === 'scanning' && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-medium">Detecting anomalies…</p>
              <div className="mt-4 space-y-1.5 w-full max-w-xs">
                {['Loading vision model', 'Processing pixels', 'Classifying defects'].map((s, i) => (
                  <motion.div key={s} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }} className="text-xs text-slate-500 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {s}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {stage === 'results' && SAMPLE_FINDINGS.slice(0, revealed).map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/60"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                f.color === 'red' ? 'bg-red-100' : f.color === 'amber' ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
                <AlertTriangle className={`w-4 h-4 ${
                  f.color === 'red' ? 'text-red-600' : f.color === 'amber' ? 'text-amber-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900">{f.type}</span>
                  <Badge className={`${SEVERITY_BADGE[f.severity]} text-[9px] border-0`}>{f.severity}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">Confidence: <span className="font-mono font-semibold text-slate-700">{f.confidence}%</span></div>
              </div>
            </motion.div>
          ))}
        </div>

        {stage === 'results' && (
          <Button onClick={reset} variant="outline" size="sm" className="mt-4">
            Run another scan
          </Button>
        )}
      </div>
    </div>
  );
}