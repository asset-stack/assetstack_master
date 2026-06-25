import React, { useState } from 'react';

const debtItems = [
  // Architecture
  {
    id: 'TD-001',
    category: 'Architecture',
    title: 'Direct entity.list() calls bypassing tenant scoping',
    description: 'Multiple pages (ConditionDefects, and others) call base44.entities.X.list() directly instead of routing through secureEntityQuery, creating cross-tenant data leakage risk.',
    effort: 'Medium',
    effortDays: '3–5 days',
    priority: 'Critical',
    impact: 'Security / Data Integrity',
    owner: 'Backend',
    status: 'Open',
  },
  {
    id: 'TD-002',
    category: 'Architecture',
    title: 'App.jsx route sprawl — 60+ explicit routes',
    description: 'App.jsx has grown to 400+ lines of explicit Route declarations mixed with a pagesConfig loop. This creates dual-registration risks and makes routing hard to reason about.',
    effort: 'High',
    effortDays: '5–8 days',
    priority: 'High',
    impact: 'Maintainability',
    owner: 'Frontend',
    status: 'Open',
  },
  {
    id: 'TD-003',
    category: 'Architecture',
    title: 'No centralised error boundary',
    description: 'Individual pages lack React error boundaries. A single component crash can take down the entire app view without a graceful fallback.',
    effort: 'Low',
    effortDays: '1–2 days',
    priority: 'High',
    impact: 'Reliability',
    owner: 'Frontend',
    status: 'Open',
  },
  {
    id: 'TD-004',
    category: 'Architecture',
    title: 'Backend functions share no common utility layer',
    description: 'Common logic (auth guard, rate-limit retry, pagination helpers) is copy-pasted across 60+ backend functions. Any change must be replicated manually.',
    effort: 'High',
    effortDays: '6–10 days',
    priority: 'High',
    impact: 'Maintainability / Security',
    owner: 'Backend',
    status: 'Open',
  },
  // Data Layer
  {
    id: 'TD-005',
    category: 'Data Layer',
    title: 'CapitalPlanItem upsert key relies on source_component_id string match',
    description: 'computeLifecyclePlan uses source_component_id as a stable key. If an AssessmentComponent is re-imported with a different ID, orphaned plan items accumulate silently.',
    effort: 'Medium',
    effortDays: '3–4 days',
    priority: 'High',
    impact: 'Data Integrity',
    owner: 'Backend',
    status: 'Open',
  },
  {
    id: 'TD-006',
    category: 'Data Layer',
    title: 'ChatSession.messages stored as a JSON array in a single field',
    description: 'Conversation history is embedded in one entity field. As sessions grow, this hits the 200KB payload limit, causing payload_too_large truncation and lost message history.',
    effort: 'High',
    effortDays: '5–8 days',
    priority: 'Medium',
    impact: 'Scalability / UX',
    owner: 'Backend',
    status: 'Open',
  },
  {
    id: 'TD-007',
    category: 'Data Layer',
    title: 'No soft-delete pattern — hard deletes used throughout',
    description: 'deleteMany() is used for permanent removal across all entities. There is no archive/soft-delete pattern, making accidental data loss unrecoverable without a backup restore.',
    effort: 'High',
    effortDays: '8–12 days',
    priority: 'Medium',
    impact: 'Data Safety',
    owner: 'Backend',
    status: 'Open',
  },
  {
    id: 'TD-008',
    category: 'Data Layer',
    title: 'SensorReading volume unbounded — no TTL or archival policy',
    description: 'SensorReading records accumulate indefinitely. At scale, list() and filter() on this entity will degrade without pagination enforcement or a rolling archival job.',
    effort: 'Medium',
    effortDays: '2–4 days',
    priority: 'Medium',
    impact: 'Performance / Cost',
    owner: 'Backend',
    status: 'Open',
  },
  // Frontend
  {
    id: 'TD-009',
    category: 'Frontend',
    title: 'Layout.jsx exceeds 450 lines — mixed concerns',
    description: 'The Layout component handles sidebar state, mobile menu, client selector, nav sections, and offline sync. It should be broken into focused sub-components.',
    effort: 'Medium',
    effortDays: '3–5 days',
    priority: 'Medium',
    impact: 'Maintainability',
    owner: 'Frontend',
    status: 'Open',
  },
  {
    id: 'TD-010',
    category: 'Frontend',
    title: 'Hardcoded Tailwind classes for dynamic values in multiple pages',
    description: 'Several components use string interpolation for Tailwind classes (e.g. `bg-${color}-500`), which are purged at build time and silently render unstyled.',
    effort: 'Low',
    effortDays: '2–3 days',
    priority: 'Medium',
    impact: 'UI Correctness',
    owner: 'Frontend',
    status: 'Open',
  },
  {
    id: 'TD-011',
    category: 'Frontend',
    title: 'No loading skeleton standardisation',
    description: 'Loading states are inconsistently implemented — some pages use spinners, some use skeletons, some show blank screens. There is no shared PageSkeleton pattern enforced.',
    effort: 'Low',
    effortDays: '2–3 days',
    priority: 'Low',
    impact: 'UX Consistency',
    owner: 'Frontend',
    status: 'Open',
  },
  {
    id: 'TD-012',
    category: 'Frontend',
    title: 'createPageUrl utility still referenced in layout but may conflict with react-router Links',
    description: 'The sidebar uses createPageUrl() from utils for some links and <Link to="..."> for others, creating inconsistency. Navigation should be unified under react-router Link.',
    effort: 'Low',
    effortDays: '1–2 days',
    priority: 'Low',
    impact: 'Maintainability',
    owner: 'Frontend',
    status: 'Open',
  },
  // Performance
  {
    id: 'TD-013',
    category: 'Performance',
    title: 'computeLifecyclePlan loads all AssessmentComponents into memory',
    description: 'The lifecycle plan function fetches all components for an assessment in a single pass. Large assessments (500+ components) risk timeout and memory pressure on the Deno runtime.',
    effort: 'Medium',
    effortDays: '3–5 days',
    priority: 'High',
    impact: 'Reliability / Scalability',
    owner: 'Backend',
    status: 'Open',
  },
  {
    id: 'TD-014',
    category: 'Performance',
    title: 'No React.memo or useMemo applied to heavy list components',
    description: 'CapitalPlanTable, ConditionRegisterTable and AssetRegister re-render on every parent state change. For 200+ row datasets this causes visible jank.',
    effort: 'Medium',
    effortDays: '2–4 days',
    priority: 'Medium',
    impact: 'Performance / UX',
    owner: 'Frontend',
    status: 'Open',
  },
  {
    id: 'TD-015',
    category: 'Performance',
    title: 'Brochure and Presentation pages load all slides eagerly',
    description: 'All slide components (14+ spreads, 12+ presentation slides) are imported and rendered at once. Lazy-loading slides would dramatically reduce initial bundle size.',
    effort: 'Low',
    effortDays: '1–2 days',
    priority: 'Low',
    impact: 'Performance',
    owner: 'Frontend',
    status: 'Open',
  },
  // Security
  {
    id: 'TD-016',
    category: 'Security',
    title: 'Admin-only backend functions lack server-side role check',
    description: 'Functions intended for admin-only use rely on frontend PermissionGate. Any user with a direct endpoint call can invoke them without a 403 guard.',
    effort: 'Low',
    effortDays: '2–3 days',
    priority: 'Critical',
    impact: 'Security',
    owner: 'Backend',
    status: 'In Progress',
  },
  {
    id: 'TD-017',
    category: 'Security',
    title: 'Webhook endpoints have no signature validation',
    description: 'External webhook-facing functions do not validate request origin signatures. Any external caller can trigger these endpoints with arbitrary payloads.',
    effort: 'Low',
    effortDays: '1–2 days',
    priority: 'Critical',
    impact: 'Security',
    owner: 'Backend',
    status: 'Open',
  },
  {
    id: 'TD-018',
    category: 'Security',
    title: 'No CSP or security headers on public routes',
    description: 'Landing, Brochure, and marketing pages serve no Content-Security-Policy, X-Frame-Options, or Referrer-Policy headers.',
    effort: 'Low',
    effortDays: '1 day',
    priority: 'Medium',
    impact: 'Security',
    owner: 'Infrastructure',
    status: 'Planned',
  },
  // Testing
  {
    id: 'TD-019',
    category: 'Testing',
    title: 'Zero automated test coverage',
    description: 'No unit, integration, or E2E tests exist for any backend function or frontend component. All validation is manual. Risk of regression on every deployment.',
    effort: 'Very High',
    effortDays: '20–40 days',
    priority: 'High',
    impact: 'Quality / Reliability',
    owner: 'Engineering',
    status: 'Open',
  },
  {
    id: 'TD-020',
    category: 'Testing',
    title: 'No staging environment — changes deploy directly to production',
    description: 'All code changes go live immediately with no staging gate. A broken deployment impacts all active users without a rollback path.',
    effort: 'High',
    effortDays: '5–8 days',
    priority: 'High',
    impact: 'Risk / Reliability',
    owner: 'Infrastructure',
    status: 'Open',
  },
];

