import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, AlertCircle, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Import inspector findings from CSV/Excel and AI-match each to the best scan photo.
export default function ImportFindingsDialog({ open, onClose, scopeScanId, scopeScanName, onCompleted }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { imported, unmatched, total, rows }
  const [error, setError] = useState('');

  const reset = () => {
    setFile(null);
    setUploading(false);
    setResult(null);
    setError('');
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose && onClose();
  };

  const downloadTemplate = () => {
    const csv = [
      'asset_name,anomaly_type,severity,description',
      'Pump A-12,corrosion,moderate,Rust visible on lower flange near outlet',
      'HVAC Unit 3,crack,major,Hairline crack along casing',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'condition-findings-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setError('');
    setUploading(true);
    setResult(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke('importConditionFindings', {
        file_url,
        digital_twin_model_id: scopeScanId || undefined,
      });
      if (res?.data?.success) {
        setResult(res.data);
        toast?.success?.(`Imported ${res.data.imported} finding(s)`);
        onCompleted && onCompleted();
      } else {
        const msg = res?.data?.error || 'Import failed';
        setError(msg);
        toast?.error?.(msg);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Import failed';
      setError(msg);
      toast?.error?.(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Import inspector findings
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file of condition findings. We'll match each row to the best existing scan photo for that asset using AI.
            {scopeScanName && (
              <> Scoping match to scan: <span className="font-semibold">{scopeScanName}</span>.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1.5">
              <div className="font-semibold text-slate-900">Required columns</div>
              <div><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">asset_name</code> — must match an asset in your register</div>
              <div><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">anomaly_type</code> — scratch, dent, crack, corrosion, stain, broken_part, missing_part, wear, water_damage, graffiti, misalignment, other</div>
              <div><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">severity</code> — minor, moderate, major, critical</div>
              <div><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">description</code> — optional, helps the AI photo-match</div>
              <Button size="sm" variant="outline" onClick={downloadTemplate} className="mt-1.5 h-7 text-xs">
                <Download className="w-3 h-3 mr-1" /> Download CSV template
              </Button>
            </div>

            <label className="block">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {file ? file.name : 'Click to choose a CSV or Excel file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">.csv, .xlsx, .xls — max 25 MB</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                />
              </div>
            </label>

            {error && (
              <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2 text-red-700 border border-red-200">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={handleClose} className="flex-1" disabled={uploading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Matching to photos…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Import & match</>
                )}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-emerald-900">Import complete</div>
                <div className="text-emerald-700 text-xs mt-0.5">
                  {result.imported} of {result.total} row(s) matched to photos and saved as pending findings.
                  {result.unmatched > 0 && ` ${result.unmatched} could not be matched.`}
                </div>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-2.5 py-1.5 font-semibold text-slate-600">Asset</th>
                    <th className="text-left px-2.5 py-1.5 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-2.5 py-1.5 font-semibold text-slate-600">Match / Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-2.5 py-1.5 text-slate-700">{r.asset || '—'}</td>
                      <td className="px-2.5 py-1.5">
                        <Badge variant="outline" className={`text-[10px] ${
                          r.status === 'imported' ? 'border-emerald-300 text-emerald-700' :
                          r.status === 'unmatched' ? 'border-amber-300 text-amber-700' :
                          'border-slate-300 text-slate-600'
                        }`}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-2.5 py-1.5 text-slate-500">
                        {r.status === 'imported'
                          ? `Photo match ${Math.round(r.match_confidence || 0)}%`
                          : r.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={reset} className="flex-1">Import another</Button>
              <Button onClick={handleClose} className="flex-1">Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}