import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Sparkles, Pause, Play, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FILE_STATUS } from '@/lib/bulkUploadEngine';

export default function BulkUploadProgress({ files, phase, paused, onPauseToggle, onRetryFailed, onCancel }) {
  const total = files.length;
  const uploaded = files.filter((f) => [FILE_STATUS.UPLOADED, FILE_STATUS.ANALYZING, FILE_STATUS.ANALYZED, FILE_STATUS.ANALYSIS_FAILED].includes(f.status)).length;
  const failed = files.filter((f) => f.status === FILE_STATUS.FAILED).length;
  const analyzed = files.filter((f) => f.status === FILE_STATUS.ANALYZED).length;
  const findings = files.reduce((acc, f) => acc + (f.findings_count || 0), 0);

  const isUploading = phase === 'uploading';
  const isAnalyzing = phase === 'analyzing';

  const uploadPct = total ? (uploaded / total) * 100 : 0;
  const analyzePct = total ? (analyzed / total) * 100 : 0;

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
          {paused ? (
            <Pause className="w-5 h-5 text-amber-600" />
          ) : (
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          )}
          {paused ? 'Paused' : isAnalyzing ? 'Running AI analysis' : 'Uploading photos'}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          You can close this dialog — uploads will keep running while it's open.
        </p>
      </div>

      {/* Upload progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700">
            Uploads: {uploaded.toLocaleString()} / {total.toLocaleString()}
          </span>
          <span className="text-slate-500">{Math.round(uploadPct)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${uploadPct}%` }}
          />
        </div>
        {failed > 0 && (
          <div className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {failed} failed — will not block remaining uploads
          </div>
        )}
      </div>

      {/* AI analysis progress */}
      {(isAnalyzing || analyzed > 0) && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              AI analysis: {analyzed.toLocaleString()} / {uploaded.toLocaleString()}
            </span>
            <span className="text-slate-500">{Math.round(analyzePct)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
              style={{ width: `${analyzePct}%` }}
            />
          </div>
          {findings > 0 && (
            <div className="mt-1 text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {findings} condition issue(s) detected so far
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button variant="outline" size="sm" onClick={onPauseToggle}>
          {paused ? <><Play className="w-3.5 h-3.5 mr-1" />Resume</> : <><Pause className="w-3.5 h-3.5 mr-1" />Pause</>}
        </Button>
        {failed > 0 && (
          <Button variant="outline" size="sm" onClick={onRetryFailed}>
            <RotateCw className="w-3.5 h-3.5 mr-1" /> Retry {failed} failed
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-rose-600 hover:text-rose-700">
          Cancel
        </Button>
      </div>
    </div>
  );
}