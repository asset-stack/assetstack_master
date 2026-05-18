import React, { useEffect } from 'react';
import { Suspense, lazy } from 'react';
import SectionFallback from '@/components/landing/SectionFallback';
import LandingHero from '@/components/landing/LandingHero';
import LiveCounters from '@/components/landing/LiveCounters';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function PrintLanding() {
  useEffect(() => {
    document.title = 'AssetStack — Print / Export';
  }, []);

  return (
    <>
      {/* Print trigger bar — hidden when printing */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <span className="text-sm font-medium">Print or Save as PDF — use your browser's print dialog</span>
        <Button
          onClick={() => window.print()}
          className="bg-primary hover:bg-primary/90 text-white gap-2 h-9 text-sm"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Page content — shifted down for the bar, but not when printing */}
      <div className="print:pt-0 pt-12 min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased">
        <main>
          <LandingHero />
          <LiveCounters />
          <Suspense fallback={<SectionFallback minHeight={120} />}><LogoCloud /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={520} />}><PersonaSwitcher /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={640} />}><MechanismSection /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={720} />}><WhatsNewShowcase /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={620} />}><ProductTour /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={680} />}><SavingsProof /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={520} />}><ROICalculator /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={420} />}><PersonaCards /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={520} />}><IndustryUseCases /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={460} />}><SecuritySection /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={620} />}><PricingSection /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={620} />}><FirstWeekDeliverables /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={420} />}><FAQ /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={420} />}><FinalCTA /></Suspense>
          <Suspense fallback={<SectionFallback minHeight={520} />}><ContactSection /></Suspense>
        </main>
        <Suspense fallback={<SectionFallback minHeight={280} />}><LandingFooter /></Suspense>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .fixed { position: static !important; }
          [data-radix-popper-content-wrapper] { display: none !important; }
        }
      `}</style>
    </>
  );
}