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

// Editorial Boardroom Edition — rebuilt May 2026 for boards, councils, govt.
import Slide01Cover     from './editorial/Slide01Cover';
import Slide02Stakes    from './editorial/Slide02Stakes';
import Slide03Reality   from './editorial/Slide03Reality';
import Slide04Shift     from './editorial/Slide04Shift';
import Slide05Platform  from './editorial/Slide05Platform';
import Slide06AssetMind from './editorial/Slide06AssetMind';
import Slide07Predict   from './editorial/Slide07Predict';
import Slide08Scans     from './editorial/Slide08Scans';
import Slide09Finance   from './editorial/Slide09Finance';
import Slide10Savings   from './editorial/Slide10Savings';
import Slide11Trust     from './editorial/Slide11Trust';
import Slide12Ask       from './editorial/Slide12Ask';

/**
 * BOARDROOM EDITION — 12 slides, ~12 minutes.
 * Editorial McKinsey/Bloomberg aesthetic. Built for boards, councils, and
 * government infrastructure committees. Cream and ink. Fraunces serif for
 * stakes, Inter for data. One accent: deep indigo.
 *
 * Narrative arc:
 *   Cover → Stakes → Reality → Shift → Platform →
 *   AssetMind → Predict → Closed loop →
 *   Finance → Savings → Trust → Ask.
 */
export const BOARDROOM_DECK = [
  { act: 'Open',     title: 'The case for a national asset OS', Component: Slide01Cover },
  { act: 'Stakes',   title: 'The stakes',                       Component: Slide02Stakes },
  { act: 'Reality',  title: 'Three uncomfortable truths',       Component: Slide03Reality },
  { act: 'Shift',    title: 'Reactive → Predictive',            Component: Slide04Shift },
  { act: 'Platform', title: 'One model, four surfaces',         Component: Slide05Platform },
  { act: 'Wow',      title: 'AssetMind · decision layer',       Component: Slide06AssetMind },
  { act: 'Wow',      title: 'Predict failures early',           Component: Slide07Predict },
  { act: 'Wow',      title: 'Scans → defects → work orders',    Component: Slide08Scans },
  { act: 'Proof',    title: 'Finance · three futures',          Component: Slide09Finance },
  { act: 'Proof',    title: 'Verified savings ledger',          Component: Slide10Savings },
  { act: 'Trust',    title: 'Compliance & trust',               Component: Slide11Trust },
  { act: 'Close',    title: 'The ask · ninety days',            Component: Slide12Ask },
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