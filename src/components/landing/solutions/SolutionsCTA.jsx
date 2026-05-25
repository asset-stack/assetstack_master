import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function SolutionsCTA() {
  return (
    <section className="relative py-20 lg:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10">
        <div
          className="relative rounded-3xl overflow-hidden p-10 md:p-16"
          style={{ background: '#1925aa' }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 12% 20%, rgba(255,255,255,0.12), transparent 45%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.06), transparent 55%)',
            }}
          />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">
                Get started
              </p>
              <h3
                className="text-white font-normal leading-[1.05] tracking-[-0.01em]"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 'clamp(1.8rem, 3.6vw, 3rem)',
                }}
              >
                Transform your<br />asset operations.
              </h3>
            </div>
            <div className="lg:justify-self-end">
              <p className="text-white/80 text-[15px] leading-relaxed max-w-md mb-6">
                Discover how AssetStack helps infrastructure operators predict
                failures, optimise maintenance and manage complex asset networks.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/Product">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90 text-[#1925aa] h-11 px-6 text-[14px] font-semibold rounded-md"
                  >
                    Solution overview <ArrowRight className="w-4 h-4 ml-1.5" />
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
          </div>
        </div>
      </div>
    </section>
  );
}