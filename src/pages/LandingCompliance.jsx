import React, { Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SectionFallback from '@/components/landing/SectionFallback';
import ComplianceHero from '@/components/landing/compliance/ComplianceHero';
import ComplianceTrustPosture from '@/components/landing/compliance/ComplianceTrustPosture';
import ComplianceArchitecture from '@/components/landing/compliance/ComplianceArchitecture';
import ComplianceCapabilities from '@/components/landing/compliance/ComplianceCapabilities';
import ComplianceCTA from '@/components/landing/compliance/ComplianceCTA';

export default function LandingCompliance() {
  useEffect(() => {
    document.title = 'Compliance & Technology — AssetStack';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <LandingNav />
      <main>
        <ComplianceHero />
        <ComplianceTrustPosture />
        <ComplianceArchitecture />
        <ComplianceCapabilities />
        <ComplianceCTA />
      </main>
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}