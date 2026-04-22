import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Brain, ClipboardCheck, GraduationCap, ChevronDown, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    title: 'Upload a Scan',
    desc: 'Upload a LiDAR mesh (.obj / .gltf / .glb) or a single image. Demo scans use the built-in library scene.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Camera,
    title: 'Capture 8 Frames',
    desc: 'The app auto-renders 8 viewpoints (front, back, sides, top-down, obliques) and saves each as a JPEG.',
    color: 'from-purple-500 to-fuchsia-500',
  },
  {
    icon: Brain,
    title: 'Run AI Analysis',
    desc: 'Each frame is sent to a vision model that detects defects (cracks, corrosion, wear) with bounding boxes & severity.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: ClipboardCheck,
    title: 'Review & Correct',
    desc: 'Approve, reject, or correct each AI finding. Your feedback becomes training data.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: GraduationCap,
    title: 'Retrain & Improve',
    desc: 'Corrected samples feed the ML model. Accuracy improves with every review cycle.',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-xl mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900">How Scan Analysis works</h3>
            <p className="text-xs text-slate-500">5 steps from scan upload to a smarter AI model</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative bg-white rounded-lg p-3 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${step.color} flex items-center justify-center shadow`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">STEP {i + 1}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-3 text-[11px] text-slate-500 bg-white/60 rounded-lg px-3 py-2 border border-white">
                💡 <span className="font-semibold text-slate-700">Tip:</span> Select any scan below to auto-start frame capture. Click a frame to see its detected anomalies overlaid on the image.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}