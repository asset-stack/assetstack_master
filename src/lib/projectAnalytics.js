// World-class project analytics — Earned Value Management (EVM),
// Critical Path Method (CPM), schedule slip forecasting.
// PMI-standard formulas: https://www.pmi.org/learning/library/make-earned-value-work-project-6001

/**
 * Calculate Earned Value Management metrics for a project.
 * Returns: PV, EV, AC, SV, CV, SPI, CPI, EAC, ETC, VAC, TCPI
 */
export function calculateEVM(project) {
  const budget = project?.budget || 0; // BAC — Budget at Completion
  const actual = project?.actual_cost || 0; // AC — Actual Cost
  const progress = (project?.progress_percent || 0) / 100;

  // Time-based planned progress
  const start = project?.start_date ? new Date(project.start_date) : null;
  const end = project?.target_end_date ? new Date(project.target_end_date) : null;
  const now = new Date();

  let plannedProgress = 0;
  if (start && end && end > start) {
    const total = end - start;
    const elapsed = Math.max(0, Math.min(total, now - start));
    plannedProgress = elapsed / total;
  }

  const PV = budget * plannedProgress; // Planned Value
  const EV = budget * progress; // Earned Value
  const AC = actual;

  const SV = EV - PV; // Schedule Variance ($)
  const CV = EV - AC; // Cost Variance ($)
  const SPI = PV > 0 ? EV / PV : 1; // Schedule Performance Index
  const CPI = AC > 0 ? EV / AC : 1; // Cost Performance Index

  // EAC — Estimate at Completion (uses combined CPI×SPI for realistic forecast)
  const EAC = CPI > 0 && SPI > 0 ? budget / (CPI * SPI) : budget;
  const ETC = Math.max(0, EAC - AC); // Estimate to Complete
  const VAC = budget - EAC; // Variance at Completion

  // TCPI — To-Complete Performance Index (efficiency required to hit budget)
  const TCPI = budget - AC > 0 ? (budget - EV) / (budget - AC) : 0;

  return {
    BAC: budget,
    PV: Math.round(PV),
    EV: Math.round(EV),
    AC: Math.round(AC),
    SV: Math.round(SV),
    CV: Math.round(CV),
    SPI: Number(SPI.toFixed(2)),
    CPI: Number(CPI.toFixed(2)),
    EAC: Math.round(EAC),
    ETC: Math.round(ETC),
    VAC: Math.round(VAC),
    TCPI: Number(TCPI.toFixed(2)),
    plannedProgress: Math.round(plannedProgress * 100),
    actualProgress: Math.round(progress * 100)
  };
}

/**
 * Interpret an EVM index value (SPI / CPI).
 * >= 1.0  green   — ahead/under
 * 0.9-1.0 amber   — slight slip
 * < 0.9   red     — material slip
 */
export function indexHealth(value) {
  if (value >= 1.0) return { tone: 'emerald', label: 'On track', dot: 'bg-emerald-500' };
  if (value >= 0.9) return { tone: 'amber', label: 'At risk', dot: 'bg-amber-500' };
  return { tone: 'rose', label: 'Off track', dot: 'bg-rose-500' };
}

/**
 * Forecast schedule slip in days, based on SPI.
 * negative = ahead of schedule, positive = behind.
 */
export function forecastSlipDays(project) {
  const evm = calculateEVM(project);
  if (!project?.start_date || !project?.target_end_date) return 0;
  const total =
    (new Date(project.target_end_date) - new Date(project.start_date)) / 86400000;
  if (evm.SPI <= 0) return total;
  const forecastDuration = total / evm.SPI;
  return Math.round(forecastDuration - total);
}

/**
 * Critical Path Method (CPM) — compute earliest start/finish and float
 * for each phase based on dependencies. Returns phases enriched with
 * { ES, EF, LS, LF, slack, isCritical }.
 */
export function computeCriticalPath(phases = []) {
  if (!phases.length) return [];

  const byId = Object.fromEntries(phases.map((p) => [p.id, { ...p }]));
  const duration = (p) => {
    if (!p.start_date || !p.end_date) return 1;
    return Math.max(
      1,
      Math.round((new Date(p.end_date) - new Date(p.start_date)) / 86400000)
    );
  };

  // Forward pass — ES / EF
  const visited = new Set();
  const forward = (id) => {
    if (visited.has(id)) return;
    const p = byId[id];
    if (!p) return;
    const deps = p.dependencies || [];
    deps.forEach(forward);
    const earliestStart = deps.length
      ? Math.max(...deps.map((d) => byId[d]?.EF ?? 0))
      : 0;
    p.ES = earliestStart;
    p.EF = earliestStart + duration(p);
    visited.add(id);
  };
  phases.forEach((p) => forward(p.id));

  const projectEnd = Math.max(...Object.values(byId).map((p) => p.EF ?? 0));

  // Backward pass — LS / LF
  const visitedBack = new Set();
  const backward = (id) => {
    if (visitedBack.has(id)) return;
    const p = byId[id];
    if (!p) return;
    const successors = phases.filter((s) => (s.dependencies || []).includes(id));
    successors.forEach((s) => backward(s.id));
    const latestFinish = successors.length
      ? Math.min(...successors.map((s) => byId[s.id]?.LS ?? projectEnd))
      : projectEnd;
    p.LF = latestFinish;
    p.LS = latestFinish - duration(p);
    p.slack = p.LS - p.ES;
    p.isCritical = p.slack === 0;
    visitedBack.add(id);
  };
  phases.forEach((p) => backward(p.id));

  return phases.map((p) => byId[p.id]);
}