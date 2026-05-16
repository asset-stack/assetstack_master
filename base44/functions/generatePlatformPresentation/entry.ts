import { jsPDF } from 'npm:jspdf@2.5.1';

// ============ DESIGN TOKENS ============
const C = {
  indigo: [79, 70, 229],
  indigoDeep: [55, 48, 163],
  indigoSoft: [199, 210, 254],
  ink: [11, 18, 32],
  slate900: [15, 23, 42],
  slate800: [30, 41, 59],
  slate700: [51, 65, 85],
  slate600: [71, 85, 105],
  slate500: [100, 116, 139],
  slate400: [148, 163, 184],
  slate300: [203, 213, 225],
  slate200: [226, 232, 240],
  slate100: [241, 245, 249],
  slate50: [248, 250, 252],
  white: [255, 255, 255],
  emerald: [16, 185, 129],
  emeraldSoft: [209, 250, 229],
  amber: [245, 158, 11],
  amberSoft: [254, 243, 199],
  rose: [244, 63, 94],
  roseSoft: [255, 228, 230],
  sky: [14, 165, 233],
  skySoft: [224, 242, 254],
  violet: [139, 92, 246],
  violetSoft: [237, 233, 254],
};

const W = 297, H = 210; // A4 landscape mm

// ============ DRAWING HELPERS ============
const fill = (d, c) => d.setFillColor(c[0], c[1], c[2]);
const text = (d, c) => d.setTextColor(c[0], c[1], c[2]);
const draw = (d, c) => d.setDrawColor(c[0], c[1], c[2]);

function bg(d, c) { fill(d, c); d.rect(0, 0, W, H, 'F'); }

function topAccent(d) {
  fill(d, C.indigo); d.rect(0, 0, W, 2.5, 'F');
}

function footer(d, pageNum, total) {
  draw(d, C.slate200); d.setLineWidth(0.2);
  d.line(20, H - 12, W - 20, H - 12);
  d.setFont('helvetica', 'normal'); d.setFontSize(8);
  text(d, C.slate400);
  d.text('AssetStack · AI Asset Intelligence Platform', 20, H - 6);
  d.text(`${pageNum} / ${total}`, W - 20, H - 6, { align: 'right' });
}

function kicker(d, label, y = 24, color = C.indigo) {
  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, color);
  d.text(label.toUpperCase(), 20, y);
}

function title(d, t, y = 36, color = C.slate900, size = 26) {
  d.setFont('helvetica', 'bold'); d.setFontSize(size);
  text(d, color);
  d.text(t, 20, y);
  draw(d, C.indigo); d.setLineWidth(0.8);
  d.line(20, y + 4, 50, y + 4);
}

function lede(d, t, y, w = 250, color = C.slate700, size = 11) {
  d.setFont('helvetica', 'normal'); d.setFontSize(size);
  text(d, color);
  d.text(d.splitTextToSize(t, w), 20, y);
}

function pill(d, x, y, label, bgColor, fgColor, padX = 4) {
  d.setFont('helvetica', 'bold'); d.setFontSize(7.5);
  const w = d.getTextWidth(label) + padX * 2;
  fill(d, bgColor); d.roundedRect(x, y - 4, w, 6, 1.5, 1.5, 'F');
  text(d, fgColor); d.text(label, x + padX, y);
  return w;
}

function card(d, x, y, w, h, opts = {}) {
  fill(d, opts.bg || C.white);
  draw(d, opts.border || C.slate200);
  d.setLineWidth(opts.line || 0.3);
  d.roundedRect(x, y, w, h, opts.r || 2.5, opts.r || 2.5, 'FD');
}

