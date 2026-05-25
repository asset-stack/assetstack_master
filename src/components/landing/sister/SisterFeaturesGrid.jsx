import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Eye, Wifi, ClipboardCheck, BarChart3, Brain } from 'lucide-react';

import AssetTreePreview from '@/components/landing/industries/previews/AssetTreePreview';
import PredictionsPreview from '@/components/landing/industries/previews/PredictionsPreview';
import WorkOrdersPreview from '@/components/landing/industries/previews/WorkOrdersPreview';
import SensorsPreview from '@/components/landing/industries/previews/SensorsPreview';
import DashboardPreview from '@/components/landing/industries/previews/DashboardPreview';
import AssetMindPreview from '@/components/landing/industries/previews/AssetMindPreview';

const features = [
  { icon: Box, title: 'Digital Twin Infrastructure', description: 'Visualise infrastructure networks in 3D using LiDAR and geospatial modelling.', videoUrl: 'https://media.base44.com/videos/public/6a0a6a5d4d043b0e41a16d90/13454d771_DigitalTwin.mp4' },
  { icon: Eye, title: 'Predictive Maintenance', description: 'AI models detect anomalies and forecast equipment failures before they occur.', preview: PredictionsPreview },
  { icon: ClipboardCheck, title: 'Inspection Workflows', description: 'Capture structured inspection data using mobile workflows and automated tagging.', preview: WorkOrdersPreview },
  { icon: Wifi, title: 'IoT Sensor Integration', description: 'Connect sensor networks and operational systems to monitor asset health.', preview: SensorsPreview },
  { icon: BarChart3, title: 'Operational Analytics', description: 'Track asset performance, technician efficiency and maintenance trends.', preview: DashboardPreview },
  { icon: Brain, title: 'AI Decision Engine', description: 'Machine learning models analyse asset behaviour and recommend maintenance actions.', preview: AssetMindPreview },
];

export default function SisterFeaturesGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = features[activeIndex];

  return (
    <section className="py-20 lg:py-28 bg-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center mb-12 lg:mb-16"
        >
          <span
            className="inline-block px-0 pb-3 text-xs font-bold tracking-widest uppercase mb-4 border-b-2 border-white/30 text-white"
          >
            Core Capabilities
          </span>
          <h2
            className="font-sans leading-tight tracking-tight text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.02em', fontWeight: 600 }}
          >
            Built for Complex Assets.{' '}
            <span
              className="font-medium italic text-white/90"
              style={{ fontFamily: 'Fraunces, Georgia, serif', letterSpacing: '-0.01em' }}
            >
              Engineered for Scale.
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
          <div className="space-y-2">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const isActive = activeIndex === i;
              return (
                <motion.div
                  key={feature.title}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => setActiveIndex(i)}
                  className={`rounded-2xl border cursor-pointer overflow-hidden transition-colors duration-200 ${isActive ? 'bg-white border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white/10 border-transparent hover:bg-white/20'}`}
                  layout
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="px-5 py-4 flex items-center gap-3">
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2 }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10"
                        >
                          <Icon className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-white/80'}`}>
                      {feature.title}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="px-5 pb-4 text-xs leading-relaxed text-slate-600">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <div
            className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 lg:sticky lg:top-8 shadow-xl"
            style={{ aspectRatio: '16/10' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                {active.videoUrl ? (
                  <video 
                    src={active.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                ) : active.preview ? (
                  <active.preview />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}