import React, { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Camera, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { runPool, FILE_STATUS, safeReadExif } from '@/lib/bulkUploadEngine';
import { readExif } from '@/lib/exif';
import BulkUploadProgress from './BulkUploadProgress';

const PHOTO_TYPES = ['inspection', 'defect', 'baseline', 'post_repair', 'reference'];
const MAX_PREVIEWS = 50;
const UPLOAD_CONCURRENCY = 6;
const ANALYZE_CONCURRENCY = 3;

export default function BulkPhotoUpload({ open, onOpenChange, equipment = [], locations = [], onCompleted }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [equipmentId, setEquipmentId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [photoType, setPhotoType] = useState('inspection');
  const [runAI, setRunAI] = useState(true);
  const [createScan, setCreateScan] = useState(false);
  const [scanName, setScanName] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | uploading | analyzing | done
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const cancelRef = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const reset = useCallback(() => {
    setFiles([]);
    setPreviews([]);
    setPhase('idle');
    setPaused(false);
    pausedRef.current = false;
    cancelRef.current = false;
  }, []);

  const handleClose = (next) => {
    if (!next && phase !== 'idle' && phase !== 'done') {
      if (!confirm('Cancel ongoing upload?')) return;
      cancelRef.current = true;
    }
    onOpenChange(next);
    if (!next) setTimeout(reset, 300);
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const items = selected.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      name: file.name,
      size: file.size,
      status: FILE_STATUS.PENDING,
      preview: i < MAX_PREVIEWS ? URL.createObjectURL(file) : null,
    }));
    setFiles(items);
    setPreviews(items.slice(0, MAX_PREVIEWS).map((f) => f.preview));
  };

  const updateFile = (id, patch) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const waitIfPaused = async () => {
    while (pausedRef.current && !cancelRef.current) {
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  const startUpload = async () => {
    if (!files.length) return;
    if (!equipmentId) {
      toast.error('Pick an asset to attach these photos to.');
      return;
    }
    const asset = equipment.find((e) => e.id === equipmentId);
    if (!asset) {
      toast.error('Selected asset not found.');
      return;
    }

    setPhase('uploading');
    cancelRef.current = false;

    // Phase 1: upload all files via UploadFile integration
    const uploadResults = await runPool(
      files,
      async (item) => {
        await waitIfPaused();
        if (cancelRef.current) return null;
        updateFile(item.id, { status: FILE_STATUS.UPLOADING });
        try {
          const exif = await safeReadExif(item.file, readExif);
          const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
          updateFile(item.id, { status: FILE_STATUS.UPLOADED, file_url, exif });
          return { id: item.id, file_url, exif, name: item.name };
        } catch (err) {
          updateFile(item.id, { status: FILE_STATUS.FAILED, error: err.message });
          return null;
        }
      },
      { concurrency: UPLOAD_CONCURRENCY }
    );

    if (cancelRef.current) {
      setPhase('idle');
      return;
    }

    const uploaded = uploadResults.filter((r) => r && r.file_url);
    if (!uploaded.length) {
      toast.error('No files uploaded successfully.');
      setPhase('idle');
      return;
    }

    // Phase 2: bulk-create AssetPhoto records via backend function
    const photoPayloads = uploaded.map((u) => ({
      file_url: u.file_url,
      equipment_id: asset.id,
      equipment_name: asset.name,
      photo_type: photoType,
      captured_date: u.exif?.date || new Date().toISOString().slice(0, 10),
      lat: u.exif?.lat,
      lng: u.exif?.lng,
    }));

    let scanId = null;
    try {
      const res = await base44.functions.invoke('bulkAnalyzePhotos', {
        photos: photoPayloads,
        create_scan: createScan,
        scan_name: scanName || `Bulk upload — ${asset.name} — ${new Date().toLocaleDateString()}`,
        location_id: locationId || asset.location_id,
      });
      scanId = res?.data?.scan_id || null;
    } catch (err) {
      toast.error(`Bulk record creation failed: ${err.message}`);
    }

    // Phase 3: optional AI analysis
    if (runAI && !cancelRef.current) {
      setPhase('analyzing');
      await runPool(
        uploaded,
        async (u) => {
          await waitIfPaused();
          if (cancelRef.current) return;
          updateFile(u.id, { status: FILE_STATUS.ANALYZING });
          try {
            const res = await base44.functions.invoke('aiGradeAssetPhoto', {
              photo_url: u.file_url,
              equipment_id: asset.id,
              equipment_name: asset.name,
            });
            updateFile(u.id, {
              status: FILE_STATUS.ANALYZED,
              findings_count: res?.data?.findings_count || 0,
            });
          } catch (err) {
            updateFile(u.id, { status: FILE_STATUS.ANALYSIS_FAILED, error: err.message });
          }
        },
        { concurrency: ANALYZE_CONCURRENCY }
      );
    }

    setPhase('done');
    toast.success(`Processed ${uploaded.length} photo(s)${runAI ? ' with AI analysis' : ''}.`);
    onCompleted?.({ scan_id: scanId, uploaded: uploaded.length });
  };

  const retryFailed = async () => {
    const failedItems = files.filter((f) => f.status === FILE_STATUS.FAILED);
    if (!failedItems.length) return;
    const asset = equipment.find((e) => e.id === equipmentId);
    if (!asset) return;
    setPhase('uploading');
    await runPool(
      failedItems,
      async (item) => {
        await waitIfPaused();
        updateFile(item.id, { status: FILE_STATUS.UPLOADING });
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
          updateFile(item.id, { status: FILE_STATUS.UPLOADED, file_url });
        } catch (err) {
          updateFile(item.id, { status: FILE_STATUS.FAILED, error: err.message });
        }
      },
      { concurrency: UPLOAD_CONCURRENCY }
    );
    setPhase('done');
  };

  const isProcessing = phase === 'uploading' || phase === 'analyzing';
  const isDone = phase === 'done';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-600" /> Bulk Photo Upload
          </DialogTitle>
          <DialogDescription>
            Upload up to 5,000 photos at once. Each photo is linked to the selected asset and optionally analyzed by AI.
          </DialogDescription>
        </DialogHeader>

        {phase === 'idle' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Asset *</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId}>
                <SelectTrigger><SelectValue placeholder="Pick asset…" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {equipment.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Photo type</Label>
                <Select value={photoType} onValueChange={setPhotoType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PHOTO_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Location (optional)</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger><SelectValue placeholder="Inherit from asset" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Run AI analysis
                </div>
                <p className="text-[11px] text-slate-500">Auto-detect condition issues on each photo.</p>
              </div>
              <Switch checked={runAI} onCheckedChange={setRunAI} />
            </div>

            <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Group as a scan</div>
                <p className="text-[11px] text-slate-500">Create a Digital Twin scan to view all photos together.</p>
              </div>
              <Switch checked={createScan} onCheckedChange={setCreateScan} />
            </div>

            {createScan && (
              <Input
                placeholder="Scan name (optional)"
                value={scanName}
                onChange={(e) => setScanName(e.target.value)}
              />
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {files.length ? `${files.length.toLocaleString()} files selected` : 'Click to select photos'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">JPG, PNG, HEIC — up to 5,000 at once</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFiles}
                className="hidden"
              />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded" />
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button
                onClick={startUpload}
                disabled={!files.length || !equipmentId}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload {files.length.toLocaleString() || ''} photos
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <BulkUploadProgress
            files={files}
            phase={phase}
            paused={paused}
            onPauseToggle={() => setPaused((p) => !p)}
            onRetryFailed={retryFailed}
            onCancel={() => { cancelRef.current = true; setPhase('done'); }}
          />
        )}

        {isDone && (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">All done</h3>
            <p className="text-sm text-slate-500 mt-1">
              {files.filter((f) => [FILE_STATUS.UPLOADED, FILE_STATUS.ANALYZED].includes(f.status)).length.toLocaleString()} photo(s) processed.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-4">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}