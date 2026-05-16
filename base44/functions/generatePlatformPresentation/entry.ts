import { jsPDF } from 'npm:jspdf@2.5.1';

/* ════════════════════════════════════════════════════════
   ASSETSTACK · WORLD-CLASS PLATFORM BROCHURE
   18 pages · A4 landscape · self-contained
   ════════════════════════════════════════════════════════ */

// ───────── Design tokens ─────────
const C = {
  indigo: [79, 70, 229], indigoDeep: [55, 48, 163], indigoNight: [30, 27, 75],
  indigoSoft: [199, 210, 254], indigoMist: [224, 231, 255],
  ink: [11, 18, 32],
  slate950: [8, 12, 22], slate900: [15, 23, 42], slate800: [30, 41, 59],
  slate700: [51, 65, 85], slate600: [71, 85, 105], slate500: [100, 116, 139],
  slate400: [148, 163, 184], slate300: [203, 213, 225], slate200: [226, 232, 240],
  slate100: [241, 245, 249], slate50: [248, 250, 252], white: [255, 255, 255],
  emerald: [16, 185, 129], emeraldSoft: [209, 250, 229],
  amber: [245, 158, 11], amberSoft: [254, 243, 199],
  rose: [244, 63, 94], roseSoft: [255, 228, 230],
  sky: [14, 165, 233], skySoft: [224, 242, 254],
  violet: [139, 92, 246], violetSoft: [237, 233, 254],
};
const W = 297, H = 210, PAD = 18;

// ───────── Drawing primitives ─────────
const fill = (d, c) => d.setFillColor(c[0], c[1], c[2]);
const text = (d, c) => d.setTextColor(c[0], c[1], c[2]);
const draw = (d, c) => d.setDrawColor(c[0], c[1], c[2]);
const setFont = (d, w, s) => { d.setFont('helvetica', w); d.setFontSize(s); };
function bg(d, c) { fill(d, c); d.rect(0, 0, W, H, 'F'); }
function dotGrid(d, x, y, cols, rows, gap, c, size = 0.6) {
  fill(d, c);
  for (let r = 0; r < rows; r++) for (let c2 = 0; c2 < cols; c2++)
    d.circle(x + c2 * gap, y + r * gap, size, 'F');
}
function softGradient(d, x, y, w, h, fromC, toC, steps = 28) {
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    fill(d, [
      Math.round(fromC[0] + (toC[0] - fromC[0]) * t),
      Math.round(fromC[1] + (toC[1] - fromC[1]) * t),
      Math.round(fromC[2] + (toC[2] - fromC[2]) * t),
    ]);
    d.rect(x + (w / steps) * i, y, w / steps + 0.4, h, 'F');
  }
}

