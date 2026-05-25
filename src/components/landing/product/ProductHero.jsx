import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function ProductHero() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-end"
      style={{ background: '#1925aa', minHeight: '78vh' }}
    >
      {/* Subtle radial accents */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 18% 30%, rgba(255,255,255,0.10), transparent 45%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.06), transparent 50%)',
        }}
      />
      {/* Bottom fade */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 55%, rgba(10,15,100,0.45) 100%)',
        }}
      />

      <div className="relative z-[2] px-5 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24 max-w-[1280px] w-full mx-auto">
        <p className="text-white/70 text-[12px] font-semibold uppercase tracking-[0.18em] mb-5">
          The Platform
        </p>
        <h1
          className="text-white font-normal leading-[0.95] tracking-[-0.01em] max-w-[18ch]"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 'clamp(2.2rem, 7.5vw, 5.8rem)',
          }}
        >
          The AssetStack<br />Platform.
        </h1>
        <p className="mt-6 max-w-2xl text-white/80 text-[15px] md:text-[17px] leading-relaxed">
          A unified infrastructure intelligence platform combining inspections,
          digital twins, IoT data and machine learning to predict failures and
          optimise asset operations.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#modules">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 text-[#1925aa] h-11 px-6 text-[14px] font-semibold rounded-md"
            >
              Explore platform modules <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
          <a
            href="/Landing#contact"
            className="inline-flex items-center gap-1.5 text-white/85 hover:text-white text-[13px] font-medium px-3 h-11 border border-white/40 hover:border-white/80 rounded-md transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> Book a demo
          </a>
        </div>
      </div>
    </section>
  );
}