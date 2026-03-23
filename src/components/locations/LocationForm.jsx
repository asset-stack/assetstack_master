import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TYPES = ['building', 'facility', 'park', 'road', 'bridge', 'depot', 'station', 'other'];

export default function LocationForm({ open, onOpenChange, location, onSaved }) {
  const isEditing = !!location?.id;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', code: '', address: '', city: '', region: '',
    location_type: 'building', client_name: '', contact_name: '',
    contact_phone: '', contact_email: '', notes: '', scan_date: '',
  });

  useEffect(() => {
    if (location) {
      setForm({
        name: location.name || '', code: location.code || '',
        address: location.address || '', city: location.city || '',
        region: location.region || '', location_type: location.location_type || 'building',
        client_name: location.client_name || '', contact_name: location.contact_name || '',
        contact_phone: location.contact_phone || '', contact_email: location.contact_email || '',
        notes: location.notes || '', scan_date: location.scan_date || '',
      });
    } else {
      setForm({ name: '', code: '', address: '', city: '', region: '', location_type: 'building', client_name: '', contact_name: '', contact_phone: '', contact_email: '', notes: '', scan_date: '' });
    }
  }, [location, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form };
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });

    if (isEditing) {
      await base44.entities.Location.update(location.id, data);
    } else {
      await base44.entities.Location.create(data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            {isEditing ? 'Edit Location' : 'Add Location'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Town Hall" />
            </div>
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. BTH" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.location_type} onValueChange={v => setForm({ ...form, location_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Client / Council</Label>
              <Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} placeholder="e.g. Bunbury Council" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City/suburb" />
            </div>
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="State/region" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Name</Label>
              <Input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Last Scan Date</Label>
              <Input type="date" value={form.scan_date} onChange={e => setForm({ ...form, scan_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}