import React, { useState, useMemo, useCallback } from 'react';
import { useReportData } from '@/components/assessment-report/useReportData';
import ReportShell from '@/components/assessment-report/ReportShell';
import P01_Homepage from '@/components/assessment-report/pages/P01_Homepage';
import P02_BuildingCover from '@/components/assessment-report/pages/P02_BuildingCover';
import P03_Defects from '@/components/assessment-report/pages/P03_Defects';
import P04_TotalCosts from '@/components/assessment-report/pages/P04_TotalCosts';
import P05_ProgramByRoom from '@/components/assessment-report/pages/P05_ProgramByRoom';
import P06_ProgramByAssetType from '@/components/assessment-report/pages/P06_ProgramByAssetType';
import P07_TwentyYearFWP from '@/components/assessment-report/pages/P07_TwentyYearFWP';
import P08_FWPByArea from '@/components/assessment-report/pages/P08_FWPByArea';
import P09_Matrices from '@/components/assessment-report/pages/P09_Matrices';
import P10_ConditionSummary from '@/components/assessment-report/pages/P10_ConditionSummary';
import P11_ConditionChange from '@/components/assessment-report/pages/P11_ConditionChange';
import P12_AssetSummary from '@/components/assessment-report/pages/P12_AssetSummary';
import P13_LOSSummary from '@/components/assessment-report/pages/P13_LOSSummary';
import P14_FirstReplacement from '@/components/assessment-report/pages/P14_FirstReplacement';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_ID = 'assessment-report-canvas';
const TOTAL_PAGES = 14;

export default function AssessmentReport() {
  const urlParams = new URLSearchParams(window.location.search);
  const assessmentId = urlParams.get('id');
  const { data, loading, error } = useReportData(assessmentId);
  const [pageIndex, setPageIndex] = useState(0);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = useCallback(async () => {
    if (!data) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a3' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const originalPage = pageIndex;
      for (let i = 0; i < TOTAL_PAGES; i++) {
        setPageIndex(i);
        // Wait for React to render
        await new Promise(r => setTimeout(r, 600));
        const node = document.getElementById(PAGE_ID);
        if (!node) continue;
        const canvas = await html2canvas(node, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
        const img = canvas.toDataURL('image/jpeg', 0.92);
        const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height);
        const w = canvas.width * ratio;
        const h = canvas.height * ratio;
        if (i > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', (pdfW - w) / 2, (pdfH - h) / 2, w, h);
      }
      pdf.save(`${(data.assessment?.title || 'condition-assessment').replace(/[^a-z0-9]+/gi, '-')}.pdf`);
      setPageIndex(originalPage);
      toast.success('PDF exported');
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  }, [data, pageIndex]);

  if (!assessmentId) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-20 text-center">
        <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <div className="font-semibold text-slate-800">No assessment specified</div>
        <div className="text-sm text-slate-500 mt-1">Open this report from a Condition Assessment in the Inspector.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-500 min-h-[400px]">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading assessment report…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-20 text-center">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
        <div className="font-semibold text-slate-800">Failed to load report</div>
        <div className="text-sm text-slate-500 mt-1">{error || 'Unknown error'}</div>
      </div>
    );
  }

  const { assessment, rooms, components, defects, engine } = data;

  const renderPage = () => {
    const props = { assessment, rooms, components, defects, engine };
    switch (pageIndex) {
      case 0: return <P01_Homepage {...props} onNavigate={setPageIndex} />;
      case 1: return <P02_BuildingCover {...props} />;
      case 2: return <P03_Defects {...props} />;
      case 3: return <P04_TotalCosts {...props} />;
      case 4: return <P05_ProgramByRoom {...props} />;
      case 5: return <P06_ProgramByAssetType {...props} />;
      case 6: return <P07_TwentyYearFWP {...props} />;
      case 7: return <P08_FWPByArea {...props} />;
      case 8: return <P09_Matrices {...props} />;
      case 9: return <P10_ConditionSummary {...props} />;
      case 10: return <P11_ConditionChange {...props} />;
      case 11: return <P12_AssetSummary {...props} />;
      case 12: return <P13_LOSSummary {...props} />;
      case 13: return <P14_FirstReplacement {...props} />;
      default: return null;
    }
  };

  return (
    <ReportShell
      assessment={assessment}
      pageIndex={pageIndex}
      totalPages={TOTAL_PAGES}
      onPageChange={setPageIndex}
      onExportPDF={handleExportPDF}
      exporting={exporting}
      pageId={PAGE_ID}
    >
      {renderPage()}
    </ReportShell>
  );
}