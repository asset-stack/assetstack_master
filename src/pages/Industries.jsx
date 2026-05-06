import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import IndustriesHero from '@/components/landing/industries/IndustriesHero';
import IndustryIntro from '@/components/landing/industries/IndustryIntro';
import IndustrySection from '@/components/landing/industries/IndustrySection';
import IndustryPersonaliser from '@/components/landing/industries/IndustryPersonaliser';
import IndustryScrollSpy from '@/components/landing/industries/IndustryScrollSpy';
import PlatformShowcase from '@/components/landing/industries/PlatformShowcase';
import UnifiedPlatformBand from '@/components/landing/industries/UnifiedPlatformBand';
import IndustriesCTA from '@/components/landing/industries/IndustriesCTA';
import { INDUSTRIES } from '@/components/landing/industries/industriesData';

export default function Industries() {
  useEffect(() => {
    document.title = 'Industries — AssetStack';

    // Honour deep links like /Industries#councils on first paint
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <ScrollProgressBar />
      <LandingNav />
      <IndustryScrollSpy />

      <main>
        <IndustriesHero />

        {/* Personaliser sits between hero and intro */}
        <div className="flex justify-center -mt-4 mb-2 px-5">
          <IndustryPersonaliser />
        </div>

        <IndustryIntro />

        {INDUSTRIES.map((ind, i) => (
          <IndustrySection key={ind.slug} index={i} {...ind} />
        ))}

        {/* Platform showcase — show off everything inside the product */}
        <PlatformShowcase />

        <UnifiedPlatformBand />
        <IndustriesCTA />
      </main>

      <LandingFooter />
    </div>
  );
}