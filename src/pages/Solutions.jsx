import React, { Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SectionFallback from '@/components/landing/SectionFallback';
import SolutionsHero from '@/components/landing/solutions/SolutionsHero';
import SolutionsProblems from '@/components/landing/solutions/SolutionsProblems';
import SolutionsBlocks from '@/components/landing/solutions/SolutionsBlocks';
import SolutionsMetrics from '@/components/landing/solutions/SolutionsMetrics';
import SolutionsCTA from '@/components/landing/solutions/SolutionsCTA';

export default function Solutions() {
  useEffect(() => {
    document.title = 'Solutions — AssetStack';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <LandingNav />
      <main>
        <SolutionsHero />
        <SolutionsProblems />
        <SolutionsBlocks />
        <SolutionsMetrics />
        <SolutionsCTA />
      </main>
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}