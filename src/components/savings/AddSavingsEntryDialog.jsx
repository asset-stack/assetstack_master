import React, { useState } from 'react';
import { secureEntity } from '@/lib/secureEntities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';

export default function AddSavingsEntryDialog({ open, onClose, onCreated, equipment = [] }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    equipment_id: '',
    trigger_source: 'ai_prediction',
    predicted_failure_cost: '',
    intervention_cost: '',
    verification_notes: '',
  });

  const reset = () => setForm({
    title: '', equipment_id: '', trigger_source: 'ai_prediction',
    predicted_failure_cost: '', intervention_cost: '', verification_notes: '',
  });

  const submit = async () => {
    if (!form.title || !form.predicted_failure_cost || !form.intervention_cost) return;
    setSaving(true);
    const eq = equipment.find((e) => e.id === form.equipment_id);
    await secureEntity('SavingsLedgerEntry').create({
      title: form.title,
      equipment_id: form.equipment_id || undefined,
      equipment_name: eq?.name,
      trigger_source: form.trigger_source,
      predicted_failure_cost: Number(form.predicted_failure_cost),
      intervention_cost: Number(form.intervention_cost),
      verification_notes: form.verification_notes,
      status: 'projected',
      currency: 'USD',
    });
    setSaving(false);
    reset();
    onCreated?.();
    onClose();
  };

  const projected = (Number(form.predicted_failure_cost) || 0) - (Number(form.intervention_cost) || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" /> New Savings Entry
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Bearing replacement on Pump #3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Asset</Label>
              <Select value={form.equipment_id} onValueChange={(v) => setForm({ ...form, equipment_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {equipment.slice(0, 100).map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Trigger Source</Label>
              <Select value={form.trigger_source} onValueChange={(v) => setForm({ ...form, trigger_source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_prediction">AI prediction</SelectItem>
                  <SelectItem value="scan_anomaly">Scan anomaly</SelectItem>
                  <SelectItem value="sensor_alert">Sensor alert</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Predicted Failure Cost (USD) *</Label>
              <Input type="number" value={form.predicted_failure_cost}
                onChange={(e) => setForm({ ...form, predicted_failure_cost: e.target.value })}
                placeholder="50000" />
            </div>
            <div>
              <Label className="text-xs">Intervention Cost (USD) *</Label>
              <Input type="number" value={form.intervention_cost}
                onChange={(e) => setForm({ ...form, intervention_cost: e.target.value })}
                placeholder="3500" />
            </div>
          </div>
          {(form.predicted_failure_cost || form.intervention_cost) && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
              <div className="text-[10px] text-emerald-600 uppercase tracking-wider">Projected Savings</div>
              <div className="text-2xl font-bold text-emerald-700">
                ${projected.toLocaleString()}
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea value={form.verification_notes}
              onChange={(e) => setForm({ ...form, verification_notes: e.target.value })}
              placeholder="Context, evidence, expected verification path…" className="min-h-[70px]" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={saving || !form.title || !form.predicted_failure_cost || !form.intervention_cost}
              className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Add to Ledger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}