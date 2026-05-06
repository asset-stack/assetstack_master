import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LogoCloud from '@/components/landing/LogoCloud';
import AnimatedStats from '@/components/landing/AnimatedStats';
import FeatureGrid from '@/components/landing/FeatureGrid';
import BenefitsSection from '@/components/landing/BenefitsSection';
import IndustryUseCases from '@/components/landing/IndustryUseCases';
import LiveDemoSection from '@/components/landing/LiveDemoSection';
import Testimonials from '@/components/landing/Testimonials';
import SecuritySection from '@/components/landing/SecuritySection';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  useEffect(() => {
    document.title = 'AssetStack — Predict failures. Prove the savings.';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <LandingNav />
      <main>
        <LandingHero />
        <LogoCloud />
        <AnimatedStats />
        <BenefitsSection />
        <FeatureGrid />
        <IndustryUseCases />
        <LiveDemoSection />
        <section id="savings" className="scroll-mt-20">
          <Testimonials />
        </section>
        <SecuritySection />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}