function accentCard(d, x, y, w, h, t, body, accent) {
  card(d, x, y, w, h);
  fill(d, accent); d.roundedRect(x, y, 1.6, h, 0.8, 0.8, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(10.5);
  text(d, C.slate900); d.text(t, x + 6, y + 8);
  d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
  text(d, C.slate600);
  d.text(d.splitTextToSize(body, w - 10), x + 6, y + 14);
}

function statTile(d, x, y, w, h, value, label, accent) {
  fill(d, C.slate900); d.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(28);
  text(d, accent); d.text(value, x + w / 2, y + h / 2 + 1, { align: 'center' });
  d.setFont('helvetica', 'normal'); d.setFontSize(7.5);
  text(d, C.slate400);
  d.text(label.toUpperCase(), x + w / 2, y + h - 5, { align: 'center' });
}

function bullet(d, x, y, t, accent = C.indigo, color = C.slate700, size = 10) {
  fill(d, accent); d.circle(x + 1.2, y - 1.4, 1.2, 'F');
  d.setFont('helvetica', 'normal'); d.setFontSize(size);
  text(d, color); d.text(t, x + 5, y);
}

function check(d, x, y, t, color = C.slate700) {
  draw(d, C.emerald); d.setLineWidth(0.9);
  d.line(x, y - 1.5, x + 1.5, y);
  d.line(x + 1.5, y, x + 4, y - 3);
  d.setFont('helvetica', 'normal'); d.setFontSize(9.5);
  text(d, color); d.text(t, x + 7, y);
}

// ============ PAGES ============

function pCover(d) {
  bg(d, C.slate900);
  // Indigo glow accent
  fill(d, C.indigo); d.rect(0, 0, 4, H, 'F');
  // Subtle dot grid
  fill(d, C.indigoDeep);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
    d.circle(180 + c * 11, 24 + r * 12, 0.6, 'F');

  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, C.indigoSoft);
  d.text('ASSETSTACK · 2026 PLATFORM EDITION', 20, 38);

  d.setFont('helvetica', 'bold'); d.setFontSize(46);
  text(d, C.white);
  d.text('The AI command', 20, 78);
  d.text('center for every', 20, 95);
  text(d, C.indigoSoft);
  d.text('asset you own.', 20, 112);

  d.setFont('helvetica', 'normal'); d.setFontSize(13);
  text(d, C.slate400);
  d.text(d.splitTextToSize('Predict failures. Automate work orders. Plan capital with confidence. One platform, every asset, run by AI that actually works.', 175), 20, 128);

  // Hero stats strip
  const strip = [
    ['$1.4M', 'avg verified savings / yr'],
    ['68%', 'fewer surprise failures'],
    ['3.2×', 'faster work order cycle'],
    ['<5 min', 'to onboard 1,000 assets'],
  ];
  let x = 20;
  strip.forEach(([v, l]) => {
    fill(d, [22, 30, 46]); d.roundedRect(x, 162, 56, 28, 2.5, 2.5, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(18);
    text(d, C.indigoSoft); d.text(v, x + 4, 175);
    d.setFont('helvetica', 'normal'); d.setFontSize(7.5);
    text(d, C.slate400); d.text(l.toUpperCase(), x + 4, 184);
    x += 60;
  });
}

function pTOC(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, "What's inside");
  title(d, 'A complete platform tour.');

  const items = [
    ['01', 'The reality today', 'Why asset teams are flying blind.'],
    ['02', 'The AssetStack way', 'Four pillars: See · Predict · Act · Prove.'],
    ['03', 'AssetMind in action', 'The AI operator that runs the platform.'],
    ['04', 'Onboarding speed', 'From spreadsheet to live portfolio in minutes.'],
    ['05', 'Predictive maintenance', 'How we forecast failures before they happen.'],
    ['06', 'Digital twin & scans', 'LiDAR + AI vision on every frame.'],
    ['07', 'Work orders & field ops', 'Auto-generated, auto-assigned, mobile-first.'],
    ['08', 'Finance & capital plan', 'Risk-scored renewals and scenario modelling.'],
    ['09', 'Compliance & audit', 'Zero-panic certification tracking.'],
    ['10', 'Security & trust', 'Enterprise-grade, transparently.'],
    ['11', 'Outcomes & ROI', 'The numbers our customers report.'],
    ['12', 'Get started', 'Your first 30 days.'],
  ];

  const colW = 130, rowH = 9.5;
  items.forEach((it, i) => {
    const col = Math.floor(i / 6);
    const row = i % 6;
    const x = 20 + col * (colW + 5);
    const y = 60 + row * rowH;
    d.setFont('helvetica', 'bold'); d.setFontSize(10);
    text(d, C.indigo); d.text(it[0], x, y);
    text(d, C.slate900); d.text(it[1], x + 11, y);
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
    text(d, C.slate500); d.text(it[2], x + 11, y + 4);
  });
}

function pProblem(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '01 · The reality today');
  title(d, 'Asset teams are flying blind.');
  lede(d, 'Most organisations still manage millions in infrastructure with spreadsheets, paper inspections and reactive callouts. The cost shows up in every budget cycle.', 54);

  const pains = [
    ['Reactive, not predictive', 'Emergency repairs cost 3–5× planned work. Failures happen before anyone sees them coming.'],
    ['Silos everywhere', 'CMMS, finance, scans, sensors and field notes never talk to each other.'],
    ['Inspections lost in PDFs', 'Thousands of clipboard findings that nobody can search or trend.'],
    ['Budget guesswork', 'Capital plans built on age, not condition. Renewals deferred until something breaks.'],
    ['Compliance scramble', 'Certifications tracked in someone\'s inbox. Audit week = panic week.'],
    ['No single source of truth', 'Every meeting starts with reconciling numbers from 4 systems.'],
  ];
  const cw = 82, ch = 38, gap = 5;
  let x = 20, y = 78;
  pains.forEach((p, i) => {
    accentCard(d, x, y, cw, ch, p[0], p[1], C.rose);
    x += cw + gap;
    if ((i + 1) % 3 === 0) { x = 20; y += ch + gap; }
  });
}

