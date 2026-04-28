import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';

/**
 * Lets the user attach extra real photos (phone shots) to an existing scan.
 * Each photo becomes a ScanFrame and is auto-analyzed by the AI.
 */
export default function AddPhotoFrames({ scan, existingFramesCount = 0, onAdded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const frame = await base44.entities.ScanFrame.create({
        digital_twin_model_id: scan.id,
        digital_twin_model_name: scan.name,
        frame_index: existingFramesCount + i,
        angle_label: `Photo ${existingFramesCount + i + 1}`,
        image_url: file_url,
        analysis_status: 'analyzing',
      });

      try {
        const res = await base44.functions.invoke('analyzeScanCondition', {
          image_url: file_url,
          digital_twin_model_id: scan.id,
          digital_twin_model_name: scan.name,
          equipment_name: `${scan.name} — ${frame.angle_label}`,
        });
        await base44.entities.ScanFrame.update(frame.id, {
          analysis_status: 'completed',
          findings_count: res?.data?.findings_count || 0,
        });
      } catch (_e) {
        await base44.entities.ScanFrame.update(frame.id, { analysis_status: 'failed' });
      }
    }

    setBusy(false);
    setProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = '';
    onAdded && onAdded();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing {progress.current}/{progress.total}…</>
        ) : (
          <><Camera className="w-4 h-4 mr-2" /> Add real photos</>
        )}
      </Button>
    </div>
  );
}