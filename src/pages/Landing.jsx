import React, { lazy, Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import SisterHero from '@/components/landing/SisterHero';
import ConnectedEcosystem from '@/components/landing/ConnectedEcosystem';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import SectionFallback from '@/components/landing/SectionFallback';
import StickyCTA from '@/components/landing/StickyCTA';

// Below-the-fold — code-split for fast TTI.
// Order matches sister site assetstackai.com.au exactly.
const CoreCapabilities = lazy(() => import('@/components/landing/CoreCapabilities'));
const DigitalTwinVideo = lazy(() => import('@/components/landing/DigitalTwinVideo'));
const SisterStats = lazy(() => import('@/components/landing/SisterStats'));
const SisterIndustries = lazy(() => import('@/components/landing/SisterIndustries'));
const AIEngineSection = lazy(() => import('@/components/landing/AIEngineSection'));
const SisterFinalCTA = lazy(() => import('@/components/landing/SisterFinalCTA'));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter'));

export default function Landing() {
  useEffect(() => {
    document.title = 'AssetStack — AI Infrastructure Intelligence Platform';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <ScrollProgressBar />
      <LandingNav />
      <StickyCTA />

      <main>
        {/* 1 — Hero */}
        <SisterHero />

        {/* 2 — One Connected Ecosystem (From Field to Boardroom) */}
        <ConnectedEcosystem />

        {/* 3 — Core Capabilities (Built for Complex Assets. Engineered for Scale.) */}
        <Suspense fallback={<SectionFallback minHeight={640} />}>
          <CoreCapabilities />
        </Suspense>

        {/* 4 — Digital Twin video */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <DigitalTwinVideo />
        </Suspense>

        {/* 5 — Stats: 90% / 32% / 450+ / 24/7 */}
        <Suspense fallback={<SectionFallback minHeight={220} />}>
          <SisterStats />
        </Suspense>

        {/* 6 — Industries (Proven Across Industries) */}
        <Suspense fallback={<SectionFallback minHeight={720} />}>
          <SisterIndustries />
        </Suspense>

        {/* 7 — AI Engine for Infrastructure Intelligence */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <AIEngineSection />
        </Suspense>

        {/* 8 — Final CTA (Ready to Transform...) */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <SisterFinalCTA />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}