function pSolution(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '02 · The AssetStack way');
  title(d, 'One intelligent command center.');
  lede(d, 'Every asset, every sensor, every scan, every dollar — unified. AssetMind sits on top and acts on your behalf.', 54);

  const pillars = [
    ['SEE', 'Live portfolio view', 'Every asset, location, scan and sensor reading in one place. Drill from globe → site → asset in two clicks.', C.sky],
    ['PREDICT', 'AI forecasts', 'Failure probability, remaining useful life, and condition trends — per asset, updated continuously.', C.violet],
    ['ACT', 'AssetMind operates', 'Creates work orders, schedules teams, orders parts, sends notifications — all from plain English.', C.emerald],
    ['PROVE', 'Auditable proof', 'Verified savings ledger, compliance trail, and board-ready reports generated on demand.', C.amber],
  ];
  const cw = 62, ch = 92;
  let x = 20;
  const y = 76;
  pillars.forEach((p) => {
    card(d, x, y, cw, ch, { bg: C.slate50 });
    fill(d, p[3]); d.roundedRect(x + 6, y + 6, 28, 7.5, 1.8, 1.8, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(8);
    text(d, C.white); d.text(p[0], x + 20, y + 11.5, { align: 'center' });
    d.setFont('helvetica', 'bold'); d.setFontSize(12);
    text(d, C.slate900); d.text(p[1], x + 6, y + 24);
    d.setFont('helvetica', 'normal'); d.setFontSize(9);
    text(d, C.slate600);
    d.text(d.splitTextToSize(p[2], cw - 12), x + 6, y + 32);
    x += cw + 5;
  });

  // Bottom strip
  fill(d, C.slate900); d.roundedRect(20, 178, 257, 14, 2, 2, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(10);
  text(d, C.white);
  d.text('From silos and spreadsheets to a single AI-powered operating layer.', 148.5, 187, { align: 'center' });
}

function pAssetMind(d) {
  bg(d, C.slate900);
  topAccent(d);
  // Header
  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, C.indigoSoft);
  d.text('03 · ASSETMIND IN ACTION', 20, 22);
  d.setFont('helvetica', 'bold'); d.setFontSize(28);
  text(d, C.white);
  d.text('Not a chatbot. A command center.', 20, 36);
  draw(d, C.indigo); d.setLineWidth(0.8);
  d.line(20, 40, 50, 40);

  d.setFont('helvetica', 'normal'); d.setFontSize(11);
  text(d, C.slate400);
  d.text(d.splitTextToSize('AssetMind has full read/write access to every record and can invoke specialised AI pipelines. Ask in plain English — it plans, looks up, executes, and reports back.', 130), 20, 52);

  // Capabilities bullets (left)
  const caps = [
    'Predict failures across the entire portfolio',
    'Auto-create work orders and assign technicians',
    'Run AI vision on scans and triage defects',
    'Generate morning briefings and board reports',
    'Forecast budgets and model renewal scenarios',
    'Send notifications, update compliance records',
  ];
  let y = 78;
  caps.forEach((c) => {
    fill(d, C.indigo); d.circle(22, y - 1.4, 1.3, 'F');
    d.setFont('helvetica', 'normal'); d.setFontSize(10);
    text(d, C.white); d.text(c, 27, y);
    y += 8.5;
  });

  // ===== CHAT MOCKUP (right side) =====
  const cx = 160, cy = 50, cw = 117, ch = 145;
  fill(d, [20, 27, 45]); d.roundedRect(cx, cy, cw, ch, 3, 3, 'F');
  // Title bar
  fill(d, [30, 41, 59]); d.roundedRect(cx, cy, cw, 11, 3, 3, 'F');
  d.rect(cx, cy + 6, cw, 5, 'F');
  // Traffic lights
  fill(d, [244, 99, 92]); d.circle(cx + 4, cy + 5.5, 1.1, 'F');
  fill(d, [245, 191, 79]); d.circle(cx + 7.5, cy + 5.5, 1.1, 'F');
  fill(d, [98, 197, 99]); d.circle(cx + 11, cy + 5.5, 1.1, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(7.5);
  text(d, C.slate400); d.text('AssetMind · Conversation', cx + cw / 2, cy + 7, { align: 'center' });

  // User msg
  fill(d, C.indigo); d.roundedRect(cx + 28, cy + 16, 85, 18, 2, 2, 'F');
  d.setFont('helvetica', 'normal'); d.setFontSize(8);
  text(d, C.white);
  d.text(d.splitTextToSize('Find every pump with health < 60, schedule urgent inspections next week, and assign to the senior team.', 80), cx + 30, cy + 21);

  // AI thinking pill
  fill(d, [30, 41, 59]); d.roundedRect(cx + 4, cy + 38, 30, 6, 1.5, 1.5, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(6.5);
  text(d, C.indigoSoft); d.text('▸ PLANNING…', cx + 6, cy + 42);

  // Tool calls
  const tools = [
    ['Equipment.filter', '{type:"pump", health<60}', 7],
    ['Technician.filter', '{cert:"senior", available}', 3],
    ['WorkOrder.create', '×7 records', 7],
    ['sendNotificationEmail', '→ assigned techs', 7],
  ];
  let ty = cy + 50;
  tools.forEach(([fn, args, n]) => {
    fill(d, [30, 41, 59]); d.roundedRect(cx + 4, ty, 109, 10, 1.5, 1.5, 'F');
    fill(d, C.emerald); d.circle(cx + 8, ty + 5, 1.1, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(7);
    text(d, C.white); d.text(fn, cx + 12, ty + 4);
    d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
    text(d, C.slate400); d.text(args, cx + 12, ty + 8);
    d.setFont('helvetica', 'bold'); d.setFontSize(6.5);
    text(d, C.emerald); d.text(`✓ ${n}`, cx + cw - 6, ty + 6, { align: 'right' });
    ty += 11.5;
  });

  // AI reply
  fill(d, [30, 41, 59]); d.roundedRect(cx + 4, ty + 2, 109, 30, 2, 2, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(7.5);
  text(d, C.indigoSoft); d.text('ASSETMIND', cx + 6, ty + 7);
  d.setFont('helvetica', 'normal'); d.setFontSize(7.5);
  text(d, C.white);
  d.text(d.splitTextToSize('Done. 7 work orders created (WO-20260516-…), assigned to 3 senior techs, scheduled for May 20–22. Notifications sent. Want me to draft the toolbox talk?', 105), cx + 6, ty + 12);
}

function pSpeed(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '04 · Onboarding speed');
  title(d, 'Spreadsheet to live portfolio in minutes.');
  lede(d, 'Drop your asset register. AssetMind parses it, infers asset types, links locations, computes health and risk, and generates your first predictions — automatically.', 54);

  // Timeline
  const steps = [
    ['00:00', 'Drop CSV / Excel', '1,000+ rows accepted', C.sky],
    ['00:08', 'AI parsing', 'Columns mapped, types inferred', C.violet],
    ['00:42', 'Locations linked', 'GPS resolved, hierarchy built', C.indigo],
    ['01:30', 'Health computed', 'Risk scored per asset', C.amber],
    ['02:15', 'Predictions live', 'First failure forecasts ready', C.emerald],
    ['< 5:00', 'Done', 'Portfolio fully searchable', C.emerald],
  ];

  // Track line
  draw(d, C.slate200); d.setLineWidth(0.6);
  d.line(28, 110, 269, 110);

  const segW = (269 - 28) / (steps.length - 1);
  steps.forEach((s, i) => {
    const x = 28 + i * segW;
    // Node
    fill(d, C.white);
    draw(d, s[3]); d.setLineWidth(1.2);
    d.circle(x, 110, 4, 'FD');
    fill(d, s[3]); d.circle(x, 110, 2, 'F');
    // Time label
    d.setFont('helvetica', 'bold'); d.setFontSize(9);
    text(d, C.slate900); d.text(s[0], x, 100, { align: 'center' });
    // Title
    d.setFont('helvetica', 'bold'); d.setFontSize(9);
    text(d, s[3]); d.text(s[1], x, 122, { align: 'center' });
    // Sub
    d.setFont('helvetica', 'normal'); d.setFontSize(7.5);
    text(d, C.slate500);
    d.text(d.splitTextToSize(s[2], 36), x, 128, { align: 'center' });
  });

  // Before/after panels
  card(d, 20, 148, 125, 42, { bg: C.slate50 });
  pill(d, 24, 156, 'BEFORE', C.rose, C.white);
  d.setFont('helvetica', 'bold'); d.setFontSize(11);
  text(d, C.slate900); d.text('Weeks of consultants', 24, 167);
  d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
  text(d, C.slate600);
  d.text(d.splitTextToSize('Manual data cleaning, custom imports, bespoke field mapping, and a 6-week kickoff before anyone sees a dashboard.', 117), 24, 174);

  card(d, 152, 148, 125, 42, { bg: [240, 253, 244], border: C.emerald });
  pill(d, 156, 156, 'WITH ASSETSTACK', C.emerald, C.white);
  d.setFont('helvetica', 'bold'); d.setFontSize(11);
  text(d, C.slate900); d.text('Minutes, not weeks', 156, 167);
  d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
  text(d, C.slate600);
  d.text(d.splitTextToSize('Drag, drop, done. AssetMind parses your file, validates rows, and lights up dashboards before your coffee is cold.', 117), 156, 174);
}

function pPredict(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '05 · Predictive maintenance');
  title(d, 'See failures coming weeks ahead.');
  lede(d, 'Sensor data + condition reports + age + duty cycle fused into per-asset failure probability and remaining useful life. Updated continuously.', 54);

  // Left: feature checklist
  d.setFont('helvetica', 'bold'); d.setFontSize(11);
  text(d, C.slate900); d.text('What you get', 20, 80);
  const feats = [
    'Failure probability over next 30 / 90 / 365 days',
    'Remaining useful life (days) per asset',
    'Top failure modes ranked by likelihood',
    'Confidence band for every prediction',
    'Anomaly detection on live sensor streams',
    'Defect-cascade modelling to related assets',
    'Auto-generated work orders on threshold breach',
  ];
  let y = 90;
  feats.forEach((f) => { check(d, 22, y, f); y += 7.5; });

  // Right: risk dashboard mock
  const rx = 155, ry = 70;
  card(d, rx, ry, 122, 110, { bg: C.slate50 });
  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, C.slate500); d.text('RISK DASHBOARD', rx + 6, ry + 8);
  d.setFont('helvetica', 'bold'); d.setFontSize(13);
  text(d, C.slate900); d.text('Top 5 assets at risk', rx + 6, ry + 16);

  const rows = [
    ['Pump-03 · Lift Station 4', 92, C.rose],
    ['HVAC-12 · Town Hall L2', 81, C.rose],
    ['Generator-A · Depot', 67, C.amber],
    ['Lift-07 · Library', 54, C.amber],
    ['Motor-21 · Treatment', 38, C.emerald],
  ];
  let ly = ry + 26;
  rows.forEach(([n, p, col]) => {
    d.setFont('helvetica', 'bold'); d.setFontSize(8.5);
    text(d, C.slate900); d.text(n, rx + 6, ly);
    // Bar
    fill(d, C.slate200); d.roundedRect(rx + 6, ly + 2, 88, 3, 1, 1, 'F');
    fill(d, col); d.roundedRect(rx + 6, ly + 2, 88 * (p / 100), 3, 1, 1, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(8);
    text(d, col); d.text(`${p}%`, rx + 116, ly + 4, { align: 'right' });
    ly += 14;
  });
}

function pScans(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '06 · Digital twin & scans');
  title(d, 'Every defect, automatically.');
  lede(d, 'Upload a LiDAR or photogrammetry scan. AssetMind extracts frames, runs AI vision, locates anomalies in 3D, and queues them for human verification.', 54);

  // Workflow chevrons
  const flow = [
    ['1. Upload scan', '.obj / .glb / mesh', C.sky],
    ['2. Frame extraction', 'AI selects key views', C.violet],
    ['3. AI vision', 'Defects detected + ranked', C.indigo],
    ['4. Human verify', 'One-click approve / correct', C.amber],
    ['5. Auto WO', 'Work order generated', C.emerald],
  ];
  let x = 20;
  const fy = 78, fw = 51, fh = 22;
  flow.forEach((f, i) => {
    fill(d, f[2]); d.roundedRect(x, fy, fw, fh, 2, 2, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(9);
    text(d, C.white); d.text(f[0], x + fw / 2, fy + 10, { align: 'center' });
    d.setFont('helvetica', 'normal'); d.setFontSize(7.5);
    d.text(f[1], x + fw / 2, fy + 16, { align: 'center' });
    if (i < flow.length - 1) {
      // Arrow
      text(d, C.slate400); d.setFont('helvetica', 'bold'); d.setFontSize(12);
      d.text('→', x + fw + 1.5, fy + 14);
    }
    x += fw + 5;
  });

  // Anomaly types
  d.setFont('helvetica', 'bold'); d.setFontSize(11);
  text(d, C.slate900); d.text('Anomalies detected automatically', 20, 116);

  const ants = ['Cracks', 'Corrosion', 'Spalling', 'Water damage', 'Graffiti', 'Missing parts', 'Misalignment', 'Wear', 'Stains', 'Dents'];
  let ax = 20;
  ants.forEach((a) => {
    const w = pill(d, ax, 124, a, C.indigoSoft, C.indigoDeep, 4);
    ax += w + 4;
  });

  // Bottom callout
  fill(d, C.slate900); d.roundedRect(20, 140, 257, 50, 2.5, 2.5, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(11);
  text(d, C.indigoSoft); d.text('FEEDBACK LOOP', 28, 152);
  d.setFont('helvetica', 'bold'); d.setFontSize(15);
  text(d, C.white); d.text('Every human correction retrains the model.', 28, 164);
  d.setFont('helvetica', 'normal'); d.setFontSize(10);
  text(d, C.slate400);
  d.text(d.splitTextToSize('AssetMind learns from your reviewers. Accuracy climbs week over week — without you doing anything different.', 240), 28, 173);
}

function pWorkOrders(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '07 · Work orders & field ops');
  title(d, 'From prediction to completed job.');
  lede(d, 'Auto-generated WOs, smart assignment, mobile checklists, photo capture, and offline sync. Everything a field team needs, nothing they don\'t.', 54);

  // Left: mobile mock
  const mx = 20, my = 76, mw = 60, mh = 110;
  fill(d, C.slate900); d.roundedRect(mx, my, mw, mh, 5, 5, 'F');
  // Screen
  fill(d, C.white); d.roundedRect(mx + 3, my + 6, mw - 6, mh - 12, 2, 2, 'F');
  // Header
  d.setFont('helvetica', 'bold'); d.setFontSize(8);
  text(d, C.slate900); d.text('WO-20260516-1247', mx + 6, my + 14);
  d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
  text(d, C.slate500); d.text('Pump-03 · Lift Station 4', mx + 6, my + 18);
  pill(d, mx + 6, my + 25, 'URGENT', C.rose, C.white, 3);

  // Checklist items
  const cks = [
    ['Isolate power', true],
    ['Inspect bearings', true],
    ['Take 4 photos', true],
    ['Vibration reading', false],
    ['Sign off', false],
  ];
  let cy = my + 36;
  cks.forEach(([t, done]) => {
    if (done) {
      fill(d, C.emerald); d.circle(mx + 8, cy - 1, 1.5, 'F');
      d.setFont('helvetica', 'bold'); d.setFontSize(7);
      text(d, C.slate400);
    } else {
      draw(d, C.slate300); d.setLineWidth(0.5);
      d.circle(mx + 8, cy - 1, 1.5, 'D');
      d.setFont('helvetica', 'normal'); d.setFontSize(7);
      text(d, C.slate800);
    }
    d.text(t, mx + 12, cy);
    cy += 7;
  });

  // Photo strip
  ['#cbd5e1', '#94a3b8', '#cbd5e1'].forEach((col, i) => {
    const rgb = parseInt(col.slice(1), 16);
    fill(d, [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255]);
    d.roundedRect(mx + 6 + i * 16, my + 80, 14, 14, 1, 1, 'F');
  });

  // Right: features
  const features = [
    ['Auto-generated', 'Triggered by predictions, sensor anomalies, or inspection findings — no human typing required.'],
    ['Smart assignment', 'Matches job to technician by skill, certification, location and current workload.'],
    ['Mobile-first', 'Offline-capable. Capture photos, sign-offs and readings even with no signal.'],
    ['Dynamic checklists', 'Type-specific checklists with photo-required steps and conditional logic.'],
    ['Live chat per WO', 'Threaded conversation between dispatcher, technician and supervisor.'],
    ['Auto follow-ups', 'Findings during the job spawn follow-up WOs automatically.'],
  ];
  const fx = 90, fcardW = 90, fcardH = 33, fgap = 5;
  let fxr = fx, fyr = 76;
  features.forEach((f, i) => {
    accentCard(d, fxr, fyr, fcardW, fcardH, f[0], f[1], C.emerald);
    if ((i + 1) % 2 === 0) { fxr = fx; fyr += fcardH + fgap; }
    else fxr += fcardW + fgap;
  });
}

function pFinance(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '08 · Finance & capital plan');
  title(d, 'Renewals planned on condition, not age.');
  lede(d, 'Risk-scored renewal forecasts, scenario modelling, budget variance alerts and a verified savings ledger that pays for the platform many times over.', 54);

  // Mini chart — projected backlog under 3 scenarios
  const cx = 20, cy = 80, cw = 130, ch = 100;
  card(d, cx, cy, cw, ch, { bg: C.slate50 });
  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, C.slate500); d.text('PROJECTED RENEWAL BACKLOG ($M)', cx + 6, cy + 8);

  // Axes
  draw(d, C.slate300); d.setLineWidth(0.3);
  d.line(cx + 14, cy + 14, cx + 14, cy + 88);
  d.line(cx + 14, cy + 88, cx + cw - 6, cy + 88);

  // 3 lines
  const draws = [
    { color: C.rose, pts: [10, 14, 20, 28, 38, 50, 65, 80], label: 'Do nothing' },
    { color: C.amber, pts: [10, 13, 17, 22, 27, 32, 36, 39], label: 'Status quo' },
    { color: C.emerald, pts: [10, 11, 12, 13, 13, 12, 11, 9], label: 'AssetStack plan' },
  ];
  const baseY = cy + 86, scaleY = 0.85;
  draws.forEach((line) => {
    draw(d, line.color); d.setLineWidth(0.9);
    line.pts.forEach((p, i) => {
      const x1 = cx + 18 + i * 14;
      const y1 = baseY - p * scaleY;
      if (i > 0) {
        const x0 = cx + 18 + (i - 1) * 14;
        const y0 = baseY - line.pts[i - 1] * scaleY;
        d.line(x0, y0, x1, y1);
      }
      fill(d, line.color); d.circle(x1, y1, 0.9, 'F');
    });
  });
  // X labels (years)
  d.setFont('helvetica', 'normal'); d.setFontSize(7);
  text(d, C.slate500);
  ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8'].forEach((yr, i) => {
    d.text(yr, cx + 18 + i * 14, cy + 93, { align: 'center' });
  });
  // Legend
  let lx = cx + 6;
  draws.forEach((line) => {
    fill(d, line.color); d.circle(lx + 1.5, cy + ch - 4, 1.2, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(7);
    text(d, C.slate700); d.text(line.label, lx + 4, cy + ch - 3);
    lx += d.getTextWidth(line.label) + 12;
  });

  // Right: finance features
  const fx = 155;
  const fitems = [
    ['Capital Plan', 'Risk-scored, year-by-year, drag-to-defer.'],
    ['Scenario Modeller', 'Test budget, inflation, climate stress in seconds.'],
    ['Funding Optimiser', 'Allocate $ for max risk reduction.'],
    ['Savings Ledger', 'Every prevented failure logged, verified, dollar-quantified.'],
    ['Variance Alerts', 'Auto-flag budgets trending over.'],
    ['Board Pack', 'CFO-ready export in one click.'],
  ];
  let fy = 80;
  fitems.forEach((f) => {
    accentCard(d, fx, fy, 122, 14, f[0], f[1], C.amber);
    fy += 17;
  });
}

