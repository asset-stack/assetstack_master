import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function ComplianceHero() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-end"
      style={{ background: '#1925aa', minHeight: '78vh' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12), transparent 45%), radial-gradient(circle at 85% 80%, rgba(120,140,255,0.18), transparent 55%), linear-gradient(180deg, rgba(25,37,170,0.0) 0%, rgba(10,15,100,0.5) 100%)',
        }}
      />

      <div className="relative z-[2] px-5 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24 max-w-[1280px] w-full mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
          <span className="text-white/85 text-[11px] font-semibold uppercase tracking-[0.16em]">
            Compliance & Technology
          </span>
        </div>
        <h1
          className="text-white font-normal leading-[0.95] tracking-[-0.01em] max-w-[22ch]"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 'clamp(2.2rem, 7vw, 5.6rem)',
          }}
        >
          Technology built for<br />infrastructure intelligence.
        </h1>
        <p className="mt-6 max-w-2xl text-white/85 text-[15px] md:text-[17px] leading-relaxed">
          AssetStack combines machine learning, digital twin modelling and real-time data pipelines on
          an enterprise-grade, audit-ready foundation — designed for the teams procurement signs off.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/Product">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-[#1925aa] h-11 px-6 text-[14px] font-semibold rounded-md"
            >
              Explore the platform <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
          <a
            href="/Landing#contact"
            className="inline-flex items-center text-white/85 hover:text-white text-[13px] font-medium px-4 h-11 border border-white/40 hover:border-white/80 rounded-md transition-colors"
          >
            Book a demo
          </a>
        </div>
      </div>
    </section>
  );
}