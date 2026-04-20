import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2, Upload, Network, Edit, Download } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  rail: '#6366f1',
  power: '#f59e0b',
  water: '#06b6d4',
  gas: '#ef4444',
  telecom: '#a855f7',
  road: '#64748b',
  building: '#ec4899',
  pipeline: '#10b981',
  sensor_network: '#8b5cf6',
  other: '#94a3b8',
};

export default function NetworkManager({ open, onClose, onSelectNetwork, onImportRequest }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    asset_category: 'other',
    color: '#6366f1',
  });

  const { data: networks = [] } = useQuery({
    queryKey: ['asset-networks'],
    queryFn: () => base44.entities.AssetNetwork.filter({ status: 'active' }, '-created_date'),
    enabled: open,
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.AssetNetwork.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['asset-networks'] }); toast.success('Network created'); resetForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AssetNetwork.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['asset-networks'] }); toast.success('Network updated'); resetForm(); },
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      // cascade delete nodes
      const nodes = await base44.entities.NetworkNode.filter({ network_id: id });
      await Promise.all(nodes.map((n) => base44.entities.NetworkNode.delete(n.id)));
      return base44.entities.AssetNetwork.delete(id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['asset-networks'] }); toast.success('Network deleted'); },
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', description: '', asset_category: 'other', color: '#6366f1' });
  };

  const startEdit = (n) => {
    setEditing(n);
    setForm({
      name: n.name || '',
      description: n.description || '',
      asset_category: n.asset_category || 'other',
      color: n.color || '#6366f1',
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            My Asset Networks
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
            {editing ? 'Edit Network' : 'Create New Network'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-white/70">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Power Grid North"
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-white/70">Category</Label>
              <Select value={form.asset_category} onValueChange={(v) => setForm({ ...form, asset_category: v, color: CATEGORY_COLORS[v] || form.color })}>
                <SelectTrigger className="bg-slate-800 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(CATEGORY_COLORS).map((c) => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-white/70">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What this network represents..."
              className="bg-slate-800 border-white/10 text-white min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Label className="text-xs text-white/70">Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border border-white/10"
                />
                <span className="text-xs font-mono text-white/70">{form.color}</span>
              </div>
            </div>
            <div className="flex-1" />
            {editing && (
              <Button variant="outline" onClick={resetForm} className="border-white/10 text-white bg-white/5">Cancel</Button>
            )}
            <Button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600">
              {editing ? <><Edit className="w-4 h-4 mr-1.5" /> Save</> : <><Plus className="w-4 h-4 mr-1.5" /> Create</>}
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          {networks.length === 0 && (
            <div className="text-center py-8 text-white/50 text-sm">
              No networks yet. Create one above, or import from CSV/GeoJSON.
            </div>
          )}
          {networks.map((n) => (
            <div key={n.id} className="group flex items-center gap-3 p-3 bg-slate-950/50 border border-white/10 rounded-lg hover:border-indigo-400/40 transition-colors">
              <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: n.color || '#6366f1' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white truncate">{n.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 capitalize">{n.asset_category?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-white/50 truncate">{n.description || 'No description'}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{n.node_count || 0} nodes</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="text-white/70 hover:bg-white/10" onClick={() => onImportRequest(n)} title="Import nodes">
                  <Upload className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white/70 hover:bg-white/10" onClick={() => startEdit(n)} title="Edit">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10" onClick={() => { if (confirm(`Delete "${n.name}" and all its nodes?`)) deleteMut.mutate(n.id); }} title="Delete">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => { onSelectNetwork(n); onClose(); }} className="bg-indigo-500 hover:bg-indigo-600 ml-1">
                  Open
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-white/10 text-white bg-white/5">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}