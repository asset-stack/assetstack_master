import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, CircleDot, RadioTower } from 'lucide-react';

const SIGNALS = [
  'Crane vibration anomaly → site shutdown risk rising',
  'Haul truck oil temperature trend → bearing inspection recommended',
  'EV van battery degradation → route reassignment suggested',
  'Rail switch actuator latency → passenger-impact risk escalated',
  'Transformer thermal image → preventive outage workflow created',
  'Conveyor belt wear pattern → parts order triggered',
  'Water valve pressure drop → leak investigation queued',
  'Factory compressor current spike → next-best-action generated',
];

export default function LiveIntelligenceStream() {
  return (
    <section className="py-16 md:py-24 bg-slate-950 text-white overflow-hidden border-y border-primary/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/25 px-3 py-1.5 text-xs font-bold text-blue-200">
              <RadioTower className="w-3.5 h-3.5" /> Live asset intelligence
            </div>
            <h2 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-[1.02]">
              Your assets are already talking.
              <span className="block text-primary">AssetStack translates.</span>
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Like the best intelligence products, the page now feels alive: constant signals, ranked risks, next-best actions, and proof that the system is working before the buyer signs in.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-primary/25 bg-primary/10 p-3 shadow-2xl shadow-primary/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-blue-400/10" />
            <div className="relative rounded-2xl bg-slate-950/90 border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2 font-bold"><Activity className="w-4 h-4 text-primary" /> Live Signal Stream</div>
                <span className="text-xs text-blue-200 bg-primary/15 px-2 py-1 rounded-full">+46/hr</span>
              </div>
              <div className="h-[330px] overflow-hidden relative">
                <motion.div
                  animate={{ y: ['0%', '-50%'] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="divide-y divide-white/10"
                >
                  {[...SIGNALS, ...SIGNALS].map((signal, i) => (
                    <div key={`${signal}-${i}`} className="flex items-center gap-3 px-5 py-4">
                      <CircleDot className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-slate-200 flex-1">{signal}</span>
                      <ArrowUpRight className="w-4 h-4 text-blue-300" />
                    </div>
                  ))}
                </motion.div>
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}