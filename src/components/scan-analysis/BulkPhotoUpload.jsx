import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Upload, Loader2, CheckCircle2, X, Image as ImageIcon, Sparkles, MapPin, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { readExif, nearestLocation } from '@/lib/exif';

const PHOTO_TYPES = [
  { value: 'inspection', label: 'Inspection' },
  { value: 'defect', label: 'Defect' },
  { value: 'baseline', label: 'Baseline' },
  { value: 'post_repair', label: 'Post-Repair' },
  { value: 'reference', label: 'Reference' },
];

export default function BulkPhotoUpload({ open, onOpenChange, equipment = [], locations = [], onCompleted }) {
  const [step, setStep] = useState('drop'); // drop | review | uploading | done
  const [files, setFiles] = useState([]);   // [{ file, preview, exif, equipment_id, location_id, photo_type, captured_date, notes }]
  const [defaultAssetId, setDefaultAssetId] = useState('');
  const [defaultLocationId, setDefaultLocationId] = useState('');
  const [defaultPhotoType, setDefaultPhotoType] = useState('inspection');
  const [runAI, setRunAI] = useState(true);
  const [scanName, setScanName] = useState('');
  const [progress, setProgress] = useState({ uploaded: 0, total: 0 });
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    setStep('drop');
    setFiles([]);
    setDefaultAssetId('');
    setDefaultLocationId('');
    setDefaultPhotoType('inspection');
    setScanName('');
    setProgress({ uploaded: 0, total: 0 });
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const processFiles = useCallback(async (fileList) => {
    const imgFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (imgFiles.length === 0) {
      toast.error('Please drop image files');
      return;
    }
    const enriched = await Promise.all(
      imgFiles.map(async (file) => {
        const exif = await readExif(file);
        const preview = URL.createObjectURL(file);
        // Try to auto-match nearest location from GPS
        let matchedLoc = null;
        if (exif.lat && exif.lng && locations.length) {
          const match = nearestLocation(locations, exif.lat, exif.lng, 25);
          if (match) matchedLoc = match.location;
        }
        return {
          file,
          preview,
          exif,
          equipment_id: '',
          location_id: matchedLoc?.id || '',
          location_name: matchedLoc?.name || '',
          photo_type: 'inspection',
          captured_date: exif.date || new Date().toISOString().slice(0, 10),
          notes: '',
        };
      })
    );
    setFiles(enriched);
    setScanName(`Photo set — ${new Date().toISOString().slice(0, 10)}`);
    setStep('review');
  }, [locations]);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) processFiles(e.dataTransfer.files);
  };

  // Apply defaults to all rows missing values
  const applyDefaults = () => {
    setFiles((curr) =>
      curr.map((f) => ({
        ...f,
        equipment_id: f.equipment_id || defaultAssetId,
        location_id: f.location_id || defaultLocationId,
        photo_type: f.photo_type || defaultPhotoType,
      }))
    );
  };

  const updateFile = (idx, patch) => {
    setFiles((curr) => curr.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const removeFile = (idx) => {
    setFiles((curr) => curr.filter((_, i) => i !== idx));
  };

  const validCount = files.filter((f) => f.equipment_id).length;
  const gpsMatchedCount = files.filter((f) => f.exif?.lat && f.location_id).length;

  const handleUpload = async () => {
    setStep('uploading');
    setProgress({ uploaded: 0, total: files.length, analyzed: 0, findings: 0, phase: 'uploading' });

    const photos = [];
    let uploadedSoFar = 0;

    // 1. Upload each file to storage (sequential — keep network polite)
    for (const f of files) {
      if (!f.equipment_id) continue;
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f.file });
        const eq = equipment.find((e) => e.id === f.equipment_id);
        const loc = locations.find((l) => l.id === f.location_id);
        photos.push({
          file_url,
          equipment_id: f.equipment_id,
          equipment_name: eq?.name || '',
          location_id: f.location_id || null,
          location_name: loc?.name || '',
          captured_date: f.captured_date,
          notes: f.notes,
          photo_type: f.photo_type,
          lat: f.exif?.lat || null,
          lng: f.exif?.lng || null,
        });
      } catch (e) {
        console.error('upload failed', e);
      }
      uploadedSoFar++;
      setProgress((p) => ({ ...p, uploaded: uploadedSoFar }));
    }

    if (photos.length === 0) {
      toast.error('No photos were uploaded successfully');
      setStep('review');
      return;
    }

    // 2. Create AssetPhoto records + optional scan via backend
    try {
      const firstLoc = photos.find((p) => p.location_id);
      const response = await base44.functions.invoke('bulkAnalyzePhotos', {
        photos,
        create_scan: runAI,
        scan_name: scanName,
        location_id: firstLoc?.location_id || null,
        location_name: firstLoc?.location_name || null,
      });

      let result = response.data;
      const scanId = result?.scan_id;

      // 3. Run AI analysis per photo from the FRONTEND (same pattern as Scan Analysis re-run)
      let analyzedCount = 0;
      let totalFindings = 0;
      if (runAI && scanId) {
        setProgress({ uploaded: photos.length, total: photos.length, analyzed: 0, findings: 0, phase: 'analyzing', analyzeTotal: photos.length });
        const batchSize = 3;
        for (let i = 0; i < photos.length; i += batchSize) {
          const batch = photos.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map((p) =>
              base44.functions.invoke('analyzeScanCondition', {
                image_url: p.file_url,
                digital_twin_model_id: scanId,
                digital_twin_model_name: result.scan_name,
                equipment_id: p.equipment_id || null,
                equipment_name: p.equipment_name || null,
              })
            )
          );
          for (const r of results) {
            if (r.status === 'fulfilled') {
              analyzedCount++;
              totalFindings += r.value?.data?.findings_count || 0;
            }
          }
          setProgress((p) => ({ ...p, analyzed: analyzedCount, findings: totalFindings }));
        }
      }

      setResult({ ...result, analyzed_count: analyzedCount, total_findings: totalFindings });
      setStep('done');
      onCompleted?.({ ...result, analyzed_count: analyzedCount, total_findings: totalFindings });
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message);
      setStep('review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            Bulk Photo Upload
          </DialogTitle>
          <DialogDescription>
            Drop a folder of inspection photos. We'll auto-tag them via EXIF and run AI condition analysis on each.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {/* STEP: DROP */}
          {step === 'drop' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Drop photos here</h3>
              <p className="text-sm text-slate-500 mb-4">JPG, PNG, HEIC — up to a few hundred at once</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && processFiles(e.target.files)}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer text-sm font-medium">
                  <ImageIcon className="w-4 h-4" /> Choose photos
                </span>
              </label>
              <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                EXIF GPS auto-matches to your nearest location · AI runs after upload
              </div>
            </div>
          )}

          {/* STEP: REVIEW */}
          {step === 'review' && (
            <div className="space-y-4">
              {/* Defaults bar */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-sm font-semibold text-indigo-900">Apply to all photos</div>
                  <Badge variant="secondary" className="bg-white">
                    {files.length} photos · {gpsMatchedCount} auto-matched via GPS
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select value={defaultAssetId || undefined} onValueChange={setDefaultAssetId}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Default asset (optional)" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={defaultLocationId || undefined} onValueChange={setDefaultLocationId}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Default location (optional)" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={defaultPhotoType} onValueChange={setDefaultPhotoType}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PHOTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button size="sm" variant="outline" onClick={applyDefaults}>Apply defaults to empty rows</Button>
                  <div className="flex items-center gap-2 ml-auto">
                    <Switch checked={runAI} onCheckedChange={setRunAI} id="run-ai" />
                    <label htmlFor="run-ai" className="text-xs text-indigo-900 font-medium cursor-pointer">
                      Run AI condition analysis after upload
                    </label>
                  </div>
                </div>
                {runAI && (
                  <Input
                    placeholder="Scan name (e.g. Building A — Q2 walk-through)"
                    value={scanName}
                    onChange={(e) => setScanName(e.target.value)}
                    className="bg-white"
                  />
                )}
              </div>

              {/* Photo rows */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-2.5 bg-white border border-slate-200 rounded-lg">
                    <img src={f.preview} alt="" className="w-16 h-16 rounded object-cover bg-slate-100" />
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Select value={f.equipment_id || undefined} onValueChange={(v) => updateFile(idx, { equipment_id: v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Pick asset *" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={f.location_id || undefined} onValueChange={(v) => updateFile(idx, { location_id: v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Location" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={f.photo_type} onValueChange={(v) => updateFile(idx, { photo_type: v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PHOTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="md:col-span-3 flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="truncate">{f.file.name}</span>
                        {f.exif?.lat && (
                          <Badge variant="outline" className="h-4 px-1 text-[9px]">
                            <MapPin className="w-2.5 h-2.5 mr-0.5" />
                            {f.exif.lat.toFixed(3)}, {f.exif.lng.toFixed(3)}
                          </Badge>
                        )}
                        {f.exif?.date && <span>📅 {f.exif.date}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-rose-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div className="text-sm flex-1">
                  <span className="font-semibold text-emerald-900">{validCount} of {files.length}</span>
                  <span className="text-emerald-700"> ready to upload</span>
                  {validCount < files.length && (
                    <span className="text-amber-700 ml-3">· {files.length - validCount} need an asset selected</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP: UPLOADING */}
          {step === 'uploading' && (
            <div className="py-16 text-center">
              <Loader2 className="w-10 h-10 text-indigo-600 mx-auto mb-4 animate-spin" />
              {progress.phase === 'analyzing' ? (
                <>
                  <p className="text-sm text-slate-700 font-semibold mb-1">
                    Running AI analysis · {progress.analyzed} of {progress.analyzeTotal}…
                  </p>
                  <p className="text-xs text-amber-700">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {progress.findings} condition issue(s) detected so far
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-700 font-semibold mb-1">
                    Uploading {progress.uploaded} of {progress.total}…
                  </p>
                  <p className="text-xs text-slate-500">
                    {runAI ? 'AI analysis runs automatically once uploads finish.' : 'Photos will be saved to the library.'}
                  </p>
                </>
              )}
              <div className="w-full max-w-md mx-auto mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all"
                  style={{
                    width: progress.phase === 'analyzing'
                      ? `${(progress.analyzed / Math.max(1, progress.analyzeTotal)) * 100}%`
                      : `${(progress.uploaded / Math.max(1, progress.total)) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP: DONE */}
          {step === 'done' && result && (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Upload complete</h3>
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-semibold text-emerald-700">{result.photos_created} photos</span> added to the library
              </p>
              {result.total_findings > 0 && (
                <p className="text-sm text-amber-700 mb-1">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  AI detected <span className="font-bold">{result.total_findings}</span> condition issue(s) across {result.analyzed_count} photos
                </p>
              )}
              {result.scan_id && (
                <p className="text-xs text-slate-500 mt-2">Scan created: {result.scan_name}</p>
              )}
              <Button onClick={handleClose} className="mt-6 bg-indigo-600 hover:bg-indigo-700">Done</Button>
            </div>
          )}
        </div>

        {step === 'review' && (
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={validCount === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Upload {validCount} photos →
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}