import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Upload, Loader2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const ANOMALY_TYPES = [
  'scratch', 'dent', 'crack', 'corrosion', 'stain',
  'broken_part', 'missing_part', 'wear', 'water_damage',
  'graffiti', 'misalignment', 'other',
];
const SEVERITIES = ['minor', 'moderate', 'major', 'critical'];
const MAX_IMAGE_MB = 25;
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const severityToScore = { minor: 2, moderate: 3, major: 4, critical: 5 };

export default function AddManualFindingDialog({ open, onClose, scan, frames = [], equipment = [], onCreated }) {
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'frame' | 'preview'
  const [selectedFrameId, setSelectedFrameId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadObjectUrl, setUploadObjectUrl] = useState(null);
  const [equipmentId, setEquipmentId] = useState('');
  const [anomalyType, setAnomalyType] = useState('other');
  const [severity, setSeverity] = useState('minor');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Manage object URL lifecycle for uploaded preview
  useEffect(() => {
    if (!uploadFile) {
      if (uploadObjectUrl) URL.revokeObjectURL(uploadObjectUrl);
      setUploadObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(uploadFile);
    setUploadObjectUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFile]);

  const reset = () => {
    setImageSource(frames.length > 0 ? 'frame' : (scan?.preview_image_url ? 'preview' : 'upload'));
    setSelectedFrameId(frames[0]?.id || '');
    setUploadFile(null);
    setEquipmentId('');
    setAnomalyType('other');
    setSeverity('minor');
    setDescription('');
    setNotes('');
    setError('');
    setSaving(false);
  };

  // Initialise sensible defaults each time the dialog opens
  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scan?.id, frames.length]);

  const handleFile = (f) => {
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) {
      setError('Image must be JPEG, PNG, or WebP.');
      return;
    }
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_IMAGE_MB) {
      setError(`Image is ${mb.toFixed(1)}MB — max ${MAX_IMAGE_MB}MB.`);
      return;
    }
    setError('');
    setUploadFile(f);
  };

  const handleSubmit = async () => {
    if (!scan?.id) {
      setError('No scan selected.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      // 1. Resolve the image URL based on source
      let imageUrl = null;
      if (imageSource === 'upload') {
        if (!uploadFile) {
          setError('Please choose an image to upload.');
          setSaving(false);
          return;
        }
        const res = await base44.integrations.Core.UploadFile({ file: uploadFile });
        imageUrl = res.file_url;
      } else if (imageSource === 'frame') {
        const frame = frames.find((f) => f.id === selectedFrameId);
        imageUrl = frame?.image_url || null;
        if (!imageUrl) {
          setError('Selected frame has no image.');
          setSaving(false);
          return;
        }
      } else {
        imageUrl = scan.preview_image_url || null;
        if (!imageUrl) {
          setError('This scan has no preview image — upload a photo instead.');
          setSaving(false);
          return;
        }
      }

      // 2. Resolve the linked equipment (optional)
      const eq = equipment.find((e) => e.id === equipmentId);

      // 3. Get current user for reviewer attribution
      const user = await base44.auth.me();
      const reviewer = user?.full_name || user?.email || 'manual';

      // 4. Create the ConditionReport — pre-verified, no AI confidence
      const report = await secureEntity('ConditionReport').create({
        digital_twin_model_id: scan.id,
        digital_twin_model_name: scan.name,
        equipment_id: eq?.id || null,
        equipment_name: eq?.name || '',
        image_url: imageUrl,
        anomaly_type: anomalyType,
        severity,
        condition_score: severityToScore[severity] || 2,
        ai_description: description.trim() || '[Manually logged finding]',
        ai_model_version: 'manual',
        // No bounding_box — reviewers can add one later via Fix AI
        review_status: 'approved',
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes.trim() || 'Manual finding logged by inspector',
        used_for_training: false,
      });

      toast?.success?.(`Manual finding logged${eq ? ` on ${eq.name}` : ''}`);
      onCreated && onCreated(report);
      onClose && onClose();
    } catch (err) {
      console.error('Manual finding save failed:', err);
      const msg = err?.message || 'Could not save finding.';
      setError(msg);
      toast?.error?.(msg);
    } finally {
      setSaving(false);
    }
  };

  const previewUrl =
    imageSource === 'upload' ? uploadObjectUrl :
    imageSource === 'frame' ? frames.find((f) => f.id === selectedFrameId)?.image_url :
    scan?.preview_image_url;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            Log Manual Finding
          </DialogTitle>
          <DialogDescription>
            Record a defect you've spotted yourself. It goes straight in as verified and feeds the AI training set.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image source */}
          <div>
            <Label className="mb-1.5 block">Image Source</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`text-xs rounded-lg border p-2 transition-colors ${
                  imageSource === 'upload' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-4 h-4 mx-auto mb-0.5" />
                Upload photo
              </button>
              <button
                type="button"
                disabled={frames.length === 0}
                onClick={() => setImageSource('frame')}
                className={`text-xs rounded-lg border p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  imageSource === 'frame' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-4 h-4 mx-auto mb-0.5" />
                Pick frame ({frames.length})
              </button>
              <button
                type="button"
                disabled={!scan?.preview_image_url}
                onClick={() => setImageSource('preview')}
                className={`text-xs rounded-lg border p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  imageSource === 'preview' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-4 h-4 mx-auto mb-0.5" />
                Scan preview
              </button>
            </div>
          </div>

          {imageSource === 'upload' && (
            <div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={saving}
                className="cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">Max {MAX_IMAGE_MB}MB · JPEG / PNG / WebP</p>
            </div>
          )}

          {imageSource === 'frame' && (
            <Select value={selectedFrameId || undefined} onValueChange={setSelectedFrameId}>
              <SelectTrigger><SelectValue placeholder="Pick frame…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {frames.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-xs">
                    {f.angle_label || `Frame ${f.frame_index}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img src={previewUrl} alt="Finding preview" className="w-full max-h-64 object-contain" />
              {imageSource === 'upload' && !saving && (
                <button
                  type="button"
                  onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 w-7 h-7 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Asset link */}
          <div>
            <Label className="mb-1.5 block">Asset (optional)</Label>
            <Select value={equipmentId || undefined} onValueChange={setEquipmentId}>
              <SelectTrigger><SelectValue placeholder="Link this finding to an asset…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {equipment.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="text-xs">{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Anomaly Type</Label>
              <Select value={anomalyType} onValueChange={setAnomalyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ANOMALY_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description + notes */}
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you see? e.g. ‘Hairline crack along the support beam, ~30cm.’"
              disabled={saving}
              className="min-h-[60px]"
            />
          </div>

          <div>
            <Label className="mb-1.5 block">Inspector Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes, follow-up actions, references…"
              disabled={saving}
              className="min-h-[50px]"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2">
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white shrink-0">Verified</Badge>
            <span>
              Manual findings are saved as <strong>verified</strong> straight away. They're the highest-quality
              examples for retraining — they'll be picked up next time you run model training.
            </span>
          </div>

          {error && (
            <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2 text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onClose && onClose()} className="flex-1" disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !scan?.id}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
              ) : (
                <><ClipboardCheck className="w-4 h-4 mr-2" /> Log Finding</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}