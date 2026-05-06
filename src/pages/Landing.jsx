import React, { lazy, Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import SectionFallback from '@/components/landing/SectionFallback';

// Eager: above-the-fold only
// Lazy: everything below the fold (deferred to keep TTI fast)
const LogoCloud = lazy(() => import('@/components/landing/LogoCloud'));
const LiveIntelligenceStream = lazy(() => import('@/components/landing/LiveIntelligenceStream'));
const AnimatedStats = lazy(() => import('@/components/landing/AnimatedStats'));
const BenefitsSection = lazy(() => import('@/components/landing/BenefitsSection'));
const FlagshipCapabilities = lazy(() => import('@/components/landing/FlagshipCapabilities'));
const FeatureGrid = lazy(() => import('@/components/landing/FeatureGrid'));
const IndustryUseCases = lazy(() => import('@/components/landing/IndustryUseCases'));
const LiveDemoSection = lazy(() => import('@/components/landing/LiveDemoSection'));
const Testimonials = lazy(() => import('@/components/landing/Testimonials'));
const SecuritySection = lazy(() => import('@/components/landing/SecuritySection'));
const FAQ = lazy(() => import('@/components/landing/FAQ'));
const FinalCTA = lazy(() => import('@/components/landing/FinalCTA'));
const LandingFooter = lazy(() => import('@/components/landing/LandingFooter'));

export default function Landing() {
  useEffect(() => {
    document.title = 'AssetStack — Predict failures. Prove the savings.';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 antialiased">
      <ScrollProgressBar />
      <LandingNav />
      <main>
        <LandingHero />

        <Suspense fallback={<SectionFallback minHeight={120} />}>
          <LogoCloud />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <LiveIntelligenceStream />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={280} />}>
          <AnimatedStats />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <BenefitsSection />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={520} />}>
          <FlagshipCapabilities />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <FeatureGrid />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={480} />}>
          <IndustryUseCases />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={620} />}>
          <LiveDemoSection />
        </Suspense>

        <section id="savings" className="scroll-mt-20">
          <Suspense fallback={<SectionFallback minHeight={420} />}>
            <Testimonials />
          </Suspense>
        </section>

        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <SecuritySection />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <FAQ />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={320} />}>
          <FinalCTA />
        </Suspense>
      </main>

      <Suspense fallback={<SectionFallback minHeight={240} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}