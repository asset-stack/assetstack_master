import React, { Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SectionFallback from '@/components/landing/SectionFallback';
import SecurityDocsHero from '@/components/security-docs/SecurityDocsHero';
import SecurityDocsNav from '@/components/security-docs/SecurityDocsNav';
import SecurityDocsSectionsA from '@/components/security-docs/SecurityDocsSectionsA';
import SecurityDocsSectionsB from '@/components/security-docs/SecurityDocsSectionsB';

export default function SecurityDocs() {
  useEffect(() => {
    document.title = 'Security Documentation — AssetStack';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <LandingNav />
      <main>
        <SecurityDocsHero />
        <div className="max-w-[1480px] mx-auto px-5 md:px-10 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-x-12">
            <SecurityDocsNav />
            <div className="max-w-3xl">
              <SecurityDocsSectionsA />
              <SecurityDocsSectionsB />
            </div>
          </div>
        </div>
      </main>
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}