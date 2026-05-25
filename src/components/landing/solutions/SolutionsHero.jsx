import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import HeroDitherCanvas from '@/components/landing/HeroDitherCanvas';

const HERO_IMG =
  'https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/75486db29_perth-australia-2026-03-24-14-06-21-utc.jpg';

export default function SolutionsHero() {
  const titleRef = useRef(null);
  const taglineRef = useRef(null);

  useEffect(() => {
    gsap.set(titleRef.current, { y: '110%' });
    gsap.set(taglineRef.current, { opacity: 0, y: 14 });

    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(titleRef.current, { y: '0%', duration: 1.05, ease: 'expo.out' }).to(
      taglineRef.current,
      { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      '-=0.45'
    );

    return () => tl.kill();
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden flex flex-col justify-end"
      style={{ background: '#1925aa', height: '100vh', minHeight: 640 }}
      aria-labelledby="solutions-hero-heading"
    >
      {/* WebGL dither canvas — same duotone effect as the landing hero */}
      <HeroDitherCanvas imageUrl={HERO_IMG} />

      {/* Bottom fade for legibility */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 55%, rgba(10,15,100,0.45) 100%)',
        }}
      />

      {/* Hero content — bottom-aligned editorial layout */}
      <div className="relative z-[4] px-5 md:px-10 pb-12 md:pb-20 max-w-[1480px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-[0.9375rem] lg:items-end">
          {/* Title */}
          <div className="lg:col-span-9 overflow-hidden lg:self-end lg:-mb-[0.18em] lg:translate-y-24">
            <h1
              id="solutions-hero-heading"
              ref={titleRef}
              className="text-white font-normal leading-[0.92] tracking-[-0.01em] block pt-1 text-sm"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 'clamp(2.4rem, 10.4vw, 8rem)',
              }}
            >
              Intelligent Solutions<br />for Infrastructure.
            </h1>
          </div>

          {/* Tagline + CTAs */}
          <div
            ref={taglineRef}
            className="lg:col-span-4 lg:col-start-9 lg:self-end mt-6 lg:mt-0"
          >
            <p
              className="text-white/85"
              style={{
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                lineHeight: 1.5,
              }}
            >
              AssetStack combines inspections, digital twins, IoT sensor data and machine learning to solve the most complex infrastructure asset management challenges.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/Product">
                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-[#1925aa] h-11 px-6 text-[14px] font-semibold rounded-md"
                >
                  Explore the platform <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
              <a
                href="/Contact"
                className="inline-flex items-center gap-1.5 text-white/85 hover:text-white text-[13px] font-medium px-3 h-11 border border-white/40 hover:border-white/80 rounded-md transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Book a demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}