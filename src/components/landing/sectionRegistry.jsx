import { lazy } from 'react';

// Eagerly loaded (above the fold)
import LandingHero from '@/components/landing/LandingHero';
import AssetMindSection from '@/components/landing/AssetMindSection';

// Lazy loaded (below the fold)
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

// Sister-site sections
const SisterHero = lazy(() => import('@/components/landing/sister/SisterHero'));
const SisterEcosystem = lazy(() => import('@/components/landing/sister/SisterEcosystem'));
const SisterFeaturesGrid = lazy(() => import('@/components/landing/sister/SisterFeaturesGrid'));

// Central registry — single source of truth for landing sections.
// Adding a new section: add an entry here AND default order in DEFAULT_SECTION_ORDER.
export const SECTION_REGISTRY = {
  hero:                 { label: 'Hero',                    description: 'Top hero with live AssetMind widget',   component: LandingHero,           lazy: false, fallbackHeight: 0 },
  assetMind:            { label: 'AssetMind Demo',          description: 'Interactive AssetMind chat and Command Center', component: AssetMindSection,      lazy: false, fallbackHeight: 600 },
  logoCloud:            { label: 'Logo Wall',               description: 'Customer / partner logos',              component: LogoCloud,             lazy: true,  fallbackHeight: 120 },
  personaSwitcher:      { label: 'Persona Switcher',        description: 'Tailors the rest of the page',          component: PersonaSwitcher,       lazy: true,  fallbackHeight: 520 },
  mechanism:            { label: 'How It Works (Mechanism)',description: 'How AssetStack actually works',         component: MechanismSection,      lazy: true,  fallbackHeight: 640 },
  whatsNew:             { label: "What's New",              description: 'Latest features showcase',              component: WhatsNewShowcase,      lazy: true,  fallbackHeight: 720 },
  productTour:          { label: '60-Second Product Tour',  description: 'Animated product walk-through',         component: ProductTour,           lazy: true,  fallbackHeight: 620 },
  savingsProof:         { label: 'Verified Savings Proof',  description: 'Real savings data from customers',      component: SavingsProof,          lazy: true,  fallbackHeight: 680 },
  roiCalculator:        { label: 'ROI Calculator',          description: 'Project your savings impact',           component: ROICalculator,         lazy: true,  fallbackHeight: 520 },
  personaCards:         { label: 'Persona Cards (Deeper)',  description: 'Detailed persona-by-persona value',     component: PersonaCards,          lazy: true,  fallbackHeight: 420 },
  industries:           { label: 'Industries',              description: 'Use cases by industry',                 component: IndustryUseCases,      lazy: true,  fallbackHeight: 520 },
  security:             { label: 'Security & Trust',        description: 'Compliance and security posture',       component: SecuritySection,       lazy: true,  fallbackHeight: 460 },
  pricing:              { label: 'Pricing',                 description: 'Plans and pricing tiers',               component: PricingSection,        lazy: true,  fallbackHeight: 620 },
  firstWeek:            { label: 'First 7 Days Deliverables', description: 'What you get in week one',            component: FirstWeekDeliverables, lazy: true,  fallbackHeight: 620 },
  faq:                  { label: 'FAQ',                     description: 'Frequently asked questions',            component: FAQ,                   lazy: true,  fallbackHeight: 420 },
  finalCTA:             { label: 'Final CTA',               description: 'Closing call-to-action banner',         component: FinalCTA,              lazy: true,  fallbackHeight: 420 },
  contact:              { label: 'Contact Form',            description: 'Inbound lead capture form',             component: ContactSection,        lazy: true,  fallbackHeight: 520 },
  sisterHero:           { label: 'Sister · Hero',           description: 'AI Infrastructure Intelligence hero (image-reveal)', component: SisterHero,       lazy: true,  fallbackHeight: 800 },
  sisterEcosystem:      { label: 'Sister · Ecosystem',      description: 'One Connected Ecosystem scroll story', component: SisterEcosystem,       lazy: true,  fallbackHeight: 800 },
  sisterFeatures:       { label: 'Sister · Features Grid',  description: 'Built for Complex Assets video grid',  component: SisterFeaturesGrid,    lazy: true,  fallbackHeight: 800 },
};

// Default order if no saved layout exists yet.
// Matches the "Correct" layout: sister hero + ecosystem at top, current sections reordered,
// sister features inserted mid-page, rest of current sections follow.
export const DEFAULT_SECTION_ORDER = [
  'sisterHero',
  'sisterEcosystem',
  'hero',
  'assetMind',
  'logoCloud',
  'mechanism',
  'whatsNew',
  'sisterFeatures',
  'productTour',
  'savingsProof',
  'roiCalculator',
  'personaSwitcher',
  'personaCards',
  'industries',
  'security',
  'pricing',
  'firstWeek',
  'faq',
  'finalCTA',
  'contact',
];

// Build a normalized section list from a saved layout (or defaults).
// Ensures: only known keys, defaults applied for any missing, no duplicates.
export function resolveSections(savedSections) {
  const known = new Set(Object.keys(SECTION_REGISTRY));
  const seen = new Set();
  const result = [];

  if (Array.isArray(savedSections)) {
    for (const s of savedSections) {
      if (!s || !s.key || !known.has(s.key) || seen.has(s.key)) continue;
      seen.add(s.key);
      result.push({ key: s.key, visible: s.visible !== false });
    }
  }

  // Append any registry keys missing from the saved layout (e.g. newly added sections)
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!seen.has(key) && known.has(key)) {
      result.push({ key, visible: true });
    }
  }

  return result;
}