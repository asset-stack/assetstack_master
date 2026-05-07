import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['bearing', 'seal', 'filter', 'belt', 'motor', 'sensor', 'valve', 'electrical', 'hydraulic', 'pneumatic', 'structural', 'consumable', 'other'];
const CRITICALITY = ['low', 'medium', 'high', 'critical'];

export default function SparePartFormDialog({ open, onOpenChange, part, onSaved }) {
  const [form, setForm] = useState(part || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(part || {}); }, [part]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (form.id) await base44.entities.SparePart.update(form.id, form);
    else await base44.entities.SparePart.create(form);
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit part' : 'Add new part'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Part number</Label>
            <Input value={form.part_number || ''} onChange={e => set('part_number', e.target.value)} />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={form.name || ''} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Criticality</Label>
            <Select value={form.criticality} onValueChange={v => set('criticality', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{CRITICALITY.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantity in stock</Label>
            <Input type="number" value={form.quantity_in_stock ?? ''} onChange={e => set('quantity_in_stock', Number(e.target.value))} />
          </div>
          <div>
            <Label>Minimum stock level</Label>
            <Input type="number" value={form.minimum_stock_level ?? ''} onChange={e => set('minimum_stock_level', Number(e.target.value))} />
          </div>
          <div>
            <Label>Reorder quantity</Label>
            <Input type="number" value={form.reorder_quantity ?? ''} onChange={e => set('reorder_quantity', Number(e.target.value))} />
          </div>
          <div>
            <Label>Unit cost ($)</Label>
            <Input type="number" step="0.01" value={form.unit_cost ?? ''} onChange={e => set('unit_cost', Number(e.target.value))} />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input value={form.supplier || ''} onChange={e => set('supplier', e.target.value)} />
          </div>
          <div>
            <Label>Lead time (days)</Label>
            <Input type="number" value={form.lead_time_days ?? ''} onChange={e => set('lead_time_days', Number(e.target.value))} />
          </div>
          <div>
            <Label>Storage location</Label>
            <Input value={form.location || ''} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description || ''} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.part_number || !form.name || !form.category}>
            {saving ? 'Saving…' : 'Save part'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}