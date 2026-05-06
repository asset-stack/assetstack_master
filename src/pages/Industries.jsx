import React, { useEffect } from 'react';
import { Building2, Heart, Train, Zap, Building, GraduationCap } from 'lucide-react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import IndustriesHero from '@/components/landing/industries/IndustriesHero';
import IndustryIntro from '@/components/landing/industries/IndustryIntro';
import IndustrySection from '@/components/landing/industries/IndustrySection';
import UnifiedPlatformBand from '@/components/landing/industries/UnifiedPlatformBand';
import IndustriesCTA from '@/components/landing/industries/IndustriesCTA';

const INDUSTRIES = [
  {
    eyebrow: 'Government & Local Councils',
    title: 'Government & Local Councils',
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop&q=70',
    description:
      'Local governments manage extensive portfolios of public infrastructure including buildings, parks, roads and community facilities. AssetStack provides a centralised platform to monitor asset condition, plan maintenance and improve long-term infrastructure management.',
    useCases: [
      'Public facility asset tracking',
      'Infrastructure condition monitoring',
      'Maintenance planning and prioritisation',
      'Long-term asset lifecycle management',
    ],
    outcomes: [
      'Improved infrastructure visibility',
      'More efficient maintenance planning',
      'Better allocation of public resources',
    ],
  },
  {
    eyebrow: 'Healthcare & Aged Care',
    title: 'Healthcare & Aged Care',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&auto=format&fit=crop&q=70',
    description:
      'Healthcare and aged care providers operate multiple facilities with complex infrastructure requirements. AssetStack enables organisations to monitor building systems, maintain compliance and optimise maintenance across facility networks.',
    useCases: [
      'Multi-site facility management',
      'Building systems monitoring',
      'Compliance-driven maintenance',
      'Asset lifecycle tracking',
    ],
    outcomes: [
      'Improved facility reliability',
      'Reduced maintenance risk',
      'Enhanced operational efficiency',
    ],
  },
  {
    eyebrow: 'Transport & Infrastructure',
    title: 'Transport & Infrastructure',
    icon: Train,
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&auto=format&fit=crop&q=70',
    description:
      'Transport operators manage critical infrastructure such as rail networks, road systems and intersections where failure can have significant operational impact. AssetStack provides real-time monitoring and predictive maintenance across transport infrastructure.',
    useCases: [
      'Rail infrastructure monitoring',
      'Intersection and network asset tracking',
      'Predictive maintenance for transport systems',
      'Operational performance analytics',
    ],
    outcomes: [
      'Reduced downtime across networks',
      'Improved infrastructure reliability',
      'Better maintenance coordination',
    ],
  },
  {
    eyebrow: 'Utilities, Energy & Resources',
    title: 'Utilities, Energy & Resources',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&auto=format&fit=crop&q=70',
    description:
      'Utilities, energy providers and resource operators manage distributed infrastructure across large geographic areas. AssetStack provides real-time monitoring and predictive insights across critical infrastructure systems.',
    useCases: [
      'Pipeline and pump station monitoring',
      'Substation and grid infrastructure tracking',
      'Mining equipment and processing facility monitoring',
      'Remote asset performance analytics',
    ],
    outcomes: [
      'Improved infrastructure reliability',
      'Reduced unplanned failures',
      'Greater operational visibility across distributed assets',
    ],
  },
  {
    eyebrow: 'Property & Asset Portfolio Managers',
    title: 'Property & Asset Portfolio Managers',
    icon: Building,
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1200&auto=format&fit=crop&q=70',
    description:
      'Property groups and asset managers oversee large portfolios of buildings and infrastructure assets. AssetStack provides visibility across entire portfolios, enabling proactive maintenance and long-term asset planning.',
    useCases: [
      'Portfolio-wide asset monitoring',
      'Building systems management',
      'Maintenance scheduling across multiple sites',
      'Asset lifecycle and depreciation tracking',
    ],
    outcomes: [
      'Improved portfolio visibility',
      'Reduced maintenance costs',
      'Optimised capital planning',
    ],
  },
  {
    eyebrow: 'Education & Campus Infrastructure',
    title: 'Education & Campus Infrastructure',
    icon: GraduationCap,
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=70',
    description:
      'Educational institutions manage extensive campus environments with diverse infrastructure assets. AssetStack enables institutions to monitor facilities, maintain infrastructure and optimise maintenance operations across campuses.',
    useCases: [
      'Campus facility monitoring',
      'Infrastructure asset tracking',
      'Maintenance planning across buildings',
      'Operational analytics for campus systems',
    ],
    outcomes: [
      'Improved campus infrastructure management',
      'More efficient maintenance operations',
      'Better long-term asset planning',
    ],
  },
];

export default function Industries() {
  useEffect(() => {
    document.title = 'Industries — AssetStack';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <ScrollProgressBar />
      <LandingNav />

      <main>
        <IndustriesHero />
        <IndustryIntro />

        {INDUSTRIES.map((ind, i) => (
          <IndustrySection key={ind.title} index={i} {...ind} />
        ))}

        <UnifiedPlatformBand />
        <IndustriesCTA />
      </main>

      <LandingFooter />
    </div>
  );
}