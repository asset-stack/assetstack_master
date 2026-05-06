import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import CaseStudyHero from '@/components/landing/case-studies/CaseStudyHero';
import CaseStudyCard from '@/components/landing/case-studies/CaseStudyCard';
import CaseStudyCTA from '@/components/landing/case-studies/CaseStudyCTA';

const BUNBURY = {
  id: 'bunbury',
  eyebrow: { tag: 'Local Government', location: 'Western Australia' },
  org: 'Bunbury Council · LGA',
  title: 'How a WA council digitised <em class="font-serif italic font-medium text-primary">15+ critical assets</em> and turned reactive maintenance into a planned program.',
  heroImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&auto=format&fit=crop&q=70',
  badges: ['90% asset digitisation', '24/7 monitoring', 'Improved visibility'],
  overview: 'A WA council engaged AssetStack to modernise the management of its infrastructure portfolio — spanning sports stadiums, museums, office buildings and community facilities. Critical assets were captured using advanced 3D scanning to create a centralised digital record of condition and performance, giving the council a single source of truth for monitoring, analysis and capital planning.',
  challenges: [
    'Fragmented asset data across multiple legacy systems',
    'Limited visibility of real-time asset condition',
    'Reactive maintenance workflows driven by failure events',
    'Difficulty prioritising capital works and upgrades',
  ],
  solution: {
    intro: 'A digitised asset intelligence system that combines inspection data, 3D scanning and analytics into a single platform — giving the council a centralised view of every scanned asset.',
    capabilities: [
      'Asset mapping & 3D visualisation',
      'Inspection data capture in the field',
      'Continuous condition tracking',
      'Maintenance planning & prioritisation tools',
    ],
  },
  implementation: [
    'Asset scanning and digitisation of key infrastructure',
    'Platform configuration and team onboarding',
    'Integration of inspection workflows',
    'Phased deployment across council teams',
  ],
  outcomes: [
    '90%+ visibility across scanned assets',
    'Centralised infrastructure data platform',
    'Improved maintenance planning and prioritisation',
    'Reduced reliance on reactive maintenance',
  ],
  metrics: [
    { value: '90%', label: 'Prediction accuracy' },
    { value: '32%', label: 'Maintenance cost reduction' },
    { value: '450+', label: 'Assets monitored' },
    { value: '24/7', label: 'Real-time monitoring' },
  ],
  quote: {
    text: 'AssetStack has significantly improved our ability to monitor infrastructure assets and plan maintenance activities more effectively.',
    attribution: 'Bunbury Council Infrastructure Team',
  },
};

const LYCOPODIUM = {
  id: 'lycopodium',
  eyebrow: { tag: 'Rail Infrastructure', location: 'National · Australia' },
  org: 'Lycopodium · Rail Infrastructure',
  title: 'How Lycopodium digitised <em class="font-serif italic font-medium text-primary">100+ rail assets</em> across a national network — without putting boots on every track.',
  heroImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&auto=format&fit=crop&q=70',
  badges: ['100+ rail assets', 'National coverage', 'Better planning'],
  overview: 'Lycopodium engaged AssetStack to support the digitisation and monitoring of major rail networks across Australia. The project captured high-resolution data across rail intersections, crossings and critical assets, creating a digital twin layer that allows engineering teams to remotely inspect, analyse and plan maintenance — across geographically dispersed networks — from one platform.',
  challenges: [
    'Assets spread across vast and remote locations',
    'Limited visibility into real-time asset condition',
    'High cost and risk of physical inspections',
    'Difficulty coordinating maintenance across networks',
  ],
  solution: {
    intro: 'A data-driven infrastructure management platform tailored to rail environments — enabling teams to access asset data remotely and reducing reliance on on-site inspections.',
    capabilities: [
      'High-resolution scanning of intersections and infrastructure',
      'Digital twin visualisation of network assets',
      'Centralised asset database across multiple sites',
      'Integration of inspection, maintenance and analytics workflows',
    ],
  },
  implementation: [
    'Scanning of key rail infrastructure across multiple locations',
    'Creation of a unified digital asset layer',
    'Deployment of AssetStack across Lycopodium teams',
    'Integration into existing maintenance workflows',
  ],
  outcomes: [
    'Increased visibility across national rail assets',
    'Reduced need for manual inspections',
    'Faster identification of maintenance requirements',
    'Improved coordination of maintenance activities',
  ],
  metrics: [
    { value: '100+', label: 'Rail assets digitised' },
    { value: 'National', label: 'Network coverage' },
    { value: '↓ 60%', label: 'Manual inspections' },
    { value: 'Faster', label: 'Maintenance triage' },
  ],
  quote: {
    text: 'AssetStack has enabled us to better understand and manage our rail infrastructure at scale.',
    attribution: 'Stuart Sutherland — Managing Director, Lycopodium',
  },
};

export default function CaseStudies() {
  useEffect(() => {
    document.title = 'Case Studies — AssetStack';
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-primary/15 antialiased">
      <ScrollProgressBar />
      <LandingNav />

      <main>
        <CaseStudyHero />
        <CaseStudyCard {...BUNBURY} />
        <CaseStudyCard {...LYCOPODIUM} reverse />
        <CaseStudyCTA />
      </main>

      <LandingFooter />
    </div>
  );
}