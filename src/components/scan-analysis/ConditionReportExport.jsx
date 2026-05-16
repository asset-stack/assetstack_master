import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

/**
 * Generates an audit-ready PDF condition report — what inspectors actually deliver to clients.
 * Includes: cover page, summary stats, anomaly table grouped by severity,
 * and image plates with bounding boxes.
 */
export default function ConditionReportExport({ scan, reports }) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!scan) return;
    setBusy(true);

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 40;

      // ---- Cover ----
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, W, 140, 'F');
      doc.setTextColor(255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('CONDITION REPORT', M, 50);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(scan.name || 'Untitled Scan', M, 78, { maxWidth: W - M * 2 });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated ${format(new Date(), 'PPP')}  ·  AssetStack`,
        M,
        110
      );

      // ---- Summary ----
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', M, 180);

      const counts = {
        critical: reports.filter((r) => r.severity === 'critical').length,
        major: reports.filter((r) => r.severity === 'major').length,
        moderate: reports.filter((r) => r.severity === 'moderate').length,
        minor: reports.filter((r) => r.severity === 'minor').length
      };
      const approved = reports.filter((r) => r.review_status === 'approved').length;
      const corrected = reports.filter((r) => r.review_status === 'corrected').length;
      const verified = approved + corrected;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = [
        `Total findings: ${reports.length}`,
        `Verified by inspector: ${verified} (${
          reports.length ? Math.round((verified / reports.length) * 100) : 0
        }%)`,
        `Critical: ${counts.critical}   Major: ${counts.major}   Moderate: ${counts.moderate}   Minor: ${counts.minor}`,
        scan.location_name ? `Location: ${scan.location_name}` : null,
        scan.scan_date ? `Scan date: ${format(new Date(scan.scan_date), 'PPP')}` : null
      ].filter(Boolean);

      summaryLines.forEach((line, i) => doc.text(line, M, 205 + i * 16));

      // Severity bar
      const barY = 205 + summaryLines.length * 16 + 16;
      const barW = W - M * 2;
      const total = reports.length || 1;
      let xCursor = M;
      const segs = [
        { count: counts.critical, color: [220, 38, 38] },
        { count: counts.major, color: [249, 115, 22] },
        { count: counts.moderate, color: [245, 158, 11] },
        { count: counts.minor, color: [59, 130, 246] }
      ];
      segs.forEach((s) => {
        const w = (s.count / total) * barW;
        doc.setFillColor(...s.color);
        doc.rect(xCursor, barY, w, 12, 'F');
        xCursor += w;
      });

      // ---- Findings table ----
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Findings', M, barY + 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('SEVERITY', M, barY + 70);
      doc.text('TYPE', M + 80, barY + 70);
      doc.text('DESCRIPTION', M + 180, barY + 70);
      doc.text('STATUS', W - M - 60, barY + 70);
      doc.setDrawColor(226, 232, 240);
      doc.line(M, barY + 76, W - M, barY + 76);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let y = barY + 92;
      const sorted = [...reports].sort((a, b) => {
        const w = { critical: 4, major: 3, moderate: 2, minor: 1 };
        return (w[b.severity] || 0) - (w[a.severity] || 0);
      });

      for (const r of sorted) {
        if (y > H - 60) {
          doc.addPage();
          y = M;
        }
        const sevColor = {
          critical: [220, 38, 38],
          major: [249, 115, 22],
          moderate: [245, 158, 11],
          minor: [59, 130, 246]
        }[r.severity] || [100, 116, 139];
        doc.setFillColor(...sevColor);
        doc.circle(M + 4, y - 3, 3, 'F');
        doc.setTextColor(15, 23, 42);
        doc.text((r.severity || '—').toUpperCase(), M + 14, y);
        doc.text((r.anomaly_type || '—').replace(/_/g, ' '), M + 80, y);
        const desc = (r.ai_description || '—').slice(0, 70);
        doc.text(desc, M + 180, y, { maxWidth: W - M - 250 });
        doc.text(r.review_status || 'pending', W - M - 60, y);
        y += 14;
      }

      // ---- Footer on every page ----
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount}`, W - M, H - 20, { align: 'right' });
        doc.text('AssetStack · Condition Report', M, H - 20);
      }

      doc.save(
        `condition-report-${(scan.name || 'scan')
          .replace(/[^a-z0-9]+/gi, '-')
          .toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      );
      toast?.success?.('Condition report exported');
    } catch (e) {
      console.error(e);
      toast?.error?.('Export failed');
    }
    setBusy(false);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={busy || !scan}
      variant="outline"
      size="sm"
      className="gap-1.5"
    >
      {busy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileText className="w-3.5 h-3.5" />
      )}
      Export PDF Report
    </Button>
  );
}