function pCompliance(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '09 · Compliance & audit');
  title(d, 'Zero-panic certifications.');
  lede(d, 'Every requirement, every document, every due date — tracked, reminded, auto-WO\'d. Audit week becomes audit hour.', 54);

  // Status tiles
  const tiles = [
    ['142', 'Compliant', C.emerald],
    ['18', 'Due soon', C.amber],
    ['3', 'Overdue', C.rose],
    ['97%', 'On-time rate', C.indigo],
  ];
  let x = 20;
  tiles.forEach((t) => {
    statTile(d, x, 70, 62, 38, t[0], t[1], t[2]);
    x += 67;
  });

  // Features grid
  const items = [
    ['Regulation library', 'AS 1735, ISO 55000, NFPA 25 and friends — pre-loaded.'],
    ['Auto reminders', 'Lead-time alerts before any due date.'],
    ['Auto work orders', 'Compliance tasks become WOs automatically.'],
    ['Evidence vault', 'Certificates, reports, insurance — versioned and signed.'],
    ['Auditor mode', 'Read-only export for external reviewers.'],
    ['Chain-of-custody', 'Every change logged with who, when, why.'],
  ];
  const cw = 82, ch = 32, gap = 5;
  let cxx = 20, cyy = 120;
  items.forEach((p, i) => {
    accentCard(d, cxx, cyy, cw, ch, p[0], p[1], C.indigo);
    cxx += cw + gap;
    if ((i + 1) % 3 === 0) { cxx = 20; cyy += ch + gap; }
  });
}

