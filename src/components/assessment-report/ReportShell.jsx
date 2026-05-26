import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, Download, Loader2 } from 'lucide-react';

const PAGE_NAMES = [
  'Homepage',
  'Building Cover',
  'Defects',
  'Total Costs Summary',
  'Program by Room',
  'Program by Asset Type',
  '20yr FWP',
  'FWP by Area',
  'Matrices',
  'Condition Summary',
  'Condition Change',
  'Asset Summary',
  'LOS Summary',
  'First Replacement',
];

export default function ReportShell({
  assessment,
  pageIndex,
  totalPages,
  onPageChange,
  onExportPDF,
  exporting,
  children,
  pageId,
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar — hidden in print */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Building Condition Assessment</div>
            <div className="text-sm font-bold text-slate-900 truncate">{assessment?.title || 'Untitled'}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={pageIndex}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className="text-xs border border-slate-200 rounded-md py-1.5 px-2 bg-white font-medium text-slate-700 max-w-[200px]"
            >
              {PAGE_NAMES.map((n, i) => (
                <option key={i} value={i}>{i + 1}. {n}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(0)}
              className="h-8"
              title="Homepage"
            >
              <Home className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0}
              className="h-8"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages - 1, pageIndex + 1))}
              disabled={pageIndex === totalPages - 1}
              className="h-8"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={onExportPDF}
              disabled={exporting}
              className="h-8 bg-indigo-600 hover:bg-indigo-700 gap-1.5"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export PDF'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Page canvas — sized at landscape A3 for crisp PDF output */}
      <div className="py-6 px-4 print:p-0">
        <div
          id={pageId}
          className="bg-white shadow-xl mx-auto print:shadow-none"
          style={{ width: '1400px', maxWidth: '100%', minHeight: '900px' }}
        >
          <div className="p-8 print:p-6">
            <PageHeader assessment={assessment} pageIndex={pageIndex} />
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ assessment, pageIndex }) {
  if (pageIndex === 0) return null;
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
      <div className="flex items-center gap-3">
        {assessment?.partner_logo_url && (
          <img src={assessment.partner_logo_url} alt="" className="h-8 object-contain" />
        )}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Building Condition Assessment {assessment?.assessment_year || ''}
          </div>
          <div className="text-sm font-bold text-slate-900">{PAGE_NAMES[pageIndex]}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{assessment?.location_name}</div>
          <div className="text-xs text-slate-600">{assessment?.building_type || ''}</div>
        </div>
        {assessment?.client_logo_url && (
          <img src={assessment.client_logo_url} alt="" className="h-10 object-contain" />
        )}
      </div>
    </div>
  );
}