import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, Cpu, Image as ImageIcon, Box } from 'lucide-react';

export default function ScanUploadDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelFile, setModelFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;
    setUploading(true);

    let fileUrl = null;
    let previewUrl = null;
    let modelType = 'gltf';
    let fileSizeMb = 0;

    if (modelFile) {
      const res = await base44.integrations.Core.UploadFile({ file: modelFile });
      fileUrl = res.file_url;
      const ext = modelFile.name.split('.').pop().toLowerCase();
      modelType = ['obj', 'gltf', 'glb'].includes(ext) ? ext : 'gltf';
      fileSizeMb = +(modelFile.size / (1024 * 1024)).toFixed(2);
    }
    if (previewFile) {
      const res = await base44.integrations.Core.UploadFile({ file: previewFile });
      previewUrl = res.file_url;
    }

    await base44.entities.DigitalTwinModel.create({
      name,
      description,
      file_url: fileUrl,
      preview_image_url: previewUrl,
      model_type: modelType,
      file_size_mb: fileSizeMb,
      scan_date: new Date().toISOString().split('T')[0],
      status: 'ready',
    });

    setUploading(false);
    setName('');
    setDescription('');
    setModelFile(null);
    setPreviewFile(null);
    onCreated && onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload New Scan
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Scan Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ground Floor Scan Q2 2026" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5" /> 3D Model File (OBJ / GLTF / GLB)</Label>
            <Input
              type="file"
              accept=".obj,.gltf,.glb"
              onChange={(e) => setModelFile(e.target.files?.[0])}
              className="cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              For demo, leave empty and a placeholder scan will be shown.
            </p>
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Preview Image (for AI condition analysis)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPreviewFile(e.target.files?.[0])}
              className="cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Upload a photo of the area — the AI will analyze it for defects.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={uploading || !name} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</> : <><Cpu className="w-4 h-4 mr-2" /> Create Scan</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}