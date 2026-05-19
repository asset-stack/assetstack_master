import React, { lazy, Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import SectionFallback from '@/components/landing/SectionFallback';
import LiveCounters from '@/components/landing/LiveCounters';
import StickyCTA from '@/components/landing/StickyCTA';

// Below-the-fold — code-split for fast TTI
const LogoCloud = lazy(() => import('@/components/landing/LogoCloud'));
const PersonaSwitcher = lazy(() => import('@/components/landing/PersonaSwitcher'));
const WhatsNewShowcase = lazy(() => import('@/components/landing/WhatsNewShowcase'));
const MechanismSection = lazy(() => import('@/components/landing/MechanismSection'));
const ProductTour = lazy(() => import('@/components/landing/ProductTour'));
const SavingsProof = lazy(() => import('@/components/landing/SavingsProof'));
const ROICalculator = lazy(() => import('@/components/landing/ROICalculator'));
const PersonaCards = lazy(() => import('@/components/landing/PersonaCards'));
const IndustryUseCases = lazy(() => import('@/components/landing/IndustryUseCases'));
const SecuritySection = lazy(() => import('@/components/landing/SecuritySection'));
const PricingSection = lazy(() => import('@/components/landing/PricingSection'));
const FirstWeekDeliverables = lazy(() => import('@/components/landing/FirstWeekDeliverables'));
const FAQ = lazy(() => import('@/components/landing/FAQ'));
const FinalCTA = lazy(() => import('@/components/landing/FinalCTA'));
const ContactSection = lazy(() => import('@/components/landing/ContactSection'));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter'));

export default function Landing() {
  useEffect(() => {
    document.title = 'AssetStack — The AI operating system for physical assets';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <ScrollProgressBar />
      <LandingNav />
      <StickyCTA />

      <main>
        {/* 1 — Hero with live AssetMind widget (the "magic trick") */}
        <LandingHero />

        {/* 2 — Live counters: instant proof density */}
        <LiveCounters />

        {/* 3 — Logo wall */}
        <Suspense fallback={<SectionFallback minHeight={120} />}>
          <LogoCloud />
        </Suspense>

        {/* 4 — Persona switcher: tailors the rest of the site */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <PersonaSwitcher />
        </Suspense>

        {/* 5 — Mechanism: how it actually works */}
        <Suspense fallback={<SectionFallback minHeight={640} />}>
          <MechanismSection />
        </Suspense>

        {/* 6 — What's new */}
        <Suspense fallback={<SectionFallback minHeight={720} />}>
          <WhatsNewShowcase />
        </Suspense>

        {/* 7 — 60-second product tour */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <ProductTour />
        </Suspense>

        {/* 8 — Verified savings proof */}
        <Suspense fallback={<SectionFallback minHeight={680} />}>
          <SavingsProof />
        </Suspense>

        {/* 9 — ROI calculator: project your impact */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <ROICalculator />
        </Suspense>

        {/* 10 — Persona cards (deeper) */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <PersonaCards />
        </Suspense>

        {/* 11 — Industries */}
        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <IndustryUseCases />
        </Suspense>

        {/* 12 — Security & trust */}
        <Suspense fallback={<SectionFallback minHeight={460} />}>
          <SecuritySection />
        </Suspense>

        {/* 13 — Pricing */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <PricingSection />
        </Suspense>

        {/* 14 — First 7 days deliverables */}
        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <FirstWeekDeliverables />
        </Suspense>

        {/* 15 — FAQ */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <FAQ />
        </Suspense>

        {/* 16 — Final CTA */}
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <FinalCTA />
        </Suspense>

        {/* 17 — Contact form */}
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