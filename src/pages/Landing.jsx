import React, { Suspense, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import LandingNav from '@/components/landing/LandingNav';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import SectionFallback from '@/components/landing/SectionFallback';
import StickyCTA from '@/components/landing/StickyCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import { SECTION_REGISTRY, DEFAULT_SECTION_ORDER, resolveSections } from '@/components/landing/sectionRegistry';

export default function Landing() {
  const [sections, setSections] = useState(() =>
    DEFAULT_SECTION_ORDER.map((key) => ({ key, visible: true }))
  );

  useEffect(() => {
    document.title = 'AssetStack — The AI operating system for physical assets';

    // Load saved layout (singleton row). Fail silently → keep defaults.
    base44.entities.LandingLayout.filter({ is_active: true }, '-updated_date', 1)
      .then((rows) => {
        if (rows?.[0]?.sections) {
          setSections(resolveSections(rows[0].sections));
        }
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <ScrollProgressBar />
      <LandingNav />
      <StickyCTA />

      <main>
        {sections
          .filter((s) => s.visible)
          .map(({ key }) => {
            const entry = SECTION_REGISTRY[key];
            if (!entry) return null;
            const SectionComponent = entry.component;
            if (entry.lazy) {
              return (
                <Suspense key={key} fallback={<SectionFallback minHeight={entry.fallbackHeight} />}>
                  <SectionComponent />
                </Suspense>
              );
            }
            return <SectionComponent key={key} />;
          })}
      </main>

      <Suspense fallback={<SectionFallback minHeight={280} />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}