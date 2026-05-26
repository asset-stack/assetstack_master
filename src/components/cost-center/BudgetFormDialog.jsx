import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { secureEntity } from '@/lib/secureEntities';

const SCOPE_TYPES = ['organisation', 'location', 'asset_class', 'department', 'work_type'];
const CATEGORIES = ['preventive_maintenance', 'corrective_maintenance', 'capital_replacement', 'labor', 'parts', 'contractors', 'energy', 'operational', 'other'];

export default function BudgetFormDialog({ open, onOpenChange, budget, onSaved }) {
  const [form, setForm] = useState(budget || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(budget || {}); }, [budget]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = { ...form, allocated_amount: Number(form.allocated_amount) || 0 };
    if (form.id) await secureEntity('Budget').update(form.id, data);
    else await secureEntity('Budget').create(data);
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit budget' : 'New budget'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Name</Label>
            <Input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. HVAC maintenance FY2026" />
          </div>
          <div>
            <Label>Fiscal year</Label>
            <Input value={form.fiscal_year || ''} onChange={e => set('fiscal_year', e.target.value)} placeholder="FY2026" />
          </div>
          <div>
            <Label>Scope type</Label>
            <Select value={form.scope_type} onValueChange={v => set('scope_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{SCOPE_TYPES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Scope name</Label>
            <Input value={form.scope_name || ''} onChange={e => set('scope_name', e.target.value)} placeholder="e.g. Library" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Allocated amount ($)</Label>
            <Input type="number" value={form.allocated_amount ?? ''} onChange={e => set('allocated_amount', e.target.value)} />
          </div>
          <div>
            <Label>Period start</Label>
            <Input type="date" value={form.period_start || ''} onChange={e => set('period_start', e.target.value)} />
          </div>
          <div>
            <Label>Period end</Label>
            <Input type="date" value={form.period_end || ''} onChange={e => set('period_end', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.name || !form.fiscal_year || !form.allocated_amount}>
            {saving ? 'Saving…' : 'Save budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}