import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Save } from 'lucide-react';

export default function EditProfileDialog({ open, onClose, technician, onSaved }) {
  const [form, setForm] = useState({
    name: technician.name || '',
    email: technician.email || '',
    phone: technician.phone || '',
    bio: technician.bio || '',
    company_name: technician.company_name || '',
    worker_type: technician.worker_type || 'employee',
    certification_level: technician.certification_level || 'intermediate',
    availability_status: technician.availability_status || 'available',
    shift: technician.shift || 'day',
    skills: (technician.skills || []).join(', '),
    hourly_rate: technician.hourly_rate || '',
    max_weekly_hours: technician.max_weekly_hours || 40,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updateData = {
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined,
      max_weekly_hours: Number(form.max_weekly_hours),
    };
    await base44.entities.Technician.update(technician.id, updateData);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Worker Type</Label>
              <Select value={form.worker_type} onValueChange={v => setForm({ ...form, worker_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          {form.worker_type === 'contractor' && (
            <div>
              <Label>Company Name</Label>
              <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            </div>
          )}

          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Short professional bio..." rows={2} />
          </div>

          <div>
            <Label>Skills (comma separated)</Label>
            <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Electrical, HVAC, Welding" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Level</Label>
              <Select value={form.certification_level} onValueChange={v => setForm({ ...form, certification_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shift</Label>
              <Select value={form.shift} onValueChange={v => setForm({ ...form, shift: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="rotating">Rotating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Availability</Label>
              <Select value={form.availability_status} onValueChange={v => setForm({ ...form, availability_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hourly Rate ($)</Label>
              <Input type="number" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
            </div>
            <div>
              <Label>Max Weekly Hours</Label>
              <Input type="number" value={form.max_weekly_hours} onChange={e => setForm({ ...form, max_weekly_hours: e.target.value })} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}