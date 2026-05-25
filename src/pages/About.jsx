import React, { Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SectionFallback from '@/components/landing/SectionFallback';
import AboutHero from '@/components/landing/about/AboutHero';
import AboutStory from '@/components/landing/about/AboutStory';
import AboutValues from '@/components/landing/about/AboutValues';
import AboutStats from '@/components/landing/about/AboutStats';
import AboutCTA from '@/components/landing/about/AboutCTA';

export default function About() {
  useEffect(() => {
    document.title = 'About — AssetStack';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <LandingNav />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutStats />
        <AboutValues />
        <AboutCTA />
      </main>
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}