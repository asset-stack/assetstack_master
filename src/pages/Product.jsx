import React, { Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SectionFallback from '@/components/landing/SectionFallback';
import ProductHero from '@/components/landing/product/ProductHero';
import ProductIntelligenceLoop from '@/components/landing/product/ProductIntelligenceLoop';
import ProductModules from '@/components/landing/product/ProductModules';
import ProductCTA from '@/components/landing/product/ProductCTA';

export default function Product() {
  useEffect(() => {
    document.title = 'Product — The AssetStack Platform';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <LandingNav />
      <main>
        <ProductHero />
        <ProductIntelligenceLoop />
        <ProductModules />
        <ProductCTA />
      </main>
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}