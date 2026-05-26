import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { secureEntity } from '@/lib/secureEntities';

const CATEGORIES = ['parts', 'oem', 'service', 'consumables', 'calibration', 'consultancy', 'other'];
const PAYMENT_TERMS = ['net_7', 'net_14', 'net_30', 'net_60', 'prepaid', 'on_delivery'];

export default function SupplierFormDialog({ open, onOpenChange, supplier, onSaved }) {
  const [form, setForm] = useState(supplier || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(supplier || {}); }, [supplier]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    if (form.id) await secureEntity('Supplier').update(form.id, form);
    else await secureEntity('Supplier').create(form);
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit supplier' : 'New supplier'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Company name</Label>
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
            <Label>Payment terms</Label>
            <Select value={form.payment_terms} onValueChange={v => set('payment_terms', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{PAYMENT_TERMS.map(p => <SelectItem key={p} value={p}>{p.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Contact name</Label>
            <Input value={form.contact_name || ''} onChange={e => set('contact_name', e.target.value)} />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input value={form.contact_email || ''} onChange={e => set('contact_email', e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.website || ''} onChange={e => set('website', e.target.value)} />
          </div>
          <div>
            <Label>Lead time (days)</Label>
            <Input type="number" value={form.lead_time_days ?? ''} onChange={e => set('lead_time_days', Number(e.target.value))} />
          </div>
          <div>
            <Label>Rating (0–5)</Label>
            <Input type="number" step="0.1" min="0" max="5" value={form.rating ?? ''} onChange={e => set('rating', Number(e.target.value))} />
          </div>
          <div>
            <Label>On-time delivery (%)</Label>
            <Input type="number" min="0" max="100" value={form.on_time_delivery_rate ?? ''} onChange={e => set('on_time_delivery_rate', Number(e.target.value))} />
          </div>
          <div>
            <Label>SLA response (hrs)</Label>
            <Input type="number" value={form.sla_response_hours ?? ''} onChange={e => set('sla_response_hours', Number(e.target.value))} />
          </div>
          <div className="col-span-2 flex items-center justify-between border-t border-slate-100 pt-3">
            <Label className="cursor-pointer">Mark as preferred supplier</Label>
            <Switch checked={form.preferred || false} onCheckedChange={v => set('preferred', v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.name}>
            {saving ? 'Saving…' : 'Save supplier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}