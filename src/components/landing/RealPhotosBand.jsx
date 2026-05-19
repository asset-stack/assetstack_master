import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';

// Wide dark block: "Real Photos. Genuine Issues. Engineering-Grade."
export default function RealPhotosBand() {
  return (
    <section className="bg-slate-950 text-white py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 18px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] font-medium uppercase tracking-wider mb-6">
            <Camera className="w-3.5 h-3.5" /> Computer Vision
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
            Real Photos. Genuine Issues.
            <br />
            <span className="text-indigo-300">Engineering-Grade.</span>
          </h2>
          <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto">
            Every finding is grounded in an actual asset photo, reviewed against engineering criteria, and traceable end-to-end.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-3 gap-3 md:gap-5 max-w-4xl mx-auto">
          {[
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=70',
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=70',
            'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=600&q=70',
          ].map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10"
            >
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}