function pSecurity(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '10 · Security & trust');
  title(d, 'Enterprise-grade. Transparently.');
  lede(d, 'Your data, your control. Every action audited. Every change reversible.', 54);

  const items = [
    ['Role-based access', 'Granular per-role permissions with deny-by-default.'],
    ['Audit logs', 'Every sensitive action recorded, exportable, immutable.'],
    ['Encryption', 'TLS in transit, AES-256 at rest.'],
    ['SSO & MFA', 'SAML, OAuth, hardware keys supported.'],
    ['Data residency', 'Choose your region. Stay there.'],
    ['Backups', 'Continuous, point-in-time restore.'],
    ['Verified savings', 'Every claim evidenced and disputable.'],
    ['Vendor isolation', 'Per-tenant data isolation guaranteed.'],
    ['Privacy by design', 'Minimal data collection, GDPR aligned.'],
  ];
  const cw = 82, ch = 32, gap = 5;
  let x = 20, y = 70;
  items.forEach((p, i) => {
    accentCard(d, x, y, cw, ch, p[0], p[1], C.indigo);
    x += cw + gap;
    if ((i + 1) % 3 === 0) { x = 20; y += ch + gap; }
  });
}

function pImpact(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '11 · Outcomes & ROI');
  title(d, 'What customers actually see.');
  lede(d, 'Typical outcomes within 90 days of go-live.', 54);

  const stats = [
    ['68%', 'Fewer surprise failures', C.emerald],
    ['3.2×', 'Faster WO cycle', C.sky],
    ['$1.4M', 'Verified savings / yr', C.amber],
    ['94%', 'Compliance on-time', C.violet],
  ];
  let x = 20;
  stats.forEach((s) => {
    statTile(d, x, 66, 62, 52, s[0], s[1], s[2]);
    x += 67;
  });

  // ROI math card
  fill(d, C.slate900); d.roundedRect(20, 128, 257, 62, 3, 3, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, C.indigoSoft); d.text('ROI MATH · 1,000-ASSET PORTFOLIO', 28, 140);
  d.setFont('helvetica', 'bold'); d.setFontSize(13);
  text(d, C.white); d.text('Payback in under 4 months — typical.', 28, 152);

  const lines = [
    ['Reactive callouts prevented', '120 / yr', '$640k'],
    ['Planned maintenance optimised', '20% labour cut', '$310k'],
    ['Capital deferrals (condition-based)', '15 assets', '$450k'],
    ['Total annual benefit', '', '$1.40M'],
  ];
  let ly = 162;
  lines.forEach(([a, b, c], i) => {
    const isTotal = i === lines.length - 1;
    d.setFont('helvetica', isTotal ? 'bold' : 'normal'); d.setFontSize(9);
    text(d, isTotal ? C.white : C.slate300);
    d.text(a, 28, ly);
    text(d, C.slate400); d.text(b, 175, ly);
    text(d, isTotal ? C.emerald : C.indigoSoft);
    d.setFont('helvetica', 'bold');
    d.text(c, 269, ly, { align: 'right' });
    ly += 6;
  });
}

