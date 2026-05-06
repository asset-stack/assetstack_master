import React, { lazy, Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import SectionFallback from '@/components/landing/SectionFallback';

// Below-the-fold — code-split for fast TTI
const LogoCloud = lazy(() => import('@/components/landing/LogoCloud'));
const ProductTour = lazy(() => import('@/components/landing/ProductTour'));
const SavingsProof = lazy(() => import('@/components/landing/SavingsProof'));
const PersonaCards = lazy(() => import('@/components/landing/PersonaCards'));
const IndustryUseCases = lazy(() => import('@/components/landing/IndustryUseCases'));
const SecuritySection = lazy(() => import('@/components/landing/SecuritySection'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const FAQ = lazy(() => import('@/components/landing/FAQ'));
const FinalCTA = lazy(() => import('@/components/landing/FinalCTA'));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter'));

export default function Landing() {
  useEffect(() => {
    document.title = 'AssetStack — The AI operating system for physical assets';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <ScrollProgressBar />
      <LandingNav />

      <main>
        {/* 1 — Hero (the promise) */}
        <LandingHero />

        {/* 2 — Social proof strip */}
        <Suspense fallback={<SectionFallback minHeight={120} />}>
          <LogoCloud />
        </Suspense>

        {/* 3 — The 60-second product tour (the show) */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <ProductTour />
        </Suspense>

        {/* 4 — Proof: Verified Savings Ledger + customer outcomes */}
        <Suspense fallback={<SectionFallback minHeight={680} />}>
          <SavingsProof />
        </Suspense>

        {/* 5 — Personas: built for everyone who runs assets */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <PersonaCards />
        </Suspense>

        {/* 6 — Industries: one product, every shape */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <IndustryUseCases />
        </Suspense>

        {/* 7 — Security & trust */}
        <Suspense fallback={<SectionFallback minHeight={460} />}>
          <SecuritySection />
        </Suspense>

        {/* 8 — Pricing */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <PricingSection />
        </Suspense>

        {/* 9 — FAQ */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <FAQ />
        </Suspense>

        {/* 10 — Final CTA */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <FinalCTA />
        </Suspense>
      </main>

      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}