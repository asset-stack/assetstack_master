import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { secureEntity } from '@/lib/secureEntities';

const PRIORITY = ['low', 'medium', 'high', 'urgent'];
const CONSEQUENCE = ['minor', 'moderate', 'major', 'catastrophic'];
const LIKELIHOOD = ['unlikely', 'possible', 'likely', 'almost_certain'];
const STATUS = ['proposed', 'approved', 'deferred', 'funded', 'in_progress', 'completed', 'cancelled'];
const FUNDING = ['operational', 'capital', 'grant', 'external', 'tbd'];

export default function CapitalPlanFormDialog({ open, onOpenChange, item, onSaved }) {
  const [form, setForm] = useState(item || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(item || {}); }, [item]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = {
      ...form,
      replacement_year: Number(form.replacement_year) || new Date().getFullYear() + 1,
      replacement_cost: Number(form.replacement_cost) || 0,
    };
    if (form.id) await secureEntity('CapitalPlanItem').update(form.id, data);
    else await secureEntity('CapitalPlanItem').create(data);
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit plan item' : 'Add to capital plan'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Equipment / asset name</Label>
            <Input value={form.equipment_name || ''} onChange={e => set('equipment_name', e.target.value)} />
          </div>
          <div>
            <Label>Location name</Label>
            <Input value={form.location_name || ''} onChange={e => set('location_name', e.target.value)} />
          </div>
          <div>
            <Label>Asset type</Label>
            <Input value={form.asset_type || ''} onChange={e => set('asset_type', e.target.value)} />
          </div>
          <div>
            <Label>Replacement year</Label>
            <Input type="number" value={form.replacement_year ?? ''} onChange={e => set('replacement_year', e.target.value)} placeholder="2027" />
          </div>
          <div>
            <Label>Replacement cost ($)</Label>
            <Input type="number" value={form.replacement_cost ?? ''} onChange={e => set('replacement_cost', e.target.value)} />
          </div>
          <div>
            <Label>Condition score (0-100)</Label>
            <Input type="number" min="0" max="100" value={form.condition_score ?? ''} onChange={e => set('condition_score', Number(e.target.value))} />
          </div>
          <div>
            <Label>Current age (years)</Label>
            <Input type="number" value={form.current_age_years ?? ''} onChange={e => set('current_age_years', Number(e.target.value))} />
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={v => set('priority', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{PRIORITY.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Funding source</Label>
            <Select value={form.funding_source} onValueChange={v => set('funding_source', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{FUNDING.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Likelihood of failure</Label>
            <Select value={form.likelihood_of_failure} onValueChange={v => set('likelihood_of_failure', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{LIKELIHOOD.map(l => <SelectItem key={l} value={l}>{l.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Consequence of failure</Label>
            <Select value={form.consequence_of_failure} onValueChange={v => set('consequence_of_failure', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{CONSEQUENCE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Rationale</Label>
            <Input value={form.rationale || ''} onChange={e => set('rationale', e.target.value)} placeholder="Why this asset needs replacing" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.equipment_name || !form.replacement_year || !form.replacement_cost}>
            {saving ? 'Saving…' : 'Save plan item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}