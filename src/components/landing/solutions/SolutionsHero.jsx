import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function SolutionsHero() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-end"
      style={{ background: '#1925aa', minHeight: '78vh' }}
    >
      {/* Background image */}
      <img
        src="https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/62fc3874f_oslo-norway-night-view-embankment-and-residentia-2026-03-19-08-14-36-utc.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(25,37,170,0.85) 0%, rgba(25,37,170,0.55) 60%, rgba(10,15,100,0.85) 100%)',
        }}
      />

      <div className="relative z-[2] px-5 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24 max-w-[1280px] w-full mx-auto">
        <p className="text-white/70 text-[12px] font-semibold uppercase tracking-[0.18em] mb-5">
          Solutions
        </p>
        <h1
          className="text-white font-normal leading-[0.95] tracking-[-0.01em] max-w-[20ch]"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 'clamp(2.2rem, 7vw, 5.6rem)',
          }}
        >
          Infrastructure problems<br />require intelligent solutions.
        </h1>
        <p className="mt-6 max-w-2xl text-white/85 text-[15px] md:text-[17px] leading-relaxed">
          AssetStack combines inspections, digital twins, IoT sensor data and
          machine learning to solve the most complex infrastructure asset
          management challenges.
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