import React from 'react';
import { Upload, Camera, FileSpreadsheet, Sparkles, CheckCircle2, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const steps = [
  {
    number: '01',
    title: 'Use the loaded walkthrough',
    description: 'Start from the existing South West Sports Centre Matterport walkthrough.',
    icon: Upload,
  },
  {
    number: '02',
    title: 'Capture scan evidence',
    description: 'Add photos or scan frames so AI has visual evidence to inspect.',
    icon: Camera,
  },
  {
    number: '03',
    title: 'Match the spreadsheet',
    description: 'Import the Excel/CSV findings and match rows to the scan evidence.',
    icon: FileSpreadsheet,
  },
  {
    number: '04',
    title: 'Review and approve',
    description: 'Verify AI findings, correct issues, then export the condition report.',
    icon: CheckCircle2,
  },
];

export default function ScanWorkflowPanel({
  scan,
  framesCount = 0,
  reportsCount = 0,
  pendingCount = 0,
  analyzing,
  analysisProgress,
  canRunAI,
  onUploadScan,
  onAddPhotos,
  onAnalyzeImage,
  onImportFindings,
  onRunAI,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 p-4 md:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Clean workflow</Badge>
            {scan && <Badge variant="outline">Active scan: {scan.name}</Badge>}
          </div>
          <h2 className="text-xl font-bold text-slate-900">3D scan → Excel match → verified report</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Follow these steps in order: use the existing walkthrough, add or capture evidence frames, match the spreadsheet, then verify the outputs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onUploadScan} variant="outline" className="bg-white">
            <Upload className="w-4 h-4 mr-2" /> Use SWSC walkthrough
          </Button>
          <Button onClick={onAddPhotos} variant="outline" className="bg-white">
            <Camera className="w-4 h-4 mr-2" /> Add photos
          </Button>
          <Button onClick={onImportFindings} className="bg-indigo-600 hover:bg-indigo-700">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Import Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-600">{step.number}</span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">Frames: {framesCount}</Badge>
          <Badge variant="outline">Findings: {reportsCount}</Badge>
          <Badge className={pendingCount ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
            Pending review: {pendingCount}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAnalyzeImage} variant="outline" className="bg-white">
            <ImagePlus className="w-4 h-4 mr-2" /> Analyze single image
          </Button>
          <Button
            onClick={onRunAI}
            disabled={analyzing || !canRunAI}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {analysisProgress ? `Analyzing ${analysisProgress.current}/${analysisProgress.total}…` : 'Analyzing…'}
              </>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Run AI analysis</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}