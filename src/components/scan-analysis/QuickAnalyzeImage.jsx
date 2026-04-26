import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus, Loader2, Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * QuickAnalyzeImage — drag-and-drop or pick any JPEG/PNG,
 * uploads it, creates a lightweight scan record, and runs AI analysis end-to-end.
 */
export default function QuickAnalyzeImage({ open, onClose, onCompleted }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState('');
  const [assetContext, setAssetContext] = useState('');
  const [stage, setStage] = useState('idle'); // idle | uploading | creating | analyzing | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setName('');
    setAssetContext('');
    setStage('idle');
    setResult(null);
    setErrorMsg('');
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPEG, PNG, WebP).');
      return;
    }
    setErrorMsg('');
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const runAnalysis = async () => {
    if (!file || !name) return;
    setErrorMsg('');
    try {
      // 1) Upload image
      setStage('uploading');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // 2) Create scan record
      setStage('creating');
      const scan = await base44.entities.DigitalTwinModel.create({
        name,
        description: assetContext ? `Quick image analysis — ${assetContext}` : 'Quick image analysis',
        preview_image_url: file_url,
        model_type: 'photogrammetry',
        scan_date: new Date().toISOString().split('T')[0],
        status: 'ready',
      });

      // 3) Run AI analysis
      setStage('analyzing');
      const res = await base44.functions.invoke('analyzeScanCondition', {
        image_url: file_url,
        digital_twin_model_id: scan.id,
        digital_twin_model_name: scan.name,
        equipment_name: assetContext || name,
      });

      setResult({ scan, ...res.data });
      setStage('done');
      onCompleted && onCompleted(scan.id);
    } catch (err) {
      setErrorMsg(err?.message || 'Analysis failed. Please try again.');
      setStage('error');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const stageLabel = {
    uploading: 'Uploading image…',
    creating: 'Creating scan record…',
    analyzing: 'AI is analyzing the image…',
  }[stage];

  const busy = ['uploading', 'creating', 'analyzing'].includes(stage);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Analyze Image with AI
          </DialogTitle>
        </DialogHeader>

        {stage === 'done' && result ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="font-semibold">Analysis complete!</p>
                <p className="text-sm">
                  Found {result.findings_count} {result.findings_count === 1 ? 'issue' : 'issues'} in the image.
                </p>
              </div>
            </div>
            {previewUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-200 max-h-64 bg-slate-50">
                <img src={previewUrl} alt="Analyzed" className="w-full object-contain max-h-64" />
              </div>
            )}
            {result.overall_summary && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">AI Summary</p>
                {result.overall_summary}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="flex-1">
                <ImagePlus className="w-4 h-4 mr-2" /> Analyze Another
              </Button>
              <Button onClick={handleClose} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                View Results
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !busy && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver ? 'border-indigo-500 bg-indigo-50' :
                previewUrl ? 'border-slate-200' :
                'border-slate-300 bg-slate-50 hover:bg-slate-100'
              } ${busy ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="mx-auto max-h-64 rounded-lg object-contain" />
                  {!busy && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-6">
                  <ImagePlus className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="font-medium text-slate-700">Drop a JPEG / PNG here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse — any real photo of an asset works</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Scan Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Reception desk - East wing"
                  disabled={busy}
                />
              </div>
              <div>
                <Label className="text-xs">Asset / Context (optional)</Label>
                <Input
                  value={assetContext}
                  onChange={(e) => setAssetContext(e.target.value)}
                  placeholder="e.g. Oak reading table, Boardroom chair"
                  disabled={busy}
                />
              </div>
            </div>

            {/* Status */}
            {busy && (
              <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">{stageLabel}</p>
                  <p className="text-xs text-indigo-600">This usually takes 10-20 seconds.</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={handleClose} className="flex-1" disabled={busy}>Cancel</Button>
              <Button
                onClick={runAnalysis}
                disabled={busy || !file || !name}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {busy ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Analyze with AI</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}