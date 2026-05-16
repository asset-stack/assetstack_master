import { jsPDF } from 'npm:jspdf@2.5.1';

// Color palette (RGB)
const COLORS = {
  indigo: [79, 70, 229],
  indigoDark: [55, 48, 163],
  slate900: [15, 23, 42],
  slate700: [51, 65, 85],
  slate500: [100, 116, 139],
  slate400: [148, 163, 184],
  slate200: [226, 232, 240],
  slate100: [241, 245, 249],
  slate50: [248, 250, 252],
  white: [255, 255, 255],
  emerald: [16, 185, 129],
  amber: [245, 158, 11],
  rose: [244, 63, 94],
  sky: [14, 165, 233],
  violet: [139, 92, 246],
};

const PAGE_W = 297; // A4 landscape mm
const PAGE_H = 210;

function setFill(doc, c) { doc.setFillColor(c[0], c[1], c[2]); }
function setText(doc, c) { doc.setTextColor(c[0], c[1], c[2]); }
function setDraw(doc, c) { doc.setDrawColor(c[0], c[1], c[2]); }

function drawPageFrame(doc, pageNum, total) {
  // Top accent bar
  setFill(doc, COLORS.indigo);
  doc.rect(0, 0, PAGE_W, 3, 'F');
  // Footer line
  setDraw(doc, COLORS.slate200);
  doc.setLineWidth(0.2);
  doc.line(20, PAGE_H - 12, PAGE_W - 20, PAGE_H - 12);
  // Footer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, COLORS.slate400);
  doc.text('AssetStack — AI Asset Intelligence Platform', 20, PAGE_H - 6);
  doc.text(`${pageNum} / ${total}`, PAGE_W - 20, PAGE_H - 6, { align: 'right' });
}

function sectionTitle(doc, kicker, title) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, COLORS.indigo);
  doc.text(kicker.toUpperCase(), 20, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  setText(doc, COLORS.slate900);
  doc.text(title, 20, 36);
  setDraw(doc, COLORS.indigo);
  doc.setLineWidth(0.8);
  doc.line(20, 40, 50, 40);
}

function featureCard(doc, x, y, w, h, title, body, accent) {
  // Card
  setFill(doc, COLORS.white);
  setDraw(doc, COLORS.slate200);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');
  // Accent stripe
  setFill(doc, accent);
  doc.roundedRect(x, y, 1.6, h, 0.8, 0.8, 'F');
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setText(doc, COLORS.slate900);
  doc.text(title, x + 6, y + 9);
  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(doc, COLORS.slate700);
  const lines = doc.splitTextToSize(body, w - 10);
  doc.text(lines, x + 6, y + 16);
}