const priorityConfig = {
  Critical: { badge: 'bg-red-600 text-white', row: 'border-red-200', order: 1 },
  High:     { badge: 'bg-orange-500 text-white', row: 'border-orange-200', order: 2 },
  Medium:   { badge: 'bg-yellow-500 text-white', row: 'border-yellow-200', order: 3 },
  Low:      { badge: 'bg-blue-400 text-white', row: 'border-blue-200', order: 4 },
};

const effortConfig = {
  Low:       'bg-green-100 text-green-700',
  Medium:    'bg-yellow-100 text-yellow-700',
  High:      'bg-orange-100 text-orange-700',
  'Very High': 'bg-red-100 text-red-700',
};

const statusConfig = {
  Open:        'bg-red-100 text-red-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Planned:     'bg-blue-100 text-blue-700',
  Resolved:    'bg-green-100 text-green-700',
};

const categories = ['All', ...Array.from(new Set(debtItems.map(d => d.category)))];

export default function TechnicalDebtRegister() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePriority, setActivePriority] = useState('All');

  const filtered = debtItems
    .filter(d => activeCategory === 'All' || d.category === activeCategory)
    .filter(d => activePriority === 'All' || d.priority === activePriority)
    .sort((a, b) => priorityConfig[a.priority].order - priorityConfig[b.priority].order);

  const counts = debtItems.reduce((acc, d) => { acc[d.priority] = (acc[d.priority] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:py-0">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">

        {/* Header */}
        <div className="bg-slate-900 text-white px-10 py-8 print:px-8 print:py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <span className="text-amber-300 font-semibold text-sm tracking-widest uppercase">AssetStack</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-1">Technical Debt Register</h1>
              <p className="text-slate-400 text-sm">Platform Engineering — June 2026</p>
            </div>
            <div className="text-right text-xs text-slate-400 space-y-1 mt-1">
              <p><span className="text-slate-500">Classification:</span> <span className="text-amber-400 font-semibold">INTERNAL</span></p>
              <p><span className="text-slate-500">Version:</span> 1.0</p>
              <p><span className="text-slate-500">Date:</span> 25 June 2026</p>
              <p><span className="text-slate-500">Total Items:</span> {debtItems.length}</p>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 print:px-8 space-y-8">

          {/* Summary */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Summary</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 text-sm leading-relaxed">
              This register documents <strong>{debtItems.length} significant technical debt items</strong> across Architecture, Data Layer, Frontend, Performance, Security, and Testing. Items are ranked by priority and include effort estimates to assist sprint planning and quarterly roadmap allocation.
            </div>
          </section>

          {/* Priority counts */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Priority Breakdown</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Critical', color: 'border-red-500 bg-red-50', text: 'text-red-700', num: 'text-red-600' },
                { label: 'High',     color: 'border-orange-400 bg-orange-50', text: 'text-orange-700', num: 'text-orange-500' },
                { label: 'Medium',   color: 'border-yellow-400 bg-yellow-50', text: 'text-yellow-700', num: 'text-yellow-600' },
                { label: 'Low',      color: 'border-blue-400 bg-blue-50', text: 'text-blue-700', num: 'text-blue-500' },
              ].map(({ label, color, text, num }) => (
                <div key={label} className={`border-2 rounded-xl p-4 text-center ${color}`}>
                  <div className={`text-3xl font-black ${num}`}>{counts[label] || 0}</div>
                  <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${text}`}>{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category:</span>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${activeCategory === c ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >{c}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority:</span>
              {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
                <button
                  key={p}
                  onClick={() => setActivePriority(p)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${activePriority === p ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >{p}</button>
              ))}
            </div>
          </div>

          {/* Items */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Debt Items <span className="text-slate-300 font-normal">({filtered.length})</span>
            </h2>
            <div className="space-y-3">
              {filtered.map((item, idx) => (
                <div key={item.id} className={`border rounded-xl overflow-hidden ${priorityConfig[item.priority].row}`}>
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs font-bold w-4">#{idx + 1}</span>
                      <span className="font-mono text-xs font-bold text-slate-500">{item.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${priorityConfig[item.priority].badge}`}>{item.priority}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${effortConfig[item.effort]}`}>{item.effort} effort</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusConfig[item.status]}`}>{item.status}</span>
                    </div>
                  </div>
                  <div className="px-5 py-4 bg-white space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400">Est. effort</div>
                        <div className="text-xs font-bold text-slate-700">{item.effortDays}</div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
                      <span><span className="font-semibold text-slate-500">Impact:</span> {item.impact}</span>
                      <span><span className="font-semibold text-slate-500">Owner:</span> {item.owner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs text-slate-400">
            <span>AssetStack Pty Ltd — Internal</span>
            <span>Technical Debt Register — June 2026 — v1.0</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors print:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Export PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}