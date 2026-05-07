import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['safety', 'fire', 'electrical', 'lift', 'pressure_vessel', 'hvac', 'environmental', 'structural', 'data', 'financial', 'other'];
const FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'biennial', 'as_needed'];

export default function RequirementFormDialog({ open, onOpenChange, requirement, onSaved }) {
  const [form, setForm] = useState(requirement || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(requirement || {}); }, [requirement]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (form.id) await base44.entities.ComplianceRequirement.update(form.id, form);
    else await base44.entities.ComplianceRequirement.create(form);
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit requirement' : 'Add compliance requirement'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Name</Label>
            <Input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Annual lift inspection" />
          </div>
          <div>
            <Label>Regulation</Label>
            <Input value={form.regulation || ''} onChange={e => set('regulation', e.target.value)} placeholder="AS 1735.1" />
          </div>
          <div>
            <Label>Reference URL</Label>
            <Input value={form.regulation_url || ''} onChange={e => set('regulation_url', e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Frequency</Label>
            <Select value={form.frequency} onValueChange={v => set('frequency', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Next due date</Label>
            <Input type="date" value={form.next_due_date || ''} onChange={e => set('next_due_date', e.target.value)} />
          </div>
          <div>
            <Label>Last completed</Label>
            <Input type="date" value={form.last_completed_date || ''} onChange={e => set('last_completed_date', e.target.value)} />
          </div>
          <div>
            <Label>Lead time (days before due)</Label>
            <Input type="number" value={form.lead_time_days ?? ''} onChange={e => set('lead_time_days', Number(e.target.value))} />
          </div>
          <div className="col-span-2">
            <Label>Scope description</Label>
            <Input value={form.scope_description || ''} onChange={e => set('scope_description', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.name || !form.category || !form.frequency}>
            {saving ? 'Saving…' : 'Save requirement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}