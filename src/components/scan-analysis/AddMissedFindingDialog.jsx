import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import BboxDrawCanvas from './BboxDrawCanvas';

const ANOMALY_TYPES = [
  'scratch', 'dent', 'crack', 'corrosion', 'stain',
  'broken_part', 'missing_part', 'wear', 'water_damage',
  'graffiti', 'misalignment', 'other',
];
const SEVERITIES = ['minor', 'moderate', 'major', 'critical'];
const severityToScore = { minor: 2, moderate: 3, major: 4, critical: 5 };

// Add a finding the AI missed — drag a bbox on the current image, classify it, save as verified.
// This is the strongest negative-sample signal we can give the retraining loop.
export default function AddMissedFindingDialog({ open, onClose, scan, imageUrl, equipment = [], onCreated }) {
  const [bbox, setBbox] = useState(null);
  const [equipmentId, setEquipmentId] = useState('');
  const [anomalyType, setAnomalyType] = useState('other');
  const [severity, setSeverity] = useState('moderate');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setBbox(null);
      setEquipmentId('');
      setAnomalyType('other');
      setSeverity('moderate');
      setDescription('');
      setError('');
      setSaving(false);
    }
  }, [open, imageUrl]);

  const handleSubmit = async () => {
    if (!scan?.id) { setError('No scan selected.'); return; }
    if (!imageUrl) { setError('No image to annotate.'); return; }
    if (!bbox) { setError('Please drag a box around the defect first.'); return; }

    setError('');
    setSaving(true);
    try {
      const eq = equipment.find((e) => e.id === equipmentId);
      const user = await base44.auth.me();
      const reviewer = user?.full_name || user?.email || 'manual';

      const report = await base44.entities.ConditionReport.create({
        digital_twin_model_id: scan.id,
        digital_twin_model_name: scan.name,
        equipment_id: eq?.id || null,
        equipment_name: eq?.name || '',
        image_url: imageUrl,
        anomaly_type: anomalyType,
        severity,
        condition_score: severityToScore[severity] || 3,
        bounding_box: bbox,
        ai_description: description.trim() || '[Manually added — AI missed this]',
        ai_model_version: 'manual',
        review_status: 'approved',
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: 'AI missed — added by reviewer',
        used_for_training: false,
      });

      toast?.success?.('Missed finding logged — will improve next AI run');
      onCreated && onCreated(report);
      onClose && onClose();
    } catch (err) {
      console.error('Missed finding save failed:', err);
      const msg = err?.message || 'Could not save.';
      setError(msg);
      toast?.error?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Add a finding the AI missed
          </DialogTitle>
          <DialogDescription>
            Drag a box around the defect on the image. This is the highest-value training signal you can give the model.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <BboxDrawCanvas
            imageUrl={imageUrl}
            initialBbox={null}
            color="border-emerald-500"
            onChange={setBbox}
          />

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

          <div>
            <Label className="mb-1.5 block">Asset (optional)</Label>
            <Select value={equipmentId || undefined} onValueChange={setEquipmentId}>
              <SelectTrigger><SelectValue placeholder="Link to an asset…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {equipment.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="text-xs">{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this defect? e.g. ‘Rust on the lower hinge bolt.’"
              disabled={saving}
              className="min-h-[60px]"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2">
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white shrink-0">False negative</Badge>
            <span>
              This gets logged as a <strong>verified</strong> finding the AI missed — the strongest signal the retraining loop can use.
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
              disabled={saving || !bbox}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
              ) : (
                <><Target className="w-4 h-4 mr-2" /> Save missed finding</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}