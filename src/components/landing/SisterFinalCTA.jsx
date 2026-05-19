import React from 'react';
import { Calendar, Download } from 'lucide-react';

export default function SisterFinalCTA() {
  return (
    <section className="bg-slate-950 text-white py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-950 to-purple-950" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 16px)',
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-indigo-500/30 blur-[140px]" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
          Ready to Transform Your Asset Management?
        </h2>
        <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto mb-10">
          Discover how AssetStack helps infrastructure operators predict failures, optimise maintenance and manage assets at scale.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/PrintLanding"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Platform Overview
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            <Calendar className="w-4 h-4" /> Book Live Demo
          </a>
        </div>
      </div>
    </section>
  );
}