import React, { lazy, Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import SisterHero from '@/components/landing/SisterHero';
import ConnectedEcosystem from '@/components/landing/ConnectedEcosystem';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import SectionFallback from '@/components/landing/SectionFallback';
import LiveCounters from '@/components/landing/LiveCounters';
import StickyCTA from '@/components/landing/StickyCTA';

// Below-the-fold — code-split for fast TTI
const LogoCloud = lazy(() => import('@/components/landing/LogoCloud'));
const PersonaCards = lazy(() => import('@/components/landing/PersonaCards'));
const MechanismSection = lazy(() => import('@/components/landing/MechanismSection'));
const ProductTour = lazy(() => import('@/components/landing/ProductTour'));
const RealPhotosBand = lazy(() => import('@/components/landing/RealPhotosBand'));
const InspectorPreviewBlock = lazy(() => import('@/components/landing/InspectorPreviewBlock'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const WhatsNewShowcase = lazy(() => import('@/components/landing/WhatsNewShowcase'));
const SavingsProof = lazy(() => import('@/components/landing/SavingsProof'));
const CoreCapabilities = lazy(() => import('@/components/landing/CoreCapabilities'));
const FAQ = lazy(() => import('@/components/landing/FAQ'));
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

        {/* 2 — One Connected Ecosystem */}
        <ConnectedEcosystem />

        {/* 3 — Trust badges / logo strip */}
        <Suspense fallback={<SectionFallback minHeight={120} />}>
          <LogoCloud />
        </Suspense>

        {/* 4 — Stats / counters */}
        <LiveCounters />

        {/* 5 — Persona / use-case grid */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <PersonaCards />
        </Suspense>

        {/* 6 — Dark wide block (mechanism) */}
        <Suspense fallback={<SectionFallback minHeight={640} />}>
          <MechanismSection />
        </Suspense>

        {/* 7 — "From everywhere..." dashboard preview */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <ProductTour />
        </Suspense>

        {/* 8 — Black wide block: Real Photos. Engineering-Grade. */}
        <Suspense fallback={<SectionFallback minHeight={580} />}>
          <RealPhotosBand />
        </Suspense>

        {/* 9 — "Everything inspectors notice..." narrow image */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <InspectorPreviewBlock />
        </Suspense>

        {/* 10 — Pricing card */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <PricingSection />
        </Suspense>

        {/* 11 — "The AI operating system for physical assets" + grid */}
        <Suspense fallback={<SectionFallback minHeight={720} />}>
          <WhatsNewShowcase />
        </Suspense>

        {/* 12 — Mechanism / dashboard grid (savings proof dashboards) */}
        <Suspense fallback={<SectionFallback minHeight={680} />}>
          <SavingsProof />
        </Suspense>

        {/* 13 — Built for... 3 small cards (core capabilities) */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <CoreCapabilities />
        </Suspense>

        {/* 14 — FAQ */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <FAQ />
        </Suspense>

        {/* 15 — Dark CTA band */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <SisterFinalCTA />
        </Suspense>
      </main>

      {/* 16 — Footer */}
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}