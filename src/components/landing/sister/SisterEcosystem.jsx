import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Search, Database, Brain, FileText, BarChart3 } from 'lucide-react';

const steps = [
  { icon: Search, label: 'Inspections' },
  { icon: Database, label: 'Data' },
  { icon: Brain, label: 'AI' },
  { icon: FileText, label: 'Reports' },
  { icon: BarChart3, label: 'Outcomes' },
];

const THRESHOLDS = [0, 0.2, 0.4, 0.6, 0.8];
const STEP_WINDOW = 0.18;

export default function SisterEcosystem() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const [rawProgress, setRawProgress] = useState(0);

  useEffect(() => {
    return smoothProgress.onChange((v) => setRawProgress(v));
  }, [smoothProgress]);

  const stepActivation = (i) => Math.min(1, Math.max(0, (rawProgress - THRESHOLDS[i]) / STEP_WINDOW));
  const lineActivation = (i) => {
    const t = THRESHOLDS[i] + STEP_WINDOW * 0.5;
    return Math.min(1, Math.max(0, (rawProgress - t) / (STEP_WINDOW * 0.8)));
  };

  return (
    <div ref={sectionRef} style={{ height: '400vh', background: '#2200FF' }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden" style={{ background: '#2200FF' }}>
        <div className="max-w-5xl mx-auto w-full px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="font-black leading-tight tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#E8E8E4', letterSpacing: '-0.02em' }}
            >
              One Connected Ecosystem
            </h2>
            <p className="mt-3 text-sm" style={{ color: 'rgba(232,232,228,0.6)' }}>From Field to Boardroom</p>
          </motion.div>
          <div className="flex items-center justify-center">
            {steps.map((step, i) => {
              const act = stepActivation(i);
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-3" style={{ minWidth: 80 }}>
                    <div
                      style={{
                        width: 64 + act * 20,
                        height: 64 + act * 20,
                        borderRadius: 16,
                        background: `rgba(255,255,255,${0.12 + act * 0.88})`,
                        border: `1.5px solid rgba(255,255,255,${0.2 + act * 0.8})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.05s linear',
                        boxShadow: act > 0.3 ? `0 0 ${act * 40}px rgba(255,255,255,${act * 0.25})` : 'none',
                      }}
                    >
                      <Icon
                        style={{
                          width: 24 + act * 6, height: 24 + act * 6,
                          color: act > 0.5 ? '#2200FF' : '#E8E8E4',
                          transition: 'color 0.1s linear',
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{
                        color: act > 0.5 ? '#E8E8E4' : 'rgba(232,232,228,0.5)',
                        opacity: 0.5 + act * 0.5,
                        transition: 'color 0.1s linear',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="relative hidden sm:block mx-2"
                      style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 2, flexShrink: 0 }}
                    >
                      <div
                        style={{
                          position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 2,
                          background: '#ffffff',
                          width: `${lineActivation(i) * 100}%`,
                          transition: 'width 0.05s linear',
                          boxShadow: lineActivation(i) > 0.1 ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}