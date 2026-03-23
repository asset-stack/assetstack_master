import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, Search, UserPlus, Mail, Shield, Edit2, Trash2, 
  CheckCircle2, Clock, XCircle, Loader2
} from 'lucide-react';

const LEVEL_COLORS = {
  junior: 'bg-slate-100 text-slate-700',
  intermediate: 'bg-blue-100 text-blue-700',
  senior: 'bg-violet-100 text-violet-700',
  expert: 'bg-amber-100 text-amber-700',
  master: 'bg-emerald-100 text-emerald-700',
};

const STATUS_COLORS = {
  available: 'bg-emerald-100 text-emerald-700',
  busy: 'bg-amber-100 text-amber-700',
  on_leave: 'bg-slate-100 text-slate-600',
  unavailable: 'bg-red-100 text-red-700',
};

export default function TeamSettings() {
  const [search, setSearch] = useState('');
  const [editingTech, setEditingTech] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 200),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateTechMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Technician.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['technicians']);
      setEditingTech(null);
    },
  });

  const deleteTechMutation = useMutation({
    mutationFn: (id) => base44.entities.Technician.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['technicians']),
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole);
    setInviting(false);
    setInviteSuccess(true);
    setInviteEmail('');
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const filtered = technicians.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Invite New User */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-500" />
          Invite New Team Member
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Email address..."
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
          </div>
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={!inviteEmail || inviting} className="bg-indigo-600 hover:bg-indigo-700">
            {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Send Invite
          </Button>
        </div>
        {inviteSuccess && (
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Invitation sent successfully!
          </p>
        )}
      </div>

      {/* App Users */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          App Users ({users.length})
        </h3>
        <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{user.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <Badge className={user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}>
                {user.role || 'user'}
              </Badge>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500">No users yet</div>
          )}
        </div>
      </div>

      {/* Technician Profiles */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          Technician Profiles ({technicians.length})
        </h3>
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search technicians..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="space-y-2">
          {filtered.map(tech => (
            <div key={tech.id} className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {tech.profile_image_url ? (
                    <img src={tech.profile_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{tech.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tech.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={LEVEL_COLORS[tech.certification_level] || LEVEL_COLORS.intermediate} variant="secondary">
                      {tech.certification_level || 'intermediate'}
                    </Badge>
                    <Badge className={STATUS_COLORS[tech.availability_status] || STATUS_COLORS.available} variant="secondary">
                      {(tech.availability_status || 'available').replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400 capitalize">{tech.worker_type || 'employee'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setEditingTech(tech)} className="h-9 w-9 text-slate-400 hover:text-indigo-600">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete ${tech.name}?`)) deleteTechMutation.mutate(tech.id);
                  }}
                  className="h-9 w-9 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">No technicians found</div>
          )}
        </div>
      </div>

      {/* Edit Technician Dialog */}
      {editingTech && (
        <EditTechnicianDialog
          tech={editingTech}
          onClose={() => setEditingTech(null)}
          onSave={(data) => updateTechMutation.mutate({ id: editingTech.id, data })}
          saving={updateTechMutation.isPending}
        />
      )}
    </div>
  );
}

function EditTechnicianDialog({ tech, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: tech.name || '',
    email: tech.email || '',
    phone: tech.phone || '',
    worker_type: tech.worker_type || 'employee',
    certification_level: tech.certification_level || 'intermediate',
    availability_status: tech.availability_status || 'available',
    hourly_rate: tech.hourly_rate || 0,
    max_weekly_hours: tech.max_weekly_hours || 40,
    shift: tech.shift || 'day',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Technician — {tech.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="col-span-2 space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => update('phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Worker Type</Label>
            <Select value={form.worker_type} onValueChange={v => update('worker_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="employee">Employee</SelectItem><SelectItem value="contractor">Contractor</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Level</Label>
            <Select value={form.certification_level} onValueChange={v => update('certification_level', v)}>
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
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={form.availability_status} onValueChange={v => update('availability_status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Shift</Label>
            <Select value={form.shift} onValueChange={v => update('shift', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="rotating">Rotating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Hourly Rate ($)</Label>
            <Input type="number" value={form.hourly_rate} onChange={e => update('hourly_rate', Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Max Weekly Hours</Label>
            <Input type="number" value={form.max_weekly_hours} onChange={e => update('max_weekly_hours', Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}