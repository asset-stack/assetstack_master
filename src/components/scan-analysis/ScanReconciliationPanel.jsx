import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, CheckCircle2, Sparkles, FileSpreadsheet, ScanLine } from 'lucide-react';
import { toast } from 'sonner';

// Three-way reconciliation of an inspector spreadsheet vs AI scan findings.
export default function ScanReconciliationPanel({ scan, onUpdated }) {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !scan?.id) return;
    setLoading(true);
    setResult(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke('reconcileScanFindings', {
        mode: 'preview',
        digital_twin_model_id: scan.id,
        file_url,
      });
      setResult(res.data);
      toast.success(`Matched ${res.data.confirmed?.length || 0} finding(s) to your spreadsheet`);
    } catch (err) {
      toast.error(`Reconcile failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleApply = async () => {
    if (!result) return;
    setApplying(true);
    try {
      await base44.functions.invoke('reconcileScanFindings', {
        mode: 'apply',
        digital_twin_model_id: scan.id,
        digital_twin_model_name: scan.name,
        confirmations: result.confirmed,
        sheet_only_rows: result.sheet_only,
      });
      toast.success('Spreadsheet confirmations applied to the condition report');
      setResult(null);
      onUpdated && onUpdated();
    } catch (err) {
      toast.error(`Could not apply: ${err?.message || 'Unknown error'}`);
    } finally {
      setApplying(false);
    }
  };

  const confirmed = result?.confirmed || [];
  const sheetOnly = result?.sheet_only || [];
  const aiOnly = result?.ai_only || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Confirm with Inspector Spreadsheet
        </h4>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
        <Button
          size="sm"
          variant="outline"
          disabled={loading || !scan?.id}
          onClick={() => fileRef.current?.click()}
          className="h-8 text-xs"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
          Upload spreadsheet
        </Button>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Upload the condition spreadsheet for this scan. We match each row to the AI findings and show what's
        <span className="font-semibold text-emerald-700"> confirmed</span>,
        <span className="font-semibold text-indigo-700"> AI-only</span>, and
        <span className="font-semibold text-amber-700"> sheet-only</span>.
      </p>

      {!result && !loading && (
        <div className="text-center py-6 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg">
          No spreadsheet uploaded yet.
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              <div className="font-bold text-emerald-700 text-lg">{confirmed.length}</div>
              <div className="text-emerald-600">Confirmed</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
              <div className="font-bold text-indigo-700 text-lg">{aiOnly.length}</div>
              <div className="text-indigo-600">AI only</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <div className="font-bold text-amber-700 text-lg">{sheetOnly.length}</div>
              <div className="text-amber-600">Sheet only</div>
            </div>
          </div>

          {confirmed.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confirmed matches
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                {confirmed.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 rounded-lg p-2 text-xs">
                    {c.image_url && <img src={c.image_url} alt="" className="w-9 h-9 rounded object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 capitalize truncate">{c.anomaly_type?.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {[c.room_name, c.component_type].filter(Boolean).join(' • ') || 'No room/component'}
                      </p>
                    </div>
                    {c.sheet_grade != null && <Badge variant="outline" className="text-[10px]">Grade {c.sheet_grade}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiOnly.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-indigo-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI found — not in spreadsheet
              </p>
              <div className="flex flex-wrap gap-1">
                {aiOnly.map((a, i) => (
                  <Badge key={i} className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] capitalize">
                    {a.anomaly_type?.replace(/_/g, ' ')} · {a.severity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {sheetOnly.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-amber-700 mb-1 flex items-center gap-1">
                <ScanLine className="w-3 h-3" /> In spreadsheet — AI didn't flag
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                {sheetOnly.map((s, i) => (
                  <div key={i} className="bg-amber-50/60 border border-amber-100 rounded-lg p-2 text-xs flex items-center justify-between gap-2">
                    <span className="truncate text-slate-700">
                      {[s.room_name, s.component_type].filter(Boolean).join(' • ') || 'Unspecified'}
                    </span>
                    {s.sheet_grade != null && <Badge variant="outline" className="text-[10px]">Grade {s.sheet_grade}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleApply}
            disabled={applying}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Apply confirmations to report
          </Button>
        </div>
      )}
    </div>
  );
}