import React, { lazy, Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import SisterHero from '@/components/landing/SisterHero';
import ConnectedEcosystem from '@/components/landing/ConnectedEcosystem';
import CoreCapabilities from '@/components/landing/CoreCapabilities';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import SectionFallback from '@/components/landing/SectionFallback';
import LiveCounters from '@/components/landing/LiveCounters';
import StickyCTA from '@/components/landing/StickyCTA';

// Below-the-fold — code-split for fast TTI
const AIEngineSection = lazy(() => import('@/components/landing/AIEngineSection'));
const SavingsProof = lazy(() => import('@/components/landing/SavingsProof'));
const ROICalculator = lazy(() => import('@/components/landing/ROICalculator'));
const SisterIndustries = lazy(() => import('@/components/landing/SisterIndustries'));
const SecuritySection = lazy(() => import('@/components/landing/SecuritySection'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const FAQ = lazy(() => import('@/components/landing/FAQ'));
const SisterFinalCTA = lazy(() => import('@/components/landing/SisterFinalCTA'));
const ContactSection = lazy(() => import('@/components/landing/ContactSection'));
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
        {/* 1 — Hero (sister-site style, current theme) */}
        <SisterHero />

        {/* 2 — One Connected Ecosystem flow */}
        <ConnectedEcosystem />

        {/* 3 — Live counters: instant proof density */}
        <LiveCounters />

        {/* 4 — Core Capabilities (dark) */}
        <CoreCapabilities />

        {/* 5 — Verified savings proof */}
        <Suspense fallback={<SectionFallback minHeight={680} />}>
          <SavingsProof />
        </Suspense>

        {/* 6 — ROI calculator */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <ROICalculator />
        </Suspense>

        {/* 7 — AI Engine */}
        <Suspense fallback={<SectionFallback minHeight={560} />}>
          <AIEngineSection />
        </Suspense>

        {/* 8 — Industries */}
        <Suspense fallback={<SectionFallback minHeight={680} />}>
          <SisterIndustries />
        </Suspense>

        {/* 9 — Security & trust */}
        <Suspense fallback={<SectionFallback minHeight={460} />}>
          <SecuritySection />
        </Suspense>

        {/* 10 — Pricing */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <PricingSection />
        </Suspense>

        {/* 11 — FAQ */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <FAQ />
        </Suspense>

        {/* 12 — Final dark CTA */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <SisterFinalCTA />
        </Suspense>

        {/* 13 — Contact form */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <ContactSection />
        </Suspense>
      </main>

      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}