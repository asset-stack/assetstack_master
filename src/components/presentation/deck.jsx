import {
  SlideTOC, SlideProblem, SlideAssetMind, SlideVoices, SlideImpact,
  SlideCTA, SlidePredict, SlideScans, SlideLivePortfolio, SlideFinance,
  SlideSavings, SlideCompliance, SlideComparison,
} from './slides';
import {
  SlideAssetRegister, SlideMaintenance,
} from './featureSlides';
import {
  SlideBigStat, SlideBeforeAfter, SlideManifesto,
} from './wowSlides';
import {
  SlideCoverV2, SlideFourPillars, SlideFastUpload, SlideConditionReports,
} from './coreSlides';
import {
  SlideModulesOverview, SlideModuleAssetMind, SlideModulePeople, SlideModuleAssets,
  SlideModuleDelivery, SlideModuleOperations, SlideModuleFinance, SlideModuleFieldOps,
  SlideModuleIntelligence, SlideModuleContractor,
} from './moduleSlides';

/**
 * BOARDROOM CUT — 12 slides, ~12 minutes.
 * Default. Sequoia/Apple-style pacing: hook → problem → solution → proof → close.
 * Every slide changes the audience's mind. Nothing is inventory.
 */
export const BOARDROOM_DECK = [
  { act: 'Open',    title: 'Cover',                   Component: SlideCoverV2 },
  { act: 'Hook',    title: '82% are unpredictable',   Component: SlideBigStat },
  { act: 'Shift',   title: 'Before & after',          Component: SlideBeforeAfter },
  { act: 'Platform',title: 'The four pillars',        Component: SlideFourPillars },
  { act: 'Wow',     title: 'AI command centre',       Component: SlideAssetMind },
  { act: 'Wow',     title: 'Predict failures early',  Component: SlidePredict },
  { act: 'Wow',     title: 'Scans → defects → WOs',   Component: SlideScans },
  { act: 'Proof',   title: 'Finance & scenarios',     Component: SlideFinance },
  { act: 'Proof',   title: 'Verified savings ledger', Component: SlideSavings },
  { act: 'Why us',  title: 'The features no one has', Component: SlideComparison },
  { act: 'Proof',   title: 'Compliance & trust',      Component: SlideCompliance },
  { act: 'Close',   title: "Let's talk",              Component: SlideCTA },
];

/**
 * FULL PLATFORM TOUR — 32 slides, ~20 minutes.
 * For deep-dive evaluators, technical buyers, and RFP responses.
 * Same seven-act structure as before with the module walkthrough intact.
 */
export const FULL_DECK = [
  // I. Open (3)
  { act: 'Open',     title: 'Cover',                  Component: SlideCoverV2 },
  { act: 'Open',     title: 'Inside this edition',    Component: SlideTOC, dynamic: true },
  { act: 'Open',     title: '82% are unpredictable',  Component: SlideBigStat },

  // II. Problem (3)
  { act: 'Problem',  title: 'The reality today',      Component: SlideProblem },
  { act: 'Problem',  title: 'Before & after',         Component: SlideBeforeAfter },
  { act: 'Problem',  title: 'The promise',            Component: SlideManifesto },

  // III. Four pillars (5)
  { act: 'Pillars',  title: 'The four pillars',       Component: SlideFourPillars },
  { act: 'Pillars',  title: '01 · Asset register',    Component: SlideAssetRegister },
  { act: 'Pillars',  title: '02 · Maintenance',       Component: SlideMaintenance },
  { act: 'Pillars',  title: '03 · AI command centre', Component: SlideAssetMind },
  { act: 'Pillars',  title: '04 · Condition reports', Component: SlideConditionReports },

  // IV. Modules tour (10)
  { act: 'Modules',  title: 'Nine modules, one model',Component: SlideModulesOverview },
  { act: 'Modules',  title: 'M1 · AssetMind',         Component: SlideModuleAssetMind },
  { act: 'Modules',  title: 'M2 · People',            Component: SlideModulePeople },
  { act: 'Modules',  title: 'M3 · Assets',            Component: SlideModuleAssets },
  { act: 'Modules',  title: 'M4 · Delivery',          Component: SlideModuleDelivery },
  { act: 'Modules',  title: 'M5 · Operations',        Component: SlideModuleOperations },
  { act: 'Modules',  title: 'M6 · Finance',           Component: SlideModuleFinance },
  { act: 'Modules',  title: 'M7 · Field Ops',         Component: SlideModuleFieldOps },
  { act: 'Modules',  title: 'M8 · Intelligence',      Component: SlideModuleIntelligence },
  { act: 'Modules',  title: 'M9 · Contractor Hub',    Component: SlideModuleContractor },

  // V. In motion (4)
  { act: 'Platform', title: 'Fast upload · 4:47',     Component: SlideFastUpload },
  { act: 'Platform', title: 'Live portfolio',         Component: SlideLivePortfolio },
  { act: 'Platform', title: 'Predictive maintenance', Component: SlidePredict },
  { act: 'Platform', title: 'Scans → defects → WOs',  Component: SlideScans },

  // VI. Proof (3)
  { act: 'Proof',    title: 'Finance & capital plan', Component: SlideFinance },
  { act: 'Proof',    title: 'Verified savings ledger',Component: SlideSavings },
  { act: 'Proof',    title: 'Compliance & trust',     Component: SlideCompliance },

  // VII. Close (4)
  { act: 'Close',    title: 'Why teams choose us',    Component: SlideComparison },
  { act: 'Close',    title: 'Customer voices',        Component: SlideVoices },
  { act: 'Close',    title: 'Outcomes & ROI',         Component: SlideImpact },
  { act: 'Close',    title: "Let's talk",             Component: SlideCTA },
];

// Back-compat default export — Boardroom is the new default.
export const DECK = BOARDROOM_DECK;