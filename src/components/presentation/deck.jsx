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
 * AssetStack deck — 32 slides, full platform tour (~20 min).
 * All figures inside slides are illustrative demo data.
 *
 * Seven acts:
 *  I.   Open          — cover, TOC, the 82% stat
 *  II.  Problem       — the reality, before/after, the promise
 *  III. Four pillars  — register, maintenance, AI, condition reports
 *  IV.  Modules       — full tour across all 9 modules (NEW)
 *  V.   In motion     — fast upload, portfolio, predict, scans
 *  VI.  Proof         — finance, savings ledger, compliance
 *  VII. Close         — comparison, voices, ROI, CTA
 */
export const DECK = [
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

  // IV. Modules tour (10) — full platform walkthrough
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

// Slides intentionally retired from the boardroom cut to keep length tight:
// - SlideWorkOrders   (covered inside Maintenance + Field Ops)
// - SlideSecurity     (rolled into Compliance & trust)
// - SlideRoadmap      (covered verbally in the CTA)
// - SlideThankYou     (CTA is now the closer)
// Re-import from ./slides or ./wowSlides if you want them back.