// ───────── Type helpers ─────────
function kicker(d, label, x = PAD, y = 24, color = C.indigo) {
  setFont(d, 'bold', 8.5); text(d, color);
  d.text(label.toUpperCase(), x, y, { charSpace: 0.4 });
}
function title(d, t, x = PAD, y = 38, color = C.slate900, size = 28) {
  setFont(d, 'bold', size); text(d, color); d.text(t, x, y);
  fill(d, C.indigo); d.rect(x, y + 4, 32, 1.2, 'F');
}
function lede(d, t, x = PAD, y = 52, w = 250, color = C.slate600, size = 11) {
  setFont(d, 'normal', size); text(d, color);
  d.text(d.splitTextToSize(t, w), x, y, { lineHeightFactor: 1.4 });
}
function card(d, x, y, w, h, opts = {}) {
  fill(d, opts.bg || C.white);
  draw(d, opts.border || C.slate200);
  d.setLineWidth(opts.line || 0.3);
  d.roundedRect(x, y, w, h, opts.r || 3, opts.r || 3, 'FD');
}
function pill(d, x, y, label, bgColor, fgColor, padX = 4) {
  setFont(d, 'bold', 7);
  const w = d.getTextWidth(label) + padX * 2;
  fill(d, bgColor); d.roundedRect(x, y - 4, w, 6.2, 1.5, 1.5, 'F');
  text(d, fgColor); d.text(label, x + padX, y);
  return w;
}
function check(d, x, y, t, color = C.slate700, size = 9.5) {
  draw(d, C.emerald); d.setLineWidth(1);
  d.line(x, y - 1.4, x + 1.4, y + 0.2);
  d.line(x + 1.4, y + 0.2, x + 4, y - 3);
  setFont(d, 'normal', size); text(d, color); d.text(t, x + 7, y);
}
function bullet(d, x, y, t, dot = C.indigo, color = C.slate700, size = 9.5) {
  fill(d, dot); d.circle(x + 1.2, y - 1.4, 1.2, 'F');
  setFont(d, 'normal', size); text(d, color); d.text(t, x + 5.5, y);
}
function accentCard(d, x, y, w, h, ttl, body, accent) {
  card(d, x, y, w, h);
  fill(d, accent); d.roundedRect(x, y, 1.6, h, 0.8, 0.8, 'F');
  setFont(d, 'bold', 10.5); text(d, C.slate900); d.text(ttl, x + 6, y + 8);
  setFont(d, 'normal', 8.5); text(d, C.slate600);
  d.text(d.splitTextToSize(body, w - 10), x + 6, y + 14, { lineHeightFactor: 1.35 });
}
function statTile(d, x, y, w, h, value, label, accent) {
  fill(d, C.slate900); d.roundedRect(x, y, w, h, 3, 3, 'F');
  setFont(d, 'bold', 30); text(d, accent);
  d.text(value, x + w / 2, y + h / 2 + 1, { align: 'center' });
  setFont(d, 'normal', 7.5); text(d, C.slate400);
  d.text(label.toUpperCase(), x + w / 2, y + h - 5, { align: 'center', charSpace: 0.3 });
}
function topRule(d, c = C.indigo) { fill(d, c); d.rect(0, 0, W, 1.5, 'F'); }
function footer(d, pageNum, total, theme = 'light') {
  draw(d, theme === 'dark' ? C.slate800 : C.slate200);
  d.setLineWidth(0.2);
  d.line(PAD, H - 11, W - PAD, H - 11);
  setFont(d, 'normal', 7.5); text(d, C.slate400);
  d.text('AssetStack · AI Asset Intelligence Platform', PAD, H - 5.5);
  d.text(`${String(pageNum).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, W - PAD, H - 5.5, { align: 'right' });
}

// ═════════ UI Mockups ═════════
function windowChrome(d, x, y, w, h, ttl) {
  fill(d, [22, 28, 45]); d.roundedRect(x, y, w, h, 3, 3, 'F');
  fill(d, [30, 41, 59]); d.roundedRect(x, y, w, 7, 3, 3, 'F');
  d.rect(x, y + 4, w, 3, 'F');
  fill(d, [244, 99, 92]); d.circle(x + 3.6, y + 3.5, 0.9, 'F');
  fill(d, [245, 191, 79]); d.circle(x + 6.4, y + 3.5, 0.9, 'F');
  fill(d, [98, 197, 99]); d.circle(x + 9.2, y + 3.5, 0.9, 'F');
  setFont(d, 'bold', 6.5); text(d, C.slate400);
  d.text(ttl, x + w / 2, y + 4.8, { align: 'center' });
}
function assetMindChat(d, x, y, w, h) {
  windowChrome(d, x, y, w, h, 'AssetMind · Live conversation');
  fill(d, C.indigo); d.roundedRect(x + 30, y + 11, w - 35, 14, 2, 2, 'F');
  setFont(d, 'normal', 7); text(d, C.white);
  d.text(d.splitTextToSize('Find every pump with health <60, schedule urgent inspections next week, and assign to senior techs.', w - 40), x + 32, y + 15, { lineHeightFactor: 1.3 });
  fill(d, [30, 41, 59]); d.roundedRect(x + 3, y + 28, 22, 5, 1.2, 1.2, 'F');
  setFont(d, 'bold', 5.5); text(d, C.indigoSoft);
  d.text('▸ PLANNING…', x + 5, y + 31.5);
  const tools = [
    ['Equipment.filter', '{type:"pump", health<60}', 7],
    ['Technician.filter', '{cert:"senior", available}', 3],
    ['WorkOrder.create', '×7 records', 7],
    ['sendNotificationEmail', '→ assigned techs', 7],
  ];
  let ty = y + 36;
  tools.forEach(([fn, args, n]) => {
    fill(d, [30, 41, 59]); d.roundedRect(x + 3, ty, w - 6, 8, 1.2, 1.2, 'F');
    fill(d, C.emerald); d.circle(x + 6.5, ty + 4, 0.9, 'F');
    setFont(d, 'bold', 6.2); text(d, C.white); d.text(fn, x + 10, ty + 3.5);
    setFont(d, 'normal', 5.8); text(d, C.slate400); d.text(args, x + 10, ty + 6.4);
    setFont(d, 'bold', 5.8); text(d, C.emerald);
    d.text(`✓ ${n}`, x + w - 4, ty + 5, { align: 'right' });
    ty += 9;
  });
  fill(d, [30, 41, 59]); d.roundedRect(x + 3, ty + 1.5, w - 6, h - (ty + 1.5 - y) - 4, 2, 2, 'F');
  setFont(d, 'bold', 6.2); text(d, C.indigoSoft);
  d.text('ASSETMIND', x + 5, ty + 5.5);
  setFont(d, 'normal', 6.4); text(d, C.white);
  d.text(d.splitTextToSize('Done. 7 work orders created, assigned to 3 senior techs (Mia, Jordan, Sam), scheduled May 20–22. Notifications sent. Want me to draft the toolbox talk and pre-order bearings?', w - 10), x + 5, ty + 10, { lineHeightFactor: 1.3 });
}
function dashboardMockup(d, x, y, w, h) {
  fill(d, C.white); draw(d, C.slate200); d.setLineWidth(0.3);
  d.roundedRect(x, y, w, h, 3, 3, 'FD');
  fill(d, C.slate900); d.roundedRect(x, y, 8, h, 3, 3, 'F'); d.rect(x + 5, y, 3, h, 'F');
  fill(d, C.slate700);
  for (let i = 0; i < 6; i++) d.circle(x + 4, y + 8 + i * 8, 1, 'F');
  fill(d, C.indigo); d.circle(x + 4, y + 8, 1.4, 'F');
  fill(d, C.slate50); d.rect(x + 8, y, w - 8, 9, 'F');
  setFont(d, 'bold', 7); text(d, C.slate900); d.text('Command Center', x + 12, y + 5.5);
  const stats = [
    ['Assets', '1,247', C.indigo],
    ['At risk', '38', C.rose],
    ['Open WOs', '142', C.amber],
    ['Health', '87%', C.emerald],
  ];
  const tileW = (w - 16) / 4;
  stats.forEach((s, i) => {
    const tx = x + 10 + i * tileW;
    fill(d, C.white); draw(d, C.slate200); d.setLineWidth(0.2);
    d.roundedRect(tx, y + 11, tileW - 2, 14, 1.5, 1.5, 'FD');
    setFont(d, 'normal', 5.5); text(d, C.slate500); d.text(s[0].toUpperCase(), tx + 2, y + 15);
    setFont(d, 'bold', 11); text(d, s[2]); d.text(s[1], tx + 2, y + 22);
  });
  const cx = x + 10, cy = y + 28, cw = w - 12, ch = h - 32;
  fill(d, C.white); draw(d, C.slate200); d.setLineWidth(0.2);
  d.roundedRect(cx, cy, cw, ch, 1.5, 1.5, 'FD');
  setFont(d, 'bold', 6.5); text(d, C.slate900); d.text('Portfolio health · last 30 days', cx + 2, cy + 5);
  const heights = [6, 7, 8, 7, 9, 10, 11, 10, 12, 13, 12, 14, 15, 16, 15, 17, 18, 17, 19, 20, 21, 20, 22, 23];
  const barW = (cw - 6) / heights.length;
  heights.forEach((hv, i) => {
    const bx = cx + 3 + i * barW;
    const by = cy + ch - 3 - hv * 0.6;
    fill(d, i > 18 ? C.indigo : C.indigoSoft);
    d.roundedRect(bx, by, barW - 0.8, hv * 0.6, 0.3, 0.3, 'F');
  });
}
function assetTreeMockup(d, x, y, w, h) {
  fill(d, C.white); draw(d, C.slate200); d.setLineWidth(0.3);
  d.roundedRect(x, y, w, h, 3, 3, 'FD');
  setFont(d, 'bold', 7); text(d, C.slate500); d.text('ASSET HIERARCHY', x + 4, y + 6);
  const nodes = [
    [0, 'Bunbury Council', '1,247', 'ok'],
    [1, 'Town Hall', '184', 'ok'],
    [2, 'HVAC Floor 2', '12', 'warn'],
    [2, 'Lifts (3)', '3', 'ok'],
    [1, 'Water Treatment', '412', 'risk'],
    [2, 'Pump Station 4', '38', 'risk'],
    [2, 'Filter Bank A', '24', 'ok'],
    [1, 'Depot', '89', 'ok'],
  ];
  const sc = (s) => s === 'risk' ? C.rose : s === 'warn' ? C.amber : C.emerald;
  let ny = y + 12;
  nodes.forEach(([lvl, name, count, state]) => {
    const ix = x + 4 + lvl * 6;
    if (lvl > 0) {
      draw(d, C.slate200); d.setLineWidth(0.2);
      d.line(ix - 3, ny - 1.5, ix - 0.5, ny - 1.5);
    }
    fill(d, sc(state)); d.circle(ix + 0.6, ny - 1.5, 1, 'F');
    setFont(d, lvl === 0 ? 'bold' : 'normal', 6.5);
    text(d, C.slate800); d.text(name, ix + 3.5, ny);
    setFont(d, 'bold', 6); text(d, C.slate400);
    d.text(count, x + w - 4, ny, { align: 'right' });
    ny += 6;
  });
}
function riskListMockup(d, x, y, w, h) {
  fill(d, C.slate50); draw(d, C.slate200); d.setLineWidth(0.3);
  d.roundedRect(x, y, w, h, 3, 3, 'FD');
  setFont(d, 'bold', 7); text(d, C.slate500); d.text('TOP RISK · NEXT 30 DAYS', x + 4, y + 6);
  const rows = [
    ['Pump-03 · Lift Station 4', 92, C.rose, '3d'],
    ['HVAC-12 · Town Hall L2', 81, C.rose, '6d'],
    ['Generator-A · Depot', 67, C.amber, '14d'],
    ['Lift-07 · Library', 54, C.amber, '21d'],
    ['Motor-21 · Treatment', 38, C.emerald, '45d'],
  ];
  let ly = y + 13;
  rows.forEach(([name, p, col, eta]) => {
    setFont(d, 'bold', 6.5); text(d, C.slate900); d.text(name, x + 4, ly);
    setFont(d, 'normal', 5.5); text(d, C.slate500); d.text(`ETA ${eta}`, x + 4, ly + 3.5);
    const barW = w - 24;
    fill(d, C.slate200); d.roundedRect(x + 4, ly + 5, barW, 1.6, 0.5, 0.5, 'F');
    fill(d, col); d.roundedRect(x + 4, ly + 5, barW * (p / 100), 1.6, 0.5, 0.5, 'F');
    setFont(d, 'bold', 6.5); text(d, col);
    d.text(`${p}%`, x + w - 4, ly + 3, { align: 'right' });
    ly += 11;
  });
}
function mobileWOMockup(d, x, y, w, h) {
  fill(d, C.slate900); d.roundedRect(x, y, w, h, 5, 5, 'F');
  fill(d, C.white); d.roundedRect(x + 2.5, y + 5, w - 5, h - 10, 2, 2, 'F');
  fill(d, C.slate900); d.roundedRect(x + w / 2 - 8, y + 3, 16, 2.5, 1, 1, 'F');
  setFont(d, 'bold', 7); text(d, C.slate900); d.text('WO-20260516-1247', x + 5, y + 13);
  setFont(d, 'normal', 5.5); text(d, C.slate500); d.text('Pump-03 · Lift Station 4', x + 5, y + 17);
  pill(d, x + 5, y + 23, 'URGENT', C.rose, C.white, 3);
  pill(d, x + 19, y + 23, 'PRED-AI', C.indigo, C.white, 3);
  const cks = [
    ['Isolate power', true], ['Inspect bearings', true],
    ['Photograph (4)', true], ['Vibration reading', false], ['Sign off', false],
  ];
  let cy = y + 32;
  cks.forEach(([t, done]) => {
    if (done) {
      fill(d, C.emerald); d.circle(x + 7, cy - 1, 1.4, 'F');
      draw(d, C.white); d.setLineWidth(0.5);
      d.line(x + 6.3, cy - 1, x + 6.8, cy - 0.4);
      d.line(x + 6.8, cy - 0.4, x + 7.7, cy - 1.6);
    } else {
      draw(d, C.slate300); d.setLineWidth(0.5);
      d.circle(x + 7, cy - 1, 1.4, 'D');
    }
    setFont(d, done ? 'normal' : 'bold', 6.5);
    text(d, done ? C.slate400 : C.slate900);
    d.text(t, x + 11, cy);
    cy += 6.5;
  });
  ['#cbd5e1', '#94a3b8', '#a3a3a3'].forEach((col, i) => {
    const rgb = parseInt(col.slice(1), 16);
    fill(d, [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255]);
    d.roundedRect(x + 5 + i * 10, y + h - 22, 8, 8, 1, 1, 'F');
  });
  fill(d, C.indigo); d.roundedRect(x + 5, y + h - 12, w - 10, 5, 1.5, 1.5, 'F');
  setFont(d, 'bold', 6.5); text(d, C.white);
  d.text('Complete & sync', x + w / 2, y + h - 8.5, { align: 'center' });
}
function globeMockup(d, x, y, w, h, seed = 1) {
  fill(d, C.slate950); d.roundedRect(x, y, w, h, 3, 3, 'F');
  fill(d, C.slate700);
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 35; i++) {
    d.circle(x + 3 + rnd() * (w - 6), y + 3 + rnd() * (h - 6), 0.3, 'F');
  }
  draw(d, C.indigo); d.setLineWidth(0.4);
  const cx = x + w / 2, cy = y + h / 2;
  const r = Math.min(w, h) / 2 - 6;
  d.circle(cx, cy, r, 'D');
  draw(d, C.indigoDeep); d.setLineWidth(0.2);
  for (let i = 1; i < 4; i++) {
    d.ellipse(cx, cy, r, r * (i / 4), 'D');
    d.ellipse(cx, cy, r * (i / 4), r, 'D');
  }
  const sites = [
    [cx - 6, cy - 5, C.emerald], [cx + 4, cy - 7, C.amber],
    [cx + 8, cy + 3, C.indigo], [cx - 9, cy + 4, C.rose],
    [cx + 1, cy + 8, C.indigo], [cx - 3, cy - 9, C.emerald],
  ];
  sites.forEach(([sx, sy, c]) => {
    fill(d, c); d.circle(sx, sy, 1.2, 'F');
    draw(d, c); d.setLineWidth(0.3); d.circle(sx, sy, 2.5, 'D');
  });
  setFont(d, 'bold', 6.5); text(d, C.indigoSoft);
  d.text('LIVE PORTFOLIO MAP', x + 3, y + 5);
  setFont(d, 'normal', 5.5); text(d, C.slate400);
  d.text('38 sites · 1,247 assets', x + 3, y + 9);
}
function scenarioMockup(d, x, y, w, h) {
  card(d, x, y, w, h, { bg: C.slate50 });
  setFont(d, 'bold', 7); text(d, C.slate500);
  d.text('SCENARIO MODELLER', x + 4, y + 6);
  setFont(d, 'bold', 9); text(d, C.slate900);
  d.text('A 10-year future in 10 seconds', x + 4, y + 11);
  const sliders = [
    ['Annual budget', '$3.2M', 0.7, C.indigo],
    ['Inflation', '4.5%', 0.45, C.amber],
    ['Deferral rate', '12%', 0.25, C.emerald],
    ['Climate stress', '125%', 0.6, C.rose],
  ];
  let sy = y + 17;
  sliders.forEach(([lbl, val, pct, col]) => {
    setFont(d, 'normal', 6.5); text(d, C.slate600); d.text(lbl, x + 4, sy);
    setFont(d, 'bold', 6.5); text(d, C.slate900);
    d.text(val, x + w - 4, sy, { align: 'right' });
    fill(d, C.slate200);
    d.roundedRect(x + 4, sy + 1.5, w - 8, 1.5, 0.5, 0.5, 'F');
    fill(d, col);
    d.roundedRect(x + 4, sy + 1.5, (w - 8) * pct, 1.5, 0.5, 0.5, 'F');
    fill(d, C.white); draw(d, col); d.setLineWidth(0.4);
    d.circle(x + 4 + (w - 8) * pct, sy + 2.25, 1.4, 'FD');
    sy += 8.5;
  });
  fill(d, C.slate900); d.roundedRect(x + 4, sy + 1, w - 8, 12, 1.5, 1.5, 'F');
  setFont(d, 'bold', 5.5); text(d, C.indigoSoft);
  d.text('PROJECTED Y10 BACKLOG', x + 6, sy + 5);
  setFont(d, 'bold', 11); text(d, C.emerald); d.text('$12.4M', x + 6, sy + 11);
  setFont(d, 'normal', 5.5); text(d, C.slate400);
  d.text('vs $48M do-nothing', x + w - 6, sy + 10, { align: 'right' });
}
function savingsLedgerMockup(d, x, y, w, h) {
  card(d, x, y, w, h);
  setFont(d, 'bold', 7); text(d, C.slate500);
  d.text('VERIFIED SAVINGS LEDGER', x + 4, y + 6);
  const entries = [
    ['Bearing replacement · Pump-03', '$48,200', 'verified'],
    ['Deferred renewal · HVAC-12', '$112,000', 'verified'],
    ['Cascade prevented · Filter Bank A', '$67,500', 'verified'],
    ['Predictive WO · Lift-07', '$24,800', 'in review'],
    ['Sensor anomaly catch · Motor-21', '$18,400', 'verified'],
  ];
  let ey = y + 13;
  entries.forEach(([n, amt, st]) => {
    setFont(d, 'bold', 6.5); text(d, C.slate900); d.text(n, x + 4, ey);
    setFont(d, 'bold', 7); text(d, st === 'verified' ? C.emerald : C.amber);
    d.text(amt, x + w - 4, ey, { align: 'right' });
    setFont(d, 'normal', 5.5); text(d, st === 'verified' ? C.emerald : C.amber);
    d.text(st === 'verified' ? '✓ verified' : '⏱ in review', x + 4, ey + 3.2);
    draw(d, C.slate100); d.setLineWidth(0.2);
    d.line(x + 4, ey + 5.2, x + w - 4, ey + 5.2);
    ey += 8.2;
  });
  fill(d, C.slate900); d.roundedRect(x + 2, y + h - 13, w - 4, 11, 1.5, 1.5, 'F');
  setFont(d, 'bold', 6); text(d, C.slate400); d.text('YTD VERIFIED SAVINGS', x + 5, y + h - 8);
  setFont(d, 'bold', 11); text(d, C.emerald);
  d.text('$1.42M', x + w - 5, y + h - 6, { align: 'right' });
}
function backlogChart(d, x, y, w, h) {
  card(d, x, y, w, h, { bg: C.slate50 });
  setFont(d, 'bold', 7); text(d, C.slate500);
  d.text('PROJECTED RENEWAL BACKLOG ($M)', x + 4, y + 6);
  const innerX = x + 8, innerY = y + 12, innerW = w - 12, innerH = h - 22;
  draw(d, C.slate300); d.setLineWidth(0.25);
  d.line(innerX, innerY, innerX, innerY + innerH);
  d.line(innerX, innerY + innerH, innerX + innerW, innerY + innerH);
  const lines = [
    { c: C.rose, p: [8, 12, 18, 26, 36, 47, 60, 76], label: 'Do nothing' },
    { c: C.amber, p: [8, 11, 15, 20, 25, 30, 34, 38], label: 'Status quo' },
    { c: C.emerald, p: [8, 9, 10, 11, 12, 11, 10, 8], label: 'With AssetStack' },
  ];
  const maxP = 80;
  const stepX = innerW / (lines[0].p.length - 1);
  lines.forEach((ln) => {
    draw(d, ln.c); d.setLineWidth(0.8);
    ln.p.forEach((v, i) => {
      const px = innerX + i * stepX;
      const py = innerY + innerH - (v / maxP) * innerH;
      if (i > 0) {
        const pxp = innerX + (i - 1) * stepX;
        const pyp = innerY + innerH - (ln.p[i - 1] / maxP) * innerH;
        d.line(pxp, pyp, px, py);
      }
      fill(d, ln.c); d.circle(px, py, 0.7, 'F');
    });
  });
  setFont(d, 'normal', 5.5); text(d, C.slate500);
  ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8'].forEach((yr, i) => {
    d.text(yr, innerX + i * stepX, innerY + innerH + 4, { align: 'center' });
  });
  let lx = innerX;
  lines.forEach((ln) => {
    fill(d, ln.c); d.circle(lx + 1, y + h - 4, 1, 'F');
    setFont(d, 'bold', 5.5); text(d, C.slate700);
    d.text(ln.label, lx + 3, y + h - 3);
    lx += d.getTextWidth(ln.label) + 9;
  });
}
function onboardingTimeline(d, x, y, w, h) {
  const steps = [
    ['00:00', 'Drop CSV', C.sky],
    ['00:08', 'AI parsing', C.violet],
    ['00:42', 'Locations linked', C.indigo],
    ['01:30', 'Health scored', C.amber],
    ['02:15', 'Predictions live', C.emerald],
    ['< 5:00', 'Live portfolio', C.emerald],
  ];
  const cy = y + h / 2;
  draw(d, C.slate200); d.setLineWidth(0.5);
  d.line(x + 4, cy, x + w - 4, cy);
  const seg = (w - 8) / (steps.length - 1);
  steps.forEach((s, i) => {
    const cx = x + 4 + i * seg;
    fill(d, C.white); draw(d, s[2]); d.setLineWidth(1);
    d.circle(cx, cy, 3, 'FD');
    fill(d, s[2]); d.circle(cx, cy, 1.5, 'F');
    setFont(d, 'bold', 7); text(d, C.slate900);
    d.text(s[0], cx, cy - 6, { align: 'center' });
    setFont(d, 'bold', 6.5); text(d, s[2]);
    d.text(s[1], cx, cy + 9, { align: 'center' });
  });
}

/* ════════════════════ PAGES ════════════════════ */

// 01 · COVER — magazine style
function pCover(d) {
  bg(d, C.slate950);
  // Indigo gradient swatch (right half)
  softGradient(d, W / 2, 0, W / 2, H, C.indigoNight, C.slate950, 24);
  // Indigo bar
  fill(d, C.indigo); d.rect(0, 0, 4, H, 'F');
  // Dot grid texture
  dotGrid(d, 170, 22, 11, 13, 11, [40, 38, 90], 0.55);

  // Top metadata strip
  setFont(d, 'bold', 8.5); text(d, C.indigoSoft);
  d.text('2026 PLATFORM EDITION', PAD, 32, { charSpace: 0.5 });
  draw(d, C.indigo); d.setLineWidth(0.4);
  d.line(PAD + 49, 30, PAD + 80, 30);
  setFont(d, 'normal', 8); text(d, C.slate500);
  d.text('VOL. 03  ·  MAY 2026', PAD + 82, 32);

  // Wordmark
  setFont(d, 'bold', 12); text(d, C.white);
  d.text('ASSETSTACK', PAD, 46, { charSpace: 0.8 });
  fill(d, C.indigo); d.rect(PAD + 30, 42, 2, 4, 'F');

  // Headline (display)
  setFont(d, 'bold', 52); text(d, C.white);
  d.text('The AI', PAD, 92);
  d.text('command', PAD, 109);
  text(d, C.indigoSoft);
  d.text('center for', PAD, 126);
  text(d, C.white);
  d.text('every asset.', PAD, 143);

  // Subhead
  setFont(d, 'normal', 12); text(d, C.slate400);
  d.text(d.splitTextToSize('Predict failures. Automate work orders. Plan capital with confidence. One platform, every asset, run by AI that actually works.', 145), PAD, 156, { lineHeightFactor: 1.4 });

  // Hero stats strip (bottom)
  draw(d, C.slate800); d.setLineWidth(0.3);
  d.line(PAD, 180, W - PAD, 180);
  const stats = [
    ['$1.4M', 'verified savings / yr'],
    ['68%', 'fewer surprise failures'],
    ['3.2×', 'faster WO cycle'],
    ['<5 min', 'to onboard 1,000 assets'],
  ];
  const stripW = (W - PAD * 2) / stats.length;
  stats.forEach(([v, l], i) => {
    const sx = PAD + i * stripW;
    setFont(d, 'bold', 18); text(d, C.indigoSoft);
    d.text(v, sx, 192);
    setFont(d, 'normal', 7); text(d, C.slate400);
    d.text(l.toUpperCase(), sx, 198, { charSpace: 0.4 });
  });

  // Right column: product fragment (chat preview)
  assetMindChat(d, 195, 50, 84, 110);
}

// 02 · MASTHEAD / INSIDE THIS EDITION
function pTOC(d) {
  bg(d, C.white); topRule(d);
  // Two-tone left band
  fill(d, C.slate900); d.rect(0, 0, 90, H, 'F');
  fill(d, C.indigo); d.rect(0, 0, 2, H, 'F');
  dotGrid(d, 10, 70, 7, 9, 9, [40, 50, 80], 0.5);

  setFont(d, 'bold', 8.5); text(d, C.indigoSoft);
  d.text('INSIDE THIS EDITION', 8, 26, { charSpace: 0.4 });
  setFont(d, 'bold', 34); text(d, C.white);
  d.text('The complete', 8, 60);
  d.text('platform tour.', 8, 75);
  setFont(d, 'normal', 10); text(d, C.slate400);
  d.text(d.splitTextToSize('Eighteen pages on how AssetStack turns chaotic asset operations into a single intelligent command center.', 76), 8, 90, { lineHeightFactor: 1.4 });

  // Editorial mini-meta
  setFont(d, 'bold', 7); text(d, C.indigoSoft);
  d.text('READ TIME · 12 MIN', 8, H - 16);
  setFont(d, 'normal', 7); text(d, C.slate500);
  d.text('Issue 03 · 2026 Platform Edition', 8, H - 11);

  // Right: chapters in two columns
  const items = [
    ['01', 'The reality today', 'Why asset teams are flying blind.'],
    ['02', 'The AssetStack way', 'Four pillars: See · Predict · Act · Prove.'],
    ['03', 'AssetMind in action', 'The AI operator that runs the platform.'],
    ['04', 'Onboarding speed', 'Spreadsheet to live portfolio in minutes.'],
    ['05', 'Predictive maintenance', 'Forecast failures weeks ahead.'],
    ['06', 'Digital twin & scans', 'LiDAR + AI vision on every frame.'],
    ['07', 'Work orders & field ops', 'Auto-generated, mobile-first.'],
    ['08', 'Finance & capital plan', 'Scenarios, optimisation, savings.'],
    ['09', 'Compliance & audit', 'Zero-panic certification tracking.'],
    ['10', 'Security & trust', 'Enterprise-grade, transparently.'],
    ['11', 'Why teams choose us', 'How we compare.'],
    ['12', 'Customer voices', 'Outcomes in their own words.'],
    ['13', 'Outcomes & ROI', 'The numbers customers report.'],
    ['14', 'Get started', 'Your first 30 days.'],
  ];
  const startX = 100, colW = 92;
  setFont(d, 'bold', 9); text(d, C.indigo);
  d.text('CHAPTERS', startX, 32, { charSpace: 0.4 });
  draw(d, C.slate200); d.setLineWidth(0.3);
  d.line(startX, 35, W - PAD, 35);

  items.forEach((it, i) => {
    const col = Math.floor(i / 7);
    const row = i % 7;
    const x = startX + col * (colW + 8);
    const y = 50 + row * 19;
    // Number
    setFont(d, 'bold', 22); text(d, C.indigoMist);
    d.text(it[0], x, y + 4);
    // Title
    setFont(d, 'bold', 10); text(d, C.slate900);
    d.text(it[1], x + 16, y);
    // Subtitle
    setFont(d, 'normal', 7.5); text(d, C.slate500);
    d.text(it[2], x + 16, y + 4.5);
    // Hairline
    draw(d, C.slate100); d.setLineWidth(0.2);
    d.line(x, y + 9, x + colW, y + 9);
  });
}

// 03 · PROBLEM
function pProblem(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '01 · The reality today');
  title(d, 'Asset teams are flying blind.');
  lede(d, 'Most organisations still manage millions in infrastructure with spreadsheets, paper inspections and reactive callouts. The cost shows up in every budget cycle.', PAD, 56, 250);

  // Large quote band
  fill(d, C.slate50); d.roundedRect(PAD, 72, W - PAD * 2, 28, 3, 3, 'F');
  fill(d, C.indigo); d.roundedRect(PAD, 72, 1.6, 28, 0.8, 0.8, 'F');
  setFont(d, 'normal', 16); text(d, C.slate800);
  d.text(d.splitTextToSize('"We had eight systems, four spreadsheets and a clipboard. We were paying $3M a year just to find out what was broken."', W - PAD * 2 - 16), PAD + 8, 84, { lineHeightFactor: 1.35 });
  setFont(d, 'normal', 8); text(d, C.slate500);
  d.text('— Asset Director, regional council (pre-AssetStack)', PAD + 8, 97);

  const pains = [
    ['Reactive, not predictive', 'Emergency repairs cost 3–5× planned. Failures happen before anyone sees them coming.'],
    ['Silos everywhere', 'CMMS, finance, scans, sensors and field notes never talk to each other.'],
    ['Inspections lost in PDFs', 'Thousands of clipboard findings nobody can search or trend.'],
    ['Budget guesswork', 'Capital plans built on age, not condition. Renewals deferred until something breaks.'],
    ['Compliance scramble', 'Certifications tracked in someone\'s inbox. Audit week = panic week.'],
    ['No single truth', 'Every meeting starts with reconciling numbers from four systems.'],
  ];
  const cw = (W - PAD * 2 - 10) / 3, ch = 32, gap = 5;
  let x = PAD, y = 110;
  pains.forEach((p, i) => {
    accentCard(d, x, y, cw, ch, p[0], p[1], C.rose);
    x += cw + gap;
    if ((i + 1) % 3 === 0) { x = PAD; y += ch + gap; }
  });
}

// 04 · SOLUTION
function pSolution(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '02 · The AssetStack way');
  title(d, 'One intelligent command center.');
  lede(d, 'Every asset, every sensor, every scan, every dollar — unified. AssetMind sits on top and acts on your behalf.', PAD, 56);

  const pillars = [
    ['SEE', 'Live portfolio view', 'Every asset, location, scan and sensor reading in one place. Drill from globe → site → asset in two clicks.', C.sky],
    ['PREDICT', 'AI forecasts', 'Failure probability, remaining useful life, condition trends — per asset, updated continuously.', C.violet],
    ['ACT', 'AssetMind operates', 'Creates work orders, schedules teams, orders parts, sends notifications — all from plain English.', C.emerald],
    ['PROVE', 'Auditable proof', 'Verified savings ledger, compliance trail, and board-ready reports generated on demand.', C.amber],
  ];
  const totalW = W - PAD * 2;
  const cardW = (totalW - 15) / 4, cardH = 100;
  let x = PAD;
  const y = 76;
  pillars.forEach((p) => {
    card(d, x, y, cardW, cardH, { bg: C.slate50 });
    fill(d, p[3]); d.roundedRect(x + 6, y + 6, 30, 7.5, 1.8, 1.8, 'F');
    setFont(d, 'bold', 8); text(d, C.white);
    d.text(p[0], x + 21, y + 11.2, { align: 'center', charSpace: 0.4 });
    setFont(d, 'bold', 13); text(d, C.slate900); d.text(p[1], x + 6, y + 26);
    setFont(d, 'normal', 9.5); text(d, C.slate600);
    d.text(d.splitTextToSize(p[2], cardW - 12), x + 6, y + 34, { lineHeightFactor: 1.4 });
    x += cardW + 5;
  });

  // Bottom callout band
  fill(d, C.slate900); d.roundedRect(PAD, 186, W - PAD * 2, 12, 2, 2, 'F');
  fill(d, C.indigo); d.roundedRect(PAD, 186, 1.6, 12, 0.8, 0.8, 'F');
  setFont(d, 'bold', 10); text(d, C.white);
  d.text('From silos and spreadsheets to a single AI-powered operating layer.', W / 2, 193, { align: 'center' });
}

// 05 · ASSETMIND (dark, hero)
function pAssetMind(d) {
  bg(d, C.slate950);
  fill(d, C.indigo); d.rect(0, 0, 4, H, 'F');
  dotGrid(d, 160, 24, 10, 14, 11, [30, 35, 70], 0.5);

  setFont(d, 'bold', 8.5); text(d, C.indigoSoft);
  d.text('03 · ASSETMIND IN ACTION', PAD, 26, { charSpace: 0.4 });
  setFont(d, 'bold', 32); text(d, C.white);
  d.text('Not a chatbot.', PAD, 50);
  text(d, C.indigoSoft); d.text('A command center.', PAD, 64);

  setFont(d, 'normal', 11); text(d, C.slate400);
  d.text(d.splitTextToSize('AssetMind has full read/write access to every record and can invoke specialised AI pipelines. Ask in plain English — it plans, looks up, executes, and reports back.', 140), PAD, 78, { lineHeightFactor: 1.4 });

  const caps = [
    'Predict failures across the entire portfolio',
    'Auto-create work orders and assign technicians',
    'Run AI vision on scans and triage defects',
    'Generate morning briefings and board reports',
    'Forecast budgets and model renewal scenarios',
    'Send notifications, update compliance records',
  ];
  let y = 108;
  caps.forEach((c) => {
    fill(d, C.indigo); d.circle(PAD + 1.4, y - 1.4, 1.3, 'F');
    setFont(d, 'normal', 10); text(d, C.white);
    d.text(c, PAD + 6, y);
    y += 8.5;
  });

  // Chat mockup right
  assetMindChat(d, 162, 50, 117, 150);

  // Tagline footer
  draw(d, C.slate800); d.setLineWidth(0.3);
  d.line(PAD, 196, 155, 196);
  setFont(d, 'bold', 7); text(d, C.indigoSoft);
  d.text('SPEAK PLAIN ENGLISH · GET REAL WORK DONE', PAD, 202, { charSpace: 0.4 });
}

// 06 · ONBOARDING SPEED
function pSpeed(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '04 · Onboarding speed');
  title(d, 'Spreadsheet to live portfolio in minutes.');
  lede(d, 'Drop your asset register. AssetMind parses it, infers asset types, links locations, computes health and risk, and generates your first predictions — automatically.', PAD, 56);

  // Timeline strip
  card(d, PAD, 76, W - PAD * 2, 36, { bg: C.slate50 });
  onboardingTimeline(d, PAD + 4, 78, W - PAD * 2 - 8, 32);

  // Before / after panels
  const halfW = (W - PAD * 2 - 6) / 2;
  card(d, PAD, 122, halfW, 44, { bg: C.slate50 });
  pill(d, PAD + 4, 130, 'BEFORE', C.rose, C.white);
  setFont(d, 'bold', 13); text(d, C.slate900);
  d.text('Weeks of consultants', PAD + 4, 142);
  setFont(d, 'normal', 9); text(d, C.slate600);
  d.text(d.splitTextToSize('Manual data cleaning, custom imports, bespoke field mapping, and a 6-week kickoff before anyone sees a dashboard.', halfW - 8), PAD + 4, 150, { lineHeightFactor: 1.4 });

  card(d, PAD + halfW + 6, 122, halfW, 44, { bg: [240, 253, 244], border: C.emerald });
  pill(d, PAD + halfW + 10, 130, 'WITH ASSETSTACK', C.emerald, C.white);
  setFont(d, 'bold', 13); text(d, C.slate900);
  d.text('Minutes, not weeks', PAD + halfW + 10, 142);
  setFont(d, 'normal', 9); text(d, C.slate600);
  d.text(d.splitTextToSize('Drag, drop, done. AssetMind parses your file, validates rows, and lights up dashboards before your coffee is cold.', halfW - 8), PAD + halfW + 10, 150, { lineHeightFactor: 1.4 });

  // Bottom proof
  fill(d, C.slate900); d.roundedRect(PAD, 174, W - PAD * 2, 18, 2.5, 2.5, 'F');
  setFont(d, 'bold', 22); text(d, C.indigoSoft);
  d.text('4:47', PAD + 8, 188);
  setFont(d, 'bold', 10); text(d, C.white);
  d.text('Median time to live portfolio · 1,000 assets', PAD + 36, 184);
  setFont(d, 'normal', 8.5); text(d, C.slate400);
  d.text('Includes parsing, validation, location resolution, health scoring & first predictions.', PAD + 36, 190);
}

// 07 · PREDICTIVE
function pPredict(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '05 · Predictive maintenance');
  title(d, 'See failures coming weeks ahead.');
  lede(d, 'Sensor data + condition reports + age + duty cycle fused into per-asset failure probability and remaining useful life. Updated continuously.', PAD, 56);

  // Left: feature checklist
  setFont(d, 'bold', 12); text(d, C.slate900);
  d.text('What you get', PAD, 82);
  const feats = [
    'Failure probability over next 30 / 90 / 365 days',
    'Remaining useful life (days) per asset',
    'Top failure modes ranked by likelihood',
    'Confidence band on every prediction',
    'Anomaly detection on live sensor streams',
    'Defect-cascade modelling to related assets',
    'Auto work orders on threshold breach',
  ];
  let y = 94;
  feats.forEach((f) => { check(d, PAD + 2, y, f); y += 8; });

  // Right: risk dashboard
  riskListMockup(d, 155, 78, W - PAD - 155, 110);
}

// 08 · DIGITAL TWIN & SCANS
function pScans(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '06 · Digital twin & scans');
  title(d, 'Every defect, automatically.');
  lede(d, 'Upload a LiDAR or photogrammetry scan. AssetMind extracts frames, runs AI vision, locates anomalies in 3D, and queues them for human verification.', PAD, 56);

  // Pipeline chevrons
  const flow = [
    ['1. Upload', '.obj / .glb / mesh', C.sky],
    ['2. Frame extract', 'AI picks key views', C.violet],
    ['3. AI vision', 'Defects detected', C.indigo],
    ['4. Human verify', 'One-click approve', C.amber],
    ['5. Auto WO', 'Work order made', C.emerald],
  ];
  const totalW = W - PAD * 2;
  const fw = (totalW - 4 * 5) / 5;
  let x = PAD;
  flow.forEach((f, i) => {
    fill(d, f[2]); d.roundedRect(x, 76, fw, 22, 2, 2, 'F');
    setFont(d, 'bold', 9.5); text(d, C.white);
    d.text(f[0], x + fw / 2, 86, { align: 'center' });
    setFont(d, 'normal', 7.5);
    d.text(f[1], x + fw / 2, 92, { align: 'center' });
    if (i < flow.length - 1) {
      setFont(d, 'bold', 14); text(d, C.slate400);
      d.text('›', x + fw + 1.5, 90);
    }
    x += fw + 5;
  });

  // Anomaly types
  setFont(d, 'bold', 11); text(d, C.slate900);
  d.text('Anomaly types detected', PAD, 116);
  const ants = ['Cracks', 'Corrosion', 'Spalling', 'Water damage', 'Graffiti', 'Missing parts', 'Misalignment', 'Wear', 'Stains', 'Dents'];
  let ax = PAD;
  ants.forEach((a) => {
    const w = pill(d, ax, 125, a, C.indigoMist, C.indigoDeep, 5);
    ax += w + 4;
  });

  // Feedback loop callout
  fill(d, C.slate900); d.roundedRect(PAD, 140, totalW, 50, 2.5, 2.5, 'F');
  fill(d, C.indigo); d.roundedRect(PAD, 140, 1.6, 50, 0.8, 0.8, 'F');
  setFont(d, 'bold', 9); text(d, C.indigoSoft);
  d.text('FEEDBACK LOOP', PAD + 8, 152);
  setFont(d, 'bold', 16); text(d, C.white);
  d.text('Every human correction retrains the model.', PAD + 8, 165);
  setFont(d, 'normal', 10); text(d, C.slate400);
  d.text(d.splitTextToSize('AssetMind learns from your reviewers. Accuracy climbs week over week — without changing how your team works.', totalW - 16), PAD + 8, 175, { lineHeightFactor: 1.4 });
}

// 09 · WORK ORDERS & FIELD OPS
function pWorkOrders(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '07 · Work orders & field ops');
  title(d, 'Prediction → completed job, hands-free.');
  lede(d, 'Auto-generated WOs, smart assignment, mobile checklists, photo capture, offline sync. Everything a field team needs, nothing they don\'t.', PAD, 56);

  // Left: mobile mock
  mobileWOMockup(d, PAD, 76, 64, 118);

  // Right: features
  const features = [
    ['Auto-generated', 'Triggered by predictions, sensor anomalies, or inspection findings — no human typing.'],
    ['Smart assignment', 'Matches job to technician by skill, certification, location and current workload.'],
    ['Mobile-first', 'Offline-capable. Capture photos, sign-offs and readings even with no signal.'],
    ['Dynamic checklists', 'Type-specific checklists with photo-required steps and conditional logic.'],
    ['Live chat per WO', 'Threaded conversation between dispatcher, technician and supervisor.'],
    ['Auto follow-ups', 'Findings during the job spawn follow-up WOs automatically.'],
  ];
  const fx = PAD + 72, fcardW = (W - PAD - fx - 5) / 2, fcardH = 35, fgap = 5;
  let fxr = fx, fyr = 76;
  features.forEach((f, i) => {
    accentCard(d, fxr, fyr, fcardW, fcardH, f[0], f[1], C.emerald);
    if ((i + 1) % 2 === 0) { fxr = fx; fyr += fcardH + fgap; }
    else fxr += fcardW + fgap;
  });
}

// 10 · LIVE PORTFOLIO (globe + tree + dashboard)
function pLivePortfolio(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '08 · Live portfolio');
  title(d, 'Every asset. One screen.');
  lede(d, 'Globe to site to asset in two clicks. The same record visible to ops, finance and the board — always.', PAD, 56);

  // Three mockups composed
  dashboardMockup(d, PAD, 76, 165, 118);
  globeMockup(d, PAD + 170, 76, 90, 56, 17);
  assetTreeMockup(d, PAD + 170, 138, 90, 56);
}

// 11 · FINANCE & CAPITAL
function pFinance(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '09 · Finance & capital plan');
  title(d, 'Renewals planned on condition, not age.');
  lede(d, 'Risk-scored renewal forecasts, scenario modelling, budget variance alerts and a verified savings ledger that pays for the platform many times over.', PAD, 56);

  // Left: backlog chart
  backlogChart(d, PAD, 76, 125, 95);
  // Right: scenario sliders
  scenarioMockup(d, PAD + 130, 76, 130, 95);

  // Bottom strip: finance features
  const items = [
    ['Capital Plan', 'Risk-scored, year-by-year, drag-to-defer.'],
    ['Scenario Modeller', 'Budget, inflation, climate stress in 10s.'],
    ['Funding Optimiser', 'Allocate $ for max risk reduction.'],
    ['Savings Ledger', 'Every prevented failure, dollar-quantified.'],
  ];
  const cw = (W - PAD * 2 - 15) / 4;
  let x = PAD;
  items.forEach((i) => {
    accentCard(d, x, 178, cw, 16, i[0], i[1], C.amber);
    x += cw + 5;
  });
}

// 12 · SAVINGS LEDGER (proof)
function pSavings(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '10 · Proof of value');
  title(d, 'Every dollar saved, logged and verified.');
  lede(d, 'Most platforms promise savings. AssetStack proves them — by recording the predicted-failure cost, the intervention cost, and the verified delta on every action.', PAD, 56);

  // Left: ledger mockup
  savingsLedgerMockup(d, PAD, 76, 130, 115);

  // Right: how verification works
  setFont(d, 'bold', 12); text(d, C.slate900);
  d.text('How each entry is verified', PAD + 138, 84);

  const flow = [
    ['1', 'AI predicts failure', 'Confidence ≥ 80%, root-cause logged.'],
    ['2', 'Intervention taken', 'Predictive WO completed before failure.'],
    ['3', 'Outcome verified', 'Inspection or sensor confirms.'],
    ['4', 'Delta recorded', 'Predicted cost − actual cost = savings.'],
    ['5', 'Disputed?', 'Reviewer can dispute or accept.'],
  ];
  let fy = 94;
  flow.forEach(([n, t, s]) => {
    fill(d, C.indigo); d.circle(PAD + 142, fy - 1.4, 3, 'F');
    setFont(d, 'bold', 8); text(d, C.white);
    d.text(n, PAD + 142, fy + 0.6, { align: 'center' });
    setFont(d, 'bold', 9.5); text(d, C.slate900);
    d.text(t, PAD + 148, fy);
    setFont(d, 'normal', 8); text(d, C.slate500);
    d.text(s, PAD + 148, fy + 4.5);
    fy += 13;
  });

  // Bottom proof band
  fill(d, C.emerald); d.roundedRect(PAD + 138, 174, 120, 17, 2.5, 2.5, 'F');
  setFont(d, 'bold', 17); text(d, C.white);
  d.text('$1.42M', PAD + 145, 186);
  setFont(d, 'normal', 9); text(d, [220, 252, 231]);
  d.text('YTD verified · auditable trail per entry', PAD + 178, 186);
}

// 13 · COMPLIANCE
function pCompliance(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '11 · Compliance & audit');
  title(d, 'Zero-panic certifications.');
  lede(d, 'Every requirement, every document, every due date — tracked, reminded, auto-WO\'d. Audit week becomes audit hour.', PAD, 56);

  const tiles = [
    ['142', 'Compliant', C.emerald],
    ['18', 'Due soon', C.amber],
    ['3', 'Overdue', C.rose],
    ['97%', 'On-time rate', C.indigo],
  ];
  const tw = (W - PAD * 2 - 15) / 4;
  let x = PAD;
  tiles.forEach((t) => {
    statTile(d, x, 74, tw, 40, t[0], t[1], t[2]);
    x += tw + 5;
  });

  const items = [
    ['Regulation library', 'AS 1735, ISO 55000, NFPA 25 and friends — pre-loaded.'],
    ['Auto reminders', 'Lead-time alerts before any due date.'],
    ['Auto work orders', 'Compliance tasks become WOs automatically.'],
    ['Evidence vault', 'Certificates, reports, insurance — versioned & signed.'],
    ['Auditor mode', 'Read-only export for external reviewers.'],
    ['Chain-of-custody', 'Every change logged with who, when, why.'],
  ];
  const cw = (W - PAD * 2 - 10) / 3, ch = 30, gap = 5;
  let cxx = PAD, cyy = 126;
  items.forEach((p, i) => {
    accentCard(d, cxx, cyy, cw, ch, p[0], p[1], C.indigo);
    cxx += cw + gap;
    if ((i + 1) % 3 === 0) { cxx = PAD; cyy += ch + gap; }
  });
}

// 14 · SECURITY
function pSecurity(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '12 · Security & trust');
  title(d, 'Enterprise-grade. Transparently.');
  lede(d, 'Your data, your control. Every action audited. Every change reversible.', PAD, 56);

  const items = [
    ['Role-based access', 'Granular per-role permissions with deny-by-default.'],
    ['Audit logs', 'Every sensitive action recorded, exportable, immutable.'],
    ['Encryption', 'TLS in transit, AES-256 at rest.'],
    ['SSO & MFA', 'SAML, OAuth, hardware keys supported.'],
    ['Data residency', 'Choose your region. Stay there.'],
    ['Backups', 'Continuous, point-in-time restore.'],
    ['Verified savings', 'Every claim evidenced and disputable.'],
    ['Tenant isolation', 'Per-tenant data isolation guaranteed.'],
    ['Privacy by design', 'Minimal data collection, GDPR aligned.'],
  ];
  const cw = (W - PAD * 2 - 10) / 3, ch = 32, gap = 5;
  let x = PAD, y = 72;
  items.forEach((p, i) => {
    accentCard(d, x, y, cw, ch, p[0], p[1], C.indigo);
    x += cw + gap;
    if ((i + 1) % 3 === 0) { x = PAD; y += ch + gap; }
  });
}

// 15 · COMPARISON
function pComparison(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '13 · Why teams choose us');
  title(d, 'How AssetStack compares.');
  lede(d, 'Against legacy CMMS and modern point tools.', PAD, 56);

  const cols = ['Legacy CMMS', 'Modern CMMS', 'AssetStack'];
  const rows = [
    ['AI failure prediction', 'no', 'partial', 'yes'],
    ['Plain-English AI operator', 'no', 'no', 'yes'],
    ['LiDAR / scan defect AI', 'no', 'no', 'yes'],
    ['Auto WO from sensor anomaly', 'no', 'partial', 'yes'],
    ['Scenario modelling for finance', 'no', 'no', 'yes'],
    ['Verified savings ledger', 'no', 'no', 'yes'],
    ['Mobile offline-first', 'partial', 'yes', 'yes'],
    ['<5 min onboarding', 'no', 'no', 'yes'],
  ];

  const tableX = PAD, tableY = 72;
  const labelW = 105;
  const colW = (W - PAD * 2 - labelW) / 3;

  // Header row
  fill(d, C.slate900); d.roundedRect(tableX, tableY, W - PAD * 2, 11, 2, 2, 'F');
  setFont(d, 'bold', 8); text(d, C.slate400);
  d.text('CAPABILITY', tableX + 4, tableY + 7, { charSpace: 0.4 });
  cols.forEach((c, i) => {
    setFont(d, 'bold', 9);
    text(d, i === 2 ? C.indigoSoft : C.white);
    d.text(c, tableX + labelW + colW * i + colW / 2, tableY + 7, { align: 'center' });
  });

  let ry = tableY + 13;
  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      fill(d, C.slate50);
      d.rect(tableX, ry - 4.5, W - PAD * 2, 12, 'F');
    }
    setFont(d, 'bold', 9); text(d, C.slate800);
    d.text(row[0], tableX + 4, ry + 1);
    for (let c = 0; c < 3; c++) {
      const val = row[c + 1];
      const cx = tableX + labelW + colW * c + colW / 2;
      const cy = ry;
      if (val === 'yes') {
        fill(d, C.emerald); d.circle(cx, cy, 2.4, 'F');
        draw(d, C.white); d.setLineWidth(0.8);
        d.line(cx - 1.2, cy, cx - 0.3, cy + 1);
        d.line(cx - 0.3, cy + 1, cx + 1.4, cy - 1.2);
      } else if (val === 'partial') {
        draw(d, C.amber); d.setLineWidth(1);
        d.circle(cx, cy, 2.4, 'D');
        fill(d, C.amber); d.circle(cx, cy, 1.1, 'F');
      } else {
        draw(d, C.slate300); d.setLineWidth(1);
        d.circle(cx, cy, 2.4, 'D');
      }
    }
    ry += 12;
  });

  // Legend
  setFont(d, 'bold', 7); text(d, C.slate500);
  d.text('LEGEND', PAD, 188);
  fill(d, C.emerald); d.circle(PAD + 22, 187, 1.6, 'F');
  setFont(d, 'normal', 8); text(d, C.slate700);
  d.text('Yes', PAD + 26, 188);
  draw(d, C.amber); d.setLineWidth(0.8);
  d.circle(PAD + 40, 187, 1.6, 'D');
  fill(d, C.amber); d.circle(PAD + 40, 187, 0.7, 'F');
  d.text('Partial', PAD + 44, 188);
  draw(d, C.slate300); d.circle(PAD + 64, 187, 1.6, 'D');
  d.text('No', PAD + 68, 188);
}

// 16 · CUSTOMER VOICES
function pVoices(d) {
  bg(d, C.slate50); topRule(d);
  kicker(d, '14 · Customer voices');
  title(d, 'In their own words.');

  const quotes = [
    {
      q: 'We replaced four systems and a year of spreadsheet wrangling. Our first prediction caught a transformer failure two weeks out.',
      who: 'Director of Engineering',
      org: 'Regional water authority',
      stat: '$640k saved · year 1',
    },
    {
      q: 'AssetMind drafted our entire monthly board pack. Numbers tied out perfectly. My CFO asked who built it.',
      who: 'Asset Manager',
      org: 'Council, 1,200+ assets',
      stat: '12 hrs / month back',
    },
    {
      q: 'I ran a 10-year scenario in front of councillors live. Three sliders. They funded the program in the next meeting.',
      who: 'Chief Operating Officer',
      org: 'Transport infrastructure',
      stat: '+$3.2M funded',
    },
    {
      q: 'My team finally trusts the data. The mobile app works in tunnels. Auto follow-up WOs are a game changer.',
      who: 'Field Operations Lead',
      org: 'Utilities · 6 depots',
      stat: '3.2× faster cycle',
    },
  ];

  const cw = (W - PAD * 2 - 8) / 2, ch = 56, gap = 8;
  let x = PAD, y = 64;
  quotes.forEach((qd, i) => {
    card(d, x, y, cw, ch);
    fill(d, C.indigo); d.roundedRect(x, y, 1.6, ch, 0.8, 0.8, 'F');
    // Big quote mark
    setFont(d, 'bold', 30); text(d, C.indigoMist);
    d.text('"', x + 6, y + 16);
    // Quote text
    setFont(d, 'normal', 10); text(d, C.slate800);
    d.text(d.splitTextToSize(qd.q, cw - 14), x + 14, y + 11, { lineHeightFactor: 1.4 });
    // Attribution
    setFont(d, 'bold', 8.5); text(d, C.slate900);
    d.text(qd.who, x + 14, y + ch - 14);
    setFont(d, 'normal', 7.5); text(d, C.slate500);
    d.text(qd.org, x + 14, y + ch - 9);
    // Stat pill
    pill(d, x + cw - d.getTextWidth(qd.stat) - 12, y + ch - 12, qd.stat, C.emeraldSoft, [4, 120, 87], 4);
    if (i % 2 === 0) x += cw + gap;
    else { x = PAD; y += ch + gap; }
  });

  // Bottom band
  fill(d, C.slate900); d.roundedRect(PAD, 188, W - PAD * 2, 10, 2, 2, 'F');
  setFont(d, 'bold', 9); text(d, C.white);
  d.text('Customers across utilities, councils, transport and built environment trust AssetStack.', W / 2, 194.5, { align: 'center' });
}

// 17 · OUTCOMES / ROI
function pImpact(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '15 · Outcomes & ROI');
  title(d, 'What customers actually see.');
  lede(d, 'Typical outcomes within 90 days of go-live.', PAD, 56);

  const stats = [
    ['68%', 'Fewer surprise failures', C.emerald],
    ['3.2×', 'Faster WO cycle', C.sky],
    ['$1.4M', 'Verified savings / yr', C.amber],
    ['94%', 'Compliance on-time', C.violet],
  ];
  const sw = (W - PAD * 2 - 15) / 4;
  let x = PAD;
  stats.forEach((s) => {
    statTile(d, x, 68, sw, 52, s[0], s[1], s[2]);
    x += sw + 5;
  });

  // ROI math card
  fill(d, C.slate900); d.roundedRect(PAD, 130, W - PAD * 2, 60, 3, 3, 'F');
  fill(d, C.indigo); d.roundedRect(PAD, 130, 1.6, 60, 0.8, 0.8, 'F');
  setFont(d, 'bold', 9); text(d, C.indigoSoft);
  d.text('ROI MATH · 1,000-ASSET PORTFOLIO', PAD + 8, 142, { charSpace: 0.4 });
  setFont(d, 'bold', 13); text(d, C.white);
  d.text('Payback in under 4 months — typical.', PAD + 8, 153);

  const lines = [
    ['Reactive callouts prevented', '120 / yr', '$640k'],
    ['Planned maintenance optimised', '20% labour cut', '$310k'],
    ['Capital deferrals (condition-based)', '15 assets', '$450k'],
    ['Total annual benefit', '', '$1.40M'],
  ];
  let ly = 164;
  lines.forEach(([a, b, c], i) => {
    const isTotal = i === lines.length - 1;
    if (isTotal) {
      draw(d, C.slate800); d.setLineWidth(0.3);
      d.line(PAD + 8, ly - 4, W - PAD - 8, ly - 4);
    }
    setFont(d, isTotal ? 'bold' : 'normal', 9.5);
    text(d, isTotal ? C.white : C.slate300);
    d.text(a, PAD + 8, ly);
    text(d, C.slate400); d.text(b, PAD + 155, ly);
    setFont(d, 'bold', 9.5);
    text(d, isTotal ? C.emerald : C.indigoSoft);
    d.text(c, W - PAD - 8, ly, { align: 'right' });
    ly += 6;
  });
}

// 18 · ROADMAP + CTA combined feels heavy — let's split:
// 18 · ROADMAP
function pRoadmap(d) {
  bg(d, C.white); topRule(d);
  kicker(d, '16 · Get started');
  title(d, 'Your first 30 days.');
  lede(d, 'A predictable, low-risk path from kickoff to value.', PAD, 56);

  const phases = [
    ['WEEK 1', 'Onboard & import', 'Connect data sources, import asset register, configure roles and locations.', C.sky],
    ['WEEK 2', 'Inspect & scan', 'Run first LiDAR/photogrammetry scans. AI defect detection live.', C.violet],
    ['WEEK 3', 'Predict & schedule', 'Failure forecasts go live. Predictive WOs auto-generating.', C.indigo],
    ['WEEK 4', 'Report & prove', 'First board-ready briefing. Savings ledger tracking outcomes.', C.emerald],
  ];
  const totalW = W - PAD * 2;
  const pcw = (totalW - 15) / 4, pch = 92;
  let x = PAD;
  phases.forEach((p) => {
    card(d, x, 76, pcw, pch, { bg: C.slate50 });
    fill(d, p[3]); d.roundedRect(x + 6, 82, 30, 7.5, 1.8, 1.8, 'F');
    setFont(d, 'bold', 7.5); text(d, C.white);
    d.text(p[0], x + 21, 87, { align: 'center', charSpace: 0.4 });
    setFont(d, 'bold', 14); text(d, C.slate900);
    d.text(p[1], x + 6, 102);
    setFont(d, 'normal', 9.5); text(d, C.slate600);
    d.text(d.splitTextToSize(p[2], pcw - 12), x + 6, 110, { lineHeightFactor: 1.4 });
    x += pcw + 5;
  });

  // Day 30 strip
  fill(d, C.slate900); d.roundedRect(PAD, 176, totalW, 16, 2.5, 2.5, 'F');
  fill(d, C.emerald); d.roundedRect(PAD, 176, 1.6, 16, 0.8, 0.8, 'F');
  setFont(d, 'bold', 11); text(d, C.white);
  d.text('Day 30 · Live portfolio · predictions running · WOs auto-generating · savings tracking.', W / 2, 186, { align: 'center' });
}

// 19 · CTA (final spread)
function pCTA(d) {
  bg(d, C.slate950);
  fill(d, C.indigo); d.rect(0, 0, 4, H, 'F');
  softGradient(d, W / 2, 0, W / 2, H, C.indigoNight, C.slate950, 24);
  dotGrid(d, 175, 26, 10, 14, 11, [40, 38, 90], 0.5);

  setFont(d, 'bold', 8.5); text(d, C.indigoSoft);
  d.text("LET'S TALK", PAD, 36, { charSpace: 0.5 });
  draw(d, C.indigo); d.setLineWidth(0.4);
  d.line(PAD + 22, 34, PAD + 60, 34);

  setFont(d, 'bold', 48); text(d, C.white);
  d.text('See AssetStack', PAD, 80);
  text(d, C.indigoSoft);
  d.text('on your data.', PAD, 100);
  text(d, C.white);

  setFont(d, 'normal', 12); text(d, C.slate400);
  d.text(d.splitTextToSize('Book a 30-minute walkthrough. We\'ll import a sample of your assets and show you the first set of AI predictions live, on screen, in the call.', 145), PAD, 116, { lineHeightFactor: 1.45 });

  // What's included
  setFont(d, 'bold', 8); text(d, C.indigoSoft);
  d.text("WHAT'S INCLUDED", PAD, 144, { charSpace: 0.4 });
  ['Live import demo', 'AI predictions', 'WO automation', 'Q&A with engineering'].forEach((p, i) => {
    pill(d, PAD + i * 36, 152, p, C.indigoDeep, C.indigoSoft, 4);
  });

  // CTA button
  fill(d, C.indigo); d.roundedRect(PAD, 162, 90, 16, 3, 3, 'F');
  setFont(d, 'bold', 12); text(d, C.white);
  d.text('Book a demo  →', PAD + 45, 172, { align: 'center' });

  // Footer
  draw(d, C.slate800); d.setLineWidth(0.3);
  d.line(PAD, 188, W - PAD, 188);
  setFont(d, 'bold', 9); text(d, C.white);
  d.text('ASSETSTACK', PAD, 195);
  setFont(d, 'normal', 8); text(d, C.slate400);
  d.text('AI Asset Intelligence Platform · assetstack.ai', PAD, 200);
  text(d, C.slate500);
  d.text('© 2026 AssetStack. All rights reserved.', W - PAD, 200, { align: 'right' });
}

/* ════════════════════ ENTRY ════════════════════ */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pages = [
      pCover,          // 01
      pTOC,            // 02
      pProblem,        // 03
      pSolution,       // 04
      pAssetMind,      // 05
      pSpeed,          // 06
      pPredict,        // 07
      pScans,          // 08
      pWorkOrders,     // 09
      pLivePortfolio,  // 10
      pFinance,        // 11
      pSavings,        // 12
      pCompliance,     // 13
      pSecurity,       // 14
      pComparison,     // 15
      pVoices,         // 16
      pImpact,         // 17
      pRoadmap,        // 18
      pCTA,            // 19
    ];

    pages.forEach((render, idx) => {
      if (idx > 0) doc.addPage();
      render(doc);
      // Footer on interior pages only (skip cover & CTA)
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