import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { fmtMoney } from '@/lib/assetMetrics';
import { fmtRatio, fmtPct } from '@/lib/cfoRatios';

// Generates a board-ready PDF from already-loaded data — no extra fetches.
export default function BoardPackButton({ ratios, capitalItems = [], budgets = [], totals = {} }) {
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const M = 40;
      let y = M;

      const fy = `FY${new Date().getFullYear() + 1}`;
      const today = new Date().toLocaleDateString();

      // === COVER ===
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, W, 110, 'F');
      doc.setTextColor(255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Asset Portfolio Board Pack', M, 55);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`${fy}  ·  Generated ${today}`, M, 78);
      doc.setTextColor(30);
      y = 140;

      // === EXECUTIVE SUMMARY ===
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', M, y); y += 18;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      const lines = [
        `Total replacement cost (CRC): ${fmtMoney(ratios?.totalCRC)}`,
        `Written-down value (WDV): ${fmtMoney(ratios?.totalWDV)}  (${fmtPct(ratios?.consumption)} consumed)`,
        `Defect remediation backlog: ${fmtMoney(ratios?.totalDefectCost)}  (${fmtPct(ratios?.backlog)} of CRC)`,
        `Capital required (10y): ${fmtMoney(ratios?.requiredRenewal)}`,
        `Available capital (current): ${fmtMoney(ratios?.availableCapital)}`,
        `Renewal Gap Index: ${fmtRatio(ratios?.renewalGap)}  (≤1.0 healthy)`,
      ];
      lines.forEach(l => { doc.text(l, M, y); y += 14; });

      y += 10;
      // === CFO RATIOS TABLE ===
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('CFO Health Ratios', M, y); y += 16;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      const ratioRows = [
        ['Sustainability Ratio', fmtRatio(ratios?.sustainability), '≥ 0.95 healthy'],
        ['Asset Consumption', fmtPct(ratios?.consumption), '60–75% healthy'],
        ['Backlog Ratio', fmtPct(ratios?.backlog), '< 2% healthy'],
        ['Renewal Gap Index', fmtRatio(ratios?.renewalGap), '≤ 1.0 healthy'],
      ];
      ratioRows.forEach(([k, v, range]) => {
        doc.setFont('helvetica', 'bold'); doc.text(k, M, y);
        doc.setFont('helvetica', 'normal'); doc.text(v, M + 200, y);
        doc.setTextColor(120); doc.text(range, M + 280, y);
        doc.setTextColor(30);
        y += 14;
      });

      // === TOP 10 RISKS ===
      if (y > 680) { doc.addPage(); y = M; }
      y += 14;
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Top 10 Risks (Capital Plan)', M, y); y += 16;
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('Asset', M, y); doc.text('FY', M + 230, y); doc.text('Cost', M + 270, y); doc.text('Priority', M + 360, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      const topRisks = [...capitalItems]
        .sort((a, b) => (b.replacement_cost || 0) - (a.replacement_cost || 0))
        .slice(0, 10);
      topRisks.forEach((it) => {
        if (y > 780) { doc.addPage(); y = M; }
        const name = (it.equipment_name || '—').slice(0, 50);
        doc.text(name, M, y);
        doc.text(String(it.replacement_year || '—'), M + 230, y);
        doc.text(fmtMoney(it.replacement_cost), M + 270, y);
        doc.text((it.priority || '—').toUpperCase(), M + 360, y);
        y += 12;
      });

      // === BUDGET VARIANCE ===
      if (y > 680) { doc.addPage(); y = M; }
      y += 18;
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Budget Variance', M, y); y += 16;
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('Budget', M, y); doc.text('Allocated', M + 230, y); doc.text('Spent', M + 310, y); doc.text('Util.', M + 390, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      budgets.slice(0, 12).forEach((b) => {
        if (y > 780) { doc.addPage(); y = M; }
        const allocated = b.allocated_amount || 0;
        const spent = b.spent_amount || 0;
        const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
        doc.text((b.name || '—').slice(0, 45), M, y);
        doc.text(fmtMoney(allocated), M + 230, y);
        doc.text(fmtMoney(spent), M + 310, y);
        doc.text(`${pct}%`, M + 390, y);
        y += 12;
      });

      // === FOOTER ===
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`AssetStack · Board Pack · Page ${i} of ${pageCount}`, M, 820);
      }

      doc.save(`board-pack-${fy}-${Date.now()}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={generate} disabled={busy} className="bg-indigo-600 hover:bg-indigo-700 text-white">
      {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileDown className="w-4 h-4 mr-1" />}
      Board Pack PDF
    </Button>
  );
}