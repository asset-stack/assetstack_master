import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Brain, Wrench, ShieldCheck, Play, Pause } from 'lucide-react';
import TourFrameScan from './tour/TourFrameScan';
import TourFramePredict from './tour/TourFramePredict';
import TourFrameDispatch from './tour/TourFrameDispatch';
import TourFrameSavings from './tour/TourFrameSavings';

const STEPS = [
{ id: 0, icon: Camera, label: 'Scan', title: 'Upload one photo. Find every defect.', text: 'Vision models flag cracks, corrosion, dents, and damage with bounding boxes — in seconds.', Frame: TourFrameScan },
{ id: 1, icon: Brain, label: 'Predict', title: 'Forecast failures 90 days out.', text: 'Sensor history + condition reports converge into a single failure probability per asset.', Frame: TourFramePredict },
{ id: 2, icon: Wrench, label: 'Dispatch', title: 'Auto-route the right work order.', text: 'AI picks the right technician, parts, and shift window — and pushes it to their phone.', Frame: TourFrameDispatch },
{ id: 3, icon: ShieldCheck, label: 'Prove', title: 'Log the savings. Sign the trail.', text: 'Every avoided breakdown becomes an audit-ready ledger row your CFO can verify.', Frame: TourFrameSavings }];


export default function ProductTour() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
    }, 5500);
    return () => clearInterval(intervalRef.current);
  }, [paused]);

  const ActiveFrame = STEPS[active].Frame;

  return (
    <section id="tour" className="py-20 md:py-32 bg-slate-50/40 border-y border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-16">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary hidden">The 60-second product tour</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            From one photo to{' '}
            <span className="font-serif italic font-medium text-primary">verified savings.</span>
          </h2>
          <p className="mt-4 text-[17px] text-slate-600 leading-[1.55] text-pretty">
            Watch the entire AssetStack workflow in under a minute — the same loop that runs daily across construction, mining, fleet, and rail.
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-10">
          {/* Step rail */}
          <div className="space-y-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = active === i;
              return (
                <button
                  key={s.id}
                  onClick={() => {setActive(i);setPaused(true);}}
                  className={`relative w-full text-left rounded-xl border transition-all duration-300 p-4 overflow-hidden ${
                  isActive ?
                  'bg-white border-primary/25 elevation-2' :
                  'bg-white/40 border-slate-100 hover:border-slate-200 hover:bg-white'}`
                  }>
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`
                    }>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                          0{i + 1} · {s.label}
                        </span>
                      </div>
                      <div className={`mt-1 font-semibold text-[14px] tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                        {s.title}
                      </div>
                      {isActive &&
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
                        
                          {s.text}
                        </motion.p>
                      }
                    </div>
                  </div>
                  {isActive && !paused &&
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5.5, ease: 'linear' }}
                    style={{ transformOrigin: '0% 50%' }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />

                  }
                </button>);

            })}

            <button
              onClick={() => setPaused((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 mt-2 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
              
              {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {paused ? 'Resume tour' : 'Pause auto-play'}
            </button>
          </div>

          {/* Frame canvas */}
          <div className="relative">
            <div className="relative rounded-2xl border border-slate-200 bg-white elevation-3 overflow-hidden min-h-[480px] md:min-h-[560px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0">
                  
                  <ActiveFrame />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>);

}