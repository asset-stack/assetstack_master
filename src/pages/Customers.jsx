import React, { Suspense, useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import SectionFallback from '@/components/landing/SectionFallback';
import CustomersHero from '@/components/landing/customers/CustomersHero';
import CustomersList from '@/components/landing/customers/CustomersList';
import CustomersQuote from '@/components/landing/customers/CustomersQuote';
import AboutCTA from '@/components/landing/about/AboutCTA';

export default function Customers() {
  useEffect(() => {
    document.title = 'Customers — AssetStack';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <LandingNav />
      <main>
        <CustomersHero />
        <CustomersList />
        <CustomersQuote />
        <AboutCTA />
      </main>
      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}