function statCard(doc, x, y, w, h, value, label, accent) {
  setFill(doc, COLORS.slate900);
  doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setText(doc, accent);
  doc.text(value, x + w / 2, y + h / 2 + 1, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setText(doc, COLORS.slate400);
  doc.text(label.toUpperCase(), x + w / 2, y + h - 5, { align: 'center' });
}

function bulletLine(doc, x, y, text, accent) {
  setFill(doc, accent);
  doc.circle(x + 1.2, y - 1.4, 1.2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setText(doc, COLORS.slate700);
  doc.text(text, x + 5, y);
}

// ---------- PAGES ----------

function pageCover(doc) {
  setFill(doc, COLORS.slate900);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  // Indigo glow strip
  setFill(doc, COLORS.indigo);
  doc.rect(0, 0, 4, PAGE_H, 'F');
  // Decorative dots
  setFill(doc, COLORS.indigoDark);
  for (let i = 0; i < 40; i++) {
    doc.circle(180 + (i % 8) * 12, 30 + Math.floor(i / 8) * 14, 0.6, 'F');
  }
  // Eyebrow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setText(doc, COLORS.indigo);
  doc.text('ASSETSTACK · PLATFORM OVERVIEW', 20, 40);
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(44);
  setText(doc, COLORS.white);
  doc.text('The AI command', 20, 80);
  doc.text('center for your', 20, 96);
  setText(doc, COLORS.indigo);
  doc.text('entire portfolio.', 20, 112);
  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  setText(doc, COLORS.slate400);
  const sub = 'Predict failures before they happen. Automate maintenance. See every asset in one place. Cut costs without cutting service.';
  doc.text(doc.splitTextToSize(sub, 170), 20, 130);
  // Footer meta
  setDraw(doc, COLORS.slate700);
  doc.setLineWidth(0.3);
  doc.line(20, 180, 100, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, COLORS.white);
  doc.text('A platform brief for asset, facilities & finance leaders', 20, 188);
  doc.setFont('helvetica', 'normal');
  setText(doc, COLORS.slate400);
  doc.text(`Edition ${new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`, 20, 195);
}

function pageProblem(doc) {
  setFill(doc, COLORS.white);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  sectionTitle(doc, 'The problem', 'Asset teams are flying blind.');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setText(doc, COLORS.slate700);
  const intro = 'Most organisations still manage millions of dollars of infrastructure with spreadsheets, paper inspections, and reactive maintenance. The result: surprise failures, runaway costs, and audit panic every year.';
  doc.text(doc.splitTextToSize(intro, 250), 20, 54);

  const pains = [
    ['Reactive, not predictive', 'Failures happen before anyone sees them coming. Emergency repairs cost 3–5× planned work.'],
    ['Data trapped in silos', 'CMMS, finance, scans, sensors and field notes never talk to each other.'],
    ['Manual inspections', 'Clipboards and photos that never get analysed. Findings lost between teams.'],
    ['Budget guesswork', 'Capital plans built on age, not condition. Renewals deferred until something breaks.'],
    ['Compliance scramble', 'Certifications and inspections tracked in someone\'s inbox.'],
    ['No single source of truth', 'Every meeting starts with reconciling numbers.'],
  ];

  const cardW = 82, cardH = 36, gap = 5;
  let x = 20, y = 80;
  pains.forEach((p, i) => {
    featureCard(doc, x, y, cardW, cardH, p[0], p[1], COLORS.rose);
    x += cardW + gap;
    if ((i + 1) % 3 === 0) { x = 20; y += cardH + gap; }
  });
}

function pageSolution(doc) {
  setFill(doc, COLORS.white);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  sectionTitle(doc, 'The platform', 'One intelligent command center.');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setText(doc, COLORS.slate700);
  const intro = 'AssetStack unifies your assets, sensors, scans, work orders, finance and compliance into a single AI-powered platform. AssetMind — your built-in AI operator — reasons across all of it and acts on your behalf.';
  doc.text(doc.splitTextToSize(intro, 250), 20, 54);

  // Pillars
  const pillars = [
    ['SEE', 'Every asset, location, scan and sensor in one live view.', COLORS.sky],
    ['PREDICT', 'AI forecasts failures, costs, and renewal needs — months ahead.', COLORS.violet],
    ['ACT', 'AssetMind creates work orders, schedules teams, and orders parts.', COLORS.emerald],
    ['PROVE', 'Auditable savings ledger, compliance trail, and board-ready reports.', COLORS.amber],
  ];

  const cardW = 62, cardH = 70;
  let x = 20;
  const y = 82;
  pillars.forEach((p) => {
    setFill(doc, COLORS.slate50);
    setDraw(doc, COLORS.slate200);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, 'FD');
    // Pillar label
    setFill(doc, p[2]);
    doc.roundedRect(x + 6, y + 6, 22, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setText(doc, COLORS.white);
    doc.text(p[0], x + 17, y + 11, { align: 'center' });
    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, COLORS.slate700);
    doc.text(doc.splitTextToSize(p[1], cardW - 12), x + 6, y + 24);
    x += cardW + 5;
  });
}

function pageFeatures(doc) {
  setFill(doc, COLORS.white);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  sectionTitle(doc, 'Capabilities', 'Everything your team needs.');

  const features = [
    ['Predictive Maintenance', 'ML models forecast failure probability & remaining useful life per asset.', COLORS.violet],
    ['Digital Twin & Scans', 'LiDAR + photogrammetry with AI defect detection on every frame.', COLORS.sky],
    ['Work Orders & Scheduling', 'Auto-generated, auto-assigned, with checklists and mobile capture.', COLORS.emerald],
    ['Sensors & IoT', 'Live readings, anomaly detection, threshold alerts.', COLORS.amber],
    ['Capital Planning', 'Risk-scored renewal forecasts and scenario modelling.', COLORS.rose],
    ['Compliance Hub', 'Track every certification, inspection and document with auto-reminders.', COLORS.indigo],
    ['Spare Parts & Suppliers', 'Inventory, demand forecasting, auto-reorder POs.', COLORS.sky],
    ['Savings Ledger', 'Every prevented failure is logged, verified and dollar-quantified.', COLORS.emerald],
    ['AssetMind AI', 'Chat to create, query, predict, report — across the whole platform.', COLORS.violet],
  ];

  const cardW = 82, cardH = 36, gap = 5;
  let x = 20, y = 54;
  features.forEach((f, i) => {
    featureCard(doc, x, y, cardW, cardH, f[0], f[1], f[2]);
    x += cardW + gap;
    if ((i + 1) % 3 === 0) { x = 20; y += cardH + gap; }
  });
}

function pageAssetMind(doc) {
  setFill(doc, COLORS.slate900);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  // Kicker
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, COLORS.indigo);
  doc.text('ASSETMIND · YOUR AI OPERATOR', 20, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  setText(doc, COLORS.white);
  doc.text('Not a chatbot. A command center.', 20, 38);
  setDraw(doc, COLORS.indigo);
  doc.setLineWidth(0.8);
  doc.line(20, 42, 50, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setText(doc, COLORS.slate400);
  const intro = 'AssetMind has full read/write access to every entity in your platform and can call specialised AI pipelines on demand. Ask in plain English — it plans, looks up records, executes, and reports back.';
  doc.text(doc.splitTextToSize(intro, 250), 20, 54);

  // Capability bullets
  const caps = [
    'Predict failures across the portfolio in one prompt',
    'Auto-create work orders and assign technicians',
    'Run AI vision on scans and triage defects',
    'Generate morning briefings and board reports',
    'Forecast budgets and model renewal scenarios',
    'Send notifications and update compliance records',
  ];
  let y = 78;
  caps.forEach((c) => {
    setFill(doc, COLORS.indigo);
    doc.circle(22, y - 1.4, 1.4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    setText(doc, COLORS.white);
    doc.text(c, 28, y);
    y += 9;
  });

  // Right panel — example prompt
  setFill(doc, [30, 41, 59]);
  doc.roundedRect(170, 60, 110, 110, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, COLORS.indigo);
  doc.text('EXAMPLE PROMPT', 178, 72);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setText(doc, COLORS.white);
  const prompt = '"Find every pump with health < 60, schedule urgent inspections next week, and assign them to the senior team."';
  doc.text(doc.splitTextToSize(prompt, 96), 178, 82);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, COLORS.emerald);
  doc.text('ASSETMIND DOES', 178, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(doc, COLORS.slate400);
  const did = '✓ Queries Equipment\n✓ Filters by health & type\n✓ Looks up senior technicians\n✓ Creates 7 work orders\n✓ Sends assignment emails\n✓ Returns a summary table';
  doc.text(did.split('\n'), 178, 130, { lineHeightFactor: 1.6 });
}

function pageImpact(doc) {
  setFill(doc, COLORS.white);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  sectionTitle(doc, 'The impact', 'Numbers our customers see.');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setText(doc, COLORS.slate700);
  doc.text('Typical outcomes within the first 90 days of deployment.', 20, 54);

  // 4 stat cards
  const stats = [
    ['68%', 'Fewer surprise failures', COLORS.emerald],
    ['3.2×', 'Faster work order cycle', COLORS.sky],
    ['$1.4M', 'Avg verified savings / yr', COLORS.amber],
    ['94%', 'Compliance on-time rate', COLORS.violet],
  ];
  const cardW = 62, cardH = 50, gap = 5;
  let x = 20;
  stats.forEach((s) => {
    statCard(doc, x, 66, cardW, cardH, s[0], s[1], s[2]);
    x += cardW + gap;
  });

  // Benefit list
  sectionTitle.call(null, doc, '', ''); // no-op
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setText(doc, COLORS.slate900);
  doc.text('Where the value comes from', 20, 130);

  const benefits = [
    'Catching bearing wear, corrosion and cracks weeks before breakdown',
    'Eliminating duplicate inspections and lost paperwork',
    'Right-sizing renewal budgets with condition-based forecasts',
    'Cutting emergency callouts and overtime spend',
    'Replacing 4-hour board reports with 30-second generated briefings',
  ];
  let y = 142;
  benefits.forEach((b) => {
    bulletLine(doc, 22, y, b, COLORS.indigo);
    y += 8;
  });
}

function pageIndustries(doc) {
  setFill(doc, COLORS.white);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  sectionTitle(doc, 'Who it\'s for', 'Built for asset-heavy organisations.');

  const inds = [
    ['Local Government & Councils', 'Roads, buildings, parks, water, lighting — one register, one renewal plan.', COLORS.emerald],
    ['Facilities Management', 'HVAC, lifts, fire, security across portfolios — predictive PPM at scale.', COLORS.sky],
    ['Rail & Transport', 'Track geometry, signals, switches — condition scoring and cascade risk.', COLORS.violet],
    ['Utilities & Energy', 'Generators, transformers, lines — RUL forecasting on critical equipment.', COLORS.amber],
    ['Education & Health Estates', 'Compliance-heavy environments — automate audits and certifications.', COLORS.rose],
    ['Industrial & Manufacturing', 'Pumps, motors, compressors — sensor-fused predictive maintenance.', COLORS.indigo],
  ];
  const cardW = 82, cardH = 38, gap = 5;
  let x = 20, y = 54;
  inds.forEach((p, i) => {
    featureCard(doc, x, y, cardW, cardH, p[0], p[1], p[2]);
    x += cardW + gap;
    if ((i + 1) % 3 === 0) { x = 20; y += cardH + gap; }
  });
}

function pageSecurity(doc) {
  setFill(doc, COLORS.white);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  sectionTitle(doc, 'Trust', 'Security & data integrity.');

  const items = [
    ['Role-based access', 'Granular permissions per role with full audit trail.'],
    ['Audit logs', 'Every sensitive action recorded, exportable for review.'],
    ['Encrypted at rest & in transit', 'TLS everywhere, encrypted storage.'],
    ['Data residency options', 'Choose where your data lives.'],
    ['Verified savings claims', 'Every $ saved is evidenced, reviewable, and disputable.'],
    ['SSO & MFA ready', 'Enterprise login flows supported.'],
  ];
  const cardW = 82, cardH = 36, gap = 5;
  let x = 20, y = 54;
  items.forEach((p, i) => {
    featureCard(doc, x, y, cardW, cardH, p[0], p[1], COLORS.indigo);
    x += cardW + gap;
    if ((i + 1) % 3 === 0) { x = 20; y += cardH + gap; }
  });
}

function pageRoadmap(doc) {
  setFill(doc, COLORS.white);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  sectionTitle(doc, 'Getting started', 'Your first 30 days.');

  const phases = [
    ['Week 1', 'Onboard & import', 'Connect data sources, import asset register, configure roles and locations.', COLORS.sky],
    ['Week 2', 'Inspect & scan', 'Run first LiDAR/photogrammetry scans. AssetMind detects defects automatically.', COLORS.violet],
    ['Week 3', 'Predict & schedule', 'Failure forecasts go live. Predictive work orders start auto-generating.', COLORS.emerald],
    ['Week 4', 'Report & prove', 'First board-ready briefing. Savings ledger begins tracking verified outcomes.', COLORS.amber],
  ];
  const cardW = 62, cardH = 80, gap = 5;
  let x = 20;
  phases.forEach((p) => {
    setFill(doc, COLORS.slate50);
    setDraw(doc, COLORS.slate200);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, 60, cardW, cardH, 3, 3, 'FD');
    // Phase tag
    setFill(doc, p[3]);
    doc.roundedRect(x + 6, 66, 22, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setText(doc, COLORS.white);
    doc.text(p[0].toUpperCase(), x + 17, 71, { align: 'center' });
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    setText(doc, COLORS.slate900);
    doc.text(p[1], x + 6, 82);
    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(doc, COLORS.slate700);
    doc.text(doc.splitTextToSize(p[2], cardW - 12), x + 6, 92);
    x += cardW + gap;
  });
}

function pageCTA(doc) {
  setFill(doc, COLORS.slate900);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  // Indigo accent block
  setFill(doc, COLORS.indigo);
  doc.rect(0, 0, 4, PAGE_H, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, COLORS.indigo);
  doc.text('LET\'S TALK', 20, 40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  setText(doc, COLORS.white);
  doc.text('See AssetStack', 20, 80);
  doc.text('on your own data.', 20, 96);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  setText(doc, COLORS.slate400);
  const body = 'Book a 30-minute walkthrough. We\'ll import a sample of your assets and show you the first set of AI predictions live.';
  doc.text(doc.splitTextToSize(body, 200), 20, 112);

  // CTA "button"
  setFill(doc, COLORS.indigo);
  doc.roundedRect(20, 140, 70, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setText(doc, COLORS.white);
  doc.text('Book a demo →', 55, 149, { align: 'center' });

  // Contact strip
  setDraw(doc, COLORS.slate700);
  doc.setLineWidth(0.3);
  doc.line(20, 175, PAGE_W - 20, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setText(doc, COLORS.white);
  doc.text('ASSETSTACK', 20, 185);
  doc.setFont('helvetica', 'normal');
  setText(doc, COLORS.slate400);
  doc.text('AI Asset Intelligence Platform · assetstack.ai', 20, 192);
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pages = [
      pageCover,
      pageProblem,
      pageSolution,
      pageFeatures,
      pageAssetMind,
      pageImpact,
      pageIndustries,
      pageSecurity,
      pageRoadmap,
      pageCTA,
    ];

    pages.forEach((render, idx) => {
      if (idx > 0) doc.addPage();
      render(doc);
      // Page frame on all non-cover, non-CTA pages
      if (idx !== 0 && idx !== pages.length - 1) {
        drawPageFrame(doc, idx + 1, pages.length);
      }
    });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="AssetStack-Platform-Overview.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});