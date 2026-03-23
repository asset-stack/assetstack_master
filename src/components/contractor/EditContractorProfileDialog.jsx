import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, Upload, User } from 'lucide-react';

export default function EditContractorProfileDialog({ open, onOpenChange, technician }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (technician) {
      setForm({
        name: technician.name || '',
        phone: technician.phone || '',
        company_name: technician.company_name || '',
        tax_id: technician.tax_id || '',
        bio: technician.bio || '',
        skills: technician.skills?.join(', ') || '',
        equipment_specializations: technician.equipment_specializations?.join(', ') || '',
        hourly_rate: technician.hourly_rate || '',
        certification_level: technician.certification_level || 'intermediate',
        profile_image_url: technician.profile_image_url || '',
      });
    }
  }, [technician, open]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Technician.update(technician.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTechnician'] });
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      onOpenChange(false);
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, profile_image_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      equipment_specializations: form.equipment_specializations ? form.equipment_specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : 0,
    };
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {form.profile_image_url ? (
                <img src={form.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-image" />
              <label htmlFor="profile-image">
                <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                  <span>
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                    Upload Photo
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div>
              <Label>Tax ID / ABN</Label>
              <Input value={form.tax_id} onChange={e => setForm({ ...form, tax_id: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Certification Level</Label>
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
              <Label>Hourly Rate ($)</Label>
              <Input type="number" min="0" step="0.01" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Skills (comma-separated)</Label>
            <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="HVAC, Electrical, Plumbing" />
          </div>

          <div>
            <Label>Equipment Specializations (comma-separated)</Label>
            <Input value={form.equipment_specializations} onChange={e => setForm({ ...form, equipment_specializations: e.target.value })} placeholder="Pump, Compressor, Generator" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}