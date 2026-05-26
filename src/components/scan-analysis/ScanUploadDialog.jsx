import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, Cpu, Image as ImageIcon, Box, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_MODEL_MB = 200;
const MAX_IMAGE_MB = 25;
const MODEL_EXTS = ['obj', 'gltf', 'glb'];
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ScanUploadDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelFile, setModelFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState('idle');
  const [error, setError] = useState('');
  const previewInputRef = useRef(null);
  const modelInputRef = useRef(null);

  useEffect(() => {
    if (!previewFile) {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(previewFile);
    setPreviewObjectUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewFile]);

  const reset = () => {
    setName('');
    setDescription('');
    setModelFile(null);
    setPreviewFile(null);
    setUploading(false);
    setStage('idle');
    setError('');
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleModelFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!MODEL_EXTS.includes(ext)) {
      setError(`3D model must be one of: ${MODEL_EXTS.join(', ').toUpperCase()}.`);
      return;
    }
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_MODEL_MB) {
      setError(`Model file is ${mb.toFixed(1)}MB — max ${MAX_MODEL_MB}MB.`);
      return;
    }
    setError('');
    setModelFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const handlePreviewFile = (f) => {
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) {
      setError('Preview must be a JPEG, PNG, or WebP image.');
      return;
    }
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_IMAGE_MB) {
      setError(`Image is ${mb.toFixed(1)}MB — max ${MAX_IMAGE_MB}MB.`);
      return;
    }
    setError('');
    setPreviewFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Scan name is required.');
      return;
    }
    if (!modelFile && !previewFile) {
      setError('Upload the full digital twin model file or a preview image.');
      return;
    }
    setError('');
    setUploading(true);

    try {
      let fileUrl = null;
      let previewUrl = null;
      let modelType = null;
      let fileSizeMb = 0;

      if (modelFile) {
        setStage('model');
        const res = await base44.integrations.Core.UploadFile({ file: modelFile });
        fileUrl = res.file_url;
        const ext = modelFile.name.split('.').pop().toLowerCase();
        modelType = MODEL_EXTS.includes(ext) ? ext : 'gltf';
        fileSizeMb = +(modelFile.size / (1024 * 1024)).toFixed(2);
      }

      if (previewFile) {
        setStage('preview');
        const res = await base44.integrations.Core.UploadFile({ file: previewFile });
        previewUrl = res.file_url;
      }

      setStage('creating');
      const finalModelType = modelType || 'photogrammetry';

      const scan = await base44.entities.DigitalTwinModel.create({
        name: name.trim(),
        description: description.trim(),
        file_url: fileUrl,
        preview_image_url: previewUrl,
        model_type: finalModelType,
        file_size_mb: fileSizeMb,
        scan_date: new Date().toISOString().split('T')[0],
        status: 'ready',
      });

      toast?.success?.('Scan created. Click "Re-run AI" to analyze.');
      onCreated && onCreated(scan?.id);
      reset();
      onClose();
    } catch (err) {
      console.error('Scan upload failed:', err);
      const msg = err?.message || 'Upload failed. Please try again.';
      setError(msg);
      toast?.error?.(msg);
      setUploading(false);
      setStage('idle');
    }
  };

  const stageLabel = {
    model: 'Uploading 3D model…',
    preview: 'Uploading preview image…',
    creating: 'Creating scan record…',
  }[stage];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload New Scan
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Scan Name <span className="text-red-500">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ground Floor Scan Q2 2026"
              disabled={uploading}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              placeholder="Where was this scan taken? What should the AI focus on?"
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" /> 3D Model File (OBJ / GLTF / GLB) — optional
            </Label>
            <Input
              ref={modelInputRef}
              type="file"
              accept=".obj,.gltf,.glb"
              onChange={(e) => handleModelFile(e.target.files?.[0])}
              disabled={uploading}
              className="cursor-pointer"
            />
            {modelFile && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="flex-1 truncate">{modelFile.name} • {(modelFile.size / (1024 * 1024)).toFixed(1)}MB</span>
                <button
                  type="button"
                  onClick={() => { setModelFile(null); if (modelInputRef.current) modelInputRef.current.value = ''; }}
                  disabled={uploading}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Max {MAX_MODEL_MB}MB. Leave empty for image-only analysis.
            </p>
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Preview Image (optional fallback for AI image analysis)
            </Label>
            <Input
              ref={previewInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => handlePreviewFile(e.target.files?.[0])}
              disabled={uploading}
              className="cursor-pointer"
            />
            {previewObjectUrl && (
              <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img src={previewObjectUrl} alt="Preview" className="w-full max-h-48 object-contain" />
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => { setPreviewFile(null); if (previewInputRef.current) previewInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 w-7 h-7 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                  {previewFile.name} • {(previewFile.size / (1024 * 1024)).toFixed(1)}MB
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Max {MAX_IMAGE_MB}MB. Use this only if you also have a clear preview image; the full digital twin file can now be uploaded on its own.
            </p>
          </div>

          {uploading && stageLabel && (
            <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-indigo-900">{stageLabel}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2 text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || !name.trim() || (!modelFile && !previewFile)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>
              ) : (
                <><Cpu className="w-4 h-4 mr-2" /> Create Scan</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}