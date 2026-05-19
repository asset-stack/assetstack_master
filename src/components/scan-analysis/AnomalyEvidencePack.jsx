import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

// Single-anomaly evidence pack — image + bbox + asset details + recommended action.
// Used directly from AnomalyReviewCard.
export default function AnomalyEvidencePack({ report, equipment }) {
  const [busy, setBusy] = useState(false);

  const buildPdf = async () => {
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const M = 40;

      // Header bar
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, W, 80, 'F');
      doc.setTextColor(255);
      doc.setFontSize(9);
      doc.text('ANOMALY EVIDENCE PACK', M, 32);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${(report.anomaly_type || 'finding').replace(/_/g, ' ').toUpperCase()}`, M, 58);

      // Meta
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      let y = 110;
      const lines = [
        `Severity: ${(report.severity || '—').toUpperCase()}  ·  Condition score: ${report.condition_score || '—'}/5`,
        `AI confidence: ${Math.round(report.ai_confidence || 0)}%  ·  Model: ${report.ai_model_version || 'baseline'}`,
        `Status: ${report.review_status || 'pending'}${report.reviewed_by ? ` (by ${report.reviewed_by})` : ''}`,
        `Generated: ${format(new Date(), 'PPP p')}`,
      ];
      lines.forEach((l) => { doc.text(l, M, y); y += 14; });

      // Asset block
      const eq = equipment?.find((e) => e.id === report.equipment_id);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Asset', M, y + 12);
      y += 28;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const assetLines = [
        `Name: ${report.equipment_name || eq?.name || '—'}`,
        `Type: ${eq?.type || '—'}`,
        `Location: ${eq?.location || '—'}`,
        `Manufacturer/Model: ${[eq?.manufacturer, eq?.model].filter(Boolean).join(' / ') || '—'}`,
      ];
      assetLines.forEach((l) => { doc.text(l, M, y); y += 14; });

      // Embed image
      if (report.image_url) {
        try {
          const img = await loadImage(report.image_url);
          const maxImgW = W - M * 2;
          const maxImgH = 320;
          const ratio = img.width / img.height;
          let imgW = maxImgW;
          let imgH = imgW / ratio;
          if (imgH > maxImgH) { imgH = maxImgH; imgW = imgH * ratio; }
          const imgX = (W - imgW) / 2;
          const imgY = y + 12;
          doc.addImage(img, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');

          // Bounding box overlay
          if (report.bounding_box) {
            const bb = report.bounding_box;
            doc.setDrawColor(220, 38, 38);
            doc.setLineWidth(2);
            doc.rect(
              imgX + bb.x * imgW,
              imgY + bb.y * imgH,
              bb.width * imgW,
              bb.height * imgH
            );
          }
          y = imgY + imgH + 20;
        } catch (e) {
          doc.setTextColor(148, 163, 184);
          doc.text('[Image could not be embedded]', M, y + 30);
          y += 50;
          doc.setTextColor(15, 23, 42);
        }
      }

      // AI description
      if (report.ai_description) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('AI Description', M, y);
        y += 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const wrapped = doc.splitTextToSize(report.ai_description, W - M * 2);
        doc.text(wrapped, M, y);
        y += wrapped.length * 12 + 10;
      }

      // Reviewer notes
      if (report.reviewer_notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Reviewer Notes', M, y);
        y += 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const wrapped = doc.splitTextToSize(report.reviewer_notes, W - M * 2);
        doc.text(wrapped, M, y);
        y += wrapped.length * 12 + 10;
      }

      // Recommended action
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Recommended Action', M, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const action = recommendedAction(report);
      const actionLines = doc.splitTextToSize(action, W - M * 2);
      doc.text(actionLines, M, y);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('AssetStack · Anomaly Evidence Pack', M, doc.internal.pageSize.getHeight() - 20);

      doc.save(
        `evidence-${(report.anomaly_type || 'finding')}-${report.id?.slice(0, 6) || 'x'}.pdf`
      );
      toast?.success?.('Evidence pack exported');
    } catch (e) {
      console.error(e);
      toast?.error?.('Export failed');
    }
    setBusy(false);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={buildPdf}
      disabled={busy}
      className="h-7 text-[10px] text-slate-500 hover:text-indigo-600 px-1.5"
      title="Download single-anomaly PDF with image and recommended action"
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3 mr-1" />}
      Evidence
    </Button>
  );
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function recommendedAction(r) {
  const sev = r.severity;
  const type = (r.anomaly_type || '').replace(/_/g, ' ');
  if (sev === 'critical') return `Immediate isolation and inspection required. Schedule emergency work order. Type: ${type}.`;
  if (sev === 'major') return `Inspect within 7 days and plan corrective maintenance. Monitor for progression. Type: ${type}.`;
  if (sev === 'moderate') return `Add to next preventive maintenance cycle. Re-photograph at next inspection. Type: ${type}.`;
  return `Cosmetic / low-impact. Track in condition register; no immediate action required. Type: ${type}.`;
}