function pRoadmap(d) {
  bg(d, C.white); topAccent(d);
  kicker(d, '12 · Get started');
  title(d, 'Your first 30 days.');
  lede(d, 'A predictable, low-risk path from kickoff to value.', 54);

  const phases = [
    ['WEEK 1', 'Onboard & import', 'Connect data sources, import asset register, configure roles and locations.', C.sky],
    ['WEEK 2', 'Inspect & scan', 'Run first LiDAR/photogrammetry scans. AI defect detection live.', C.violet],
    ['WEEK 3', 'Predict & schedule', 'Failure forecasts go live. Predictive WOs auto-generating.', C.indigo],
    ['WEEK 4', 'Report & prove', 'First board-ready briefing. Savings ledger tracking outcomes.', C.emerald],
  ];
  const cw = 62, ch = 90, gap = 5;
  let x = 20;
  phases.forEach((p) => {
    card(d, x, 76, cw, ch, { bg: C.slate50 });
    fill(d, p[3]); d.roundedRect(x + 6, 82, 28, 7.5, 1.8, 1.8, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(7.5);
    text(d, C.white); d.text(p[0], x + 20, 87, { align: 'center' });
    d.setFont('helvetica', 'bold'); d.setFontSize(13);
    text(d, C.slate900); d.text(p[1], x + 6, 100);
    d.setFont('helvetica', 'normal'); d.setFontSize(9);
    text(d, C.slate600);
    d.text(d.splitTextToSize(p[2], cw - 12), x + 6, 108);
    x += cw + gap;
  });

  // What you'll have at day 30
  fill(d, C.slate900); d.roundedRect(20, 174, 257, 16, 2.5, 2.5, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(11);
  text(d, C.white);
  d.text('Day 30 · Live portfolio · predictions running · WOs auto-generating · savings ledger started.', 148.5, 184, { align: 'center' });
}

function pCTA(d) {
  bg(d, C.slate900);
  fill(d, C.indigo); d.rect(0, 0, 4, H, 'F');

  // Dot grid
  fill(d, C.indigoDeep);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++)
    d.circle(195 + c * 13, 30 + r * 13, 0.7, 'F');

  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, C.indigoSoft);
  d.text("LET'S TALK", 20, 40);

  d.setFont('helvetica', 'bold'); d.setFontSize(44);
  text(d, C.white);
  d.text('See AssetStack', 20, 82);
  d.text('on your own data.', 20, 99);

  d.setFont('helvetica', 'normal'); d.setFontSize(13);
  text(d, C.slate400);
  d.text(d.splitTextToSize('Book a 30-minute walkthrough. We\'ll import a sample of your assets and show you the first set of AI predictions live, on screen, in the call.', 200), 20, 115);

  // What's included pills
  ['Live import demo', 'AI predictions', 'WO automation', 'Q&A with engineering'].forEach((p, i) => {
    pill(d, 20 + i * 42, 142, p, C.indigoDeep, C.indigoSoft, 4);
  });

  // CTA button
  fill(d, C.indigo); d.roundedRect(20, 152, 80, 16, 3, 3, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(12);
  text(d, C.white); d.text('Book a demo  →', 60, 162, { align: 'center' });

  // Footer band
  draw(d, C.slate700); d.setLineWidth(0.3);
  d.line(20, 182, W - 20, 182);
  d.setFont('helvetica', 'bold'); d.setFontSize(9);
  text(d, C.white); d.text('ASSETSTACK', 20, 192);
  d.setFont('helvetica', 'normal');
  text(d, C.slate400);
  d.text('AI Asset Intelligence Platform · assetstack.ai', 20, 198);
}

// ============ ENTRY ============
Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pages = [
      pCover,
      pTOC,
      pProblem,
      pSolution,
      pAssetMind,
      pSpeed,
      pPredict,
      pScans,
      pWorkOrders,
      pFinance,
      pCompliance,
      pSecurity,
      pImpact,
      pRoadmap,
      pCTA,
    ];

    pages.forEach((render, idx) => {
      if (idx > 0) doc.addPage();
      render(doc);
      // Footer on interior pages only (not cover, not CTA)
      if (idx !== 0 && idx !== pages.length - 1) {
        footer(doc, idx + 1, pages.length);
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