import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Wrench, ClipboardList, Cpu, MapPin, Radio, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * When a user clicks a node on the map, this dialog lets them:
 *  - Create a maintenance task
 *  - Create a work order
 *  - Link the node to an Equipment record
 */
export default function NodeActionDialog({ open, onClose, node, networkName }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState(null); // 'task' | 'work_order' | 'equipment' | null
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'preventive',
    scheduled_date: '',
  });

  if (!node) return null;

  const reset = () => {
    setMode(null);
    setForm({ title: '', description: '', priority: 'medium', type: 'preventive', scheduled_date: '' });
  };

  const ensureEquipment = async () => {
    if (node.equipment_id) return node.equipment_id;
    const eq = await base44.entities.Equipment.create({
      name: node.name,
      type: mapNodeTypeToEquipment(node.node_type),
      location: node.zone || networkName || 'Network',
      status: node.condition === 'critical' ? 'critical' : node.condition === 'degraded' ? 'degraded' : 'operational',
    });
    if (node.id) {
      await base44.entities.NetworkNode.update(node.id, { equipment_id: eq.id });
    }
    return eq.id;
  };

  const createTask = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setSubmitting(true);
    try {
      const equipment_id = await ensureEquipment();
      await base44.entities.MaintenanceTask.create({
        equipment_id,
        title: form.title,
        description: `${form.description}\n\n📍 Node: ${node.name} (${node.lat?.toFixed(5)}, ${node.lng?.toFixed(5)})`,
        type: form.type,
        priority: form.priority,
        scheduled_date: form.scheduled_date || undefined,
      });
      toast.success('Maintenance task created');
      qc.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      reset();
      onClose();
    } catch (e) {
      toast.error(`Failed: ${e.message}`);
    }
    setSubmitting(false);
  };

  const createWorkOrder = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setSubmitting(true);
    try {
      const equipment_id = await ensureEquipment();
      await base44.entities.WorkOrder.create({
        equipment_id,
        title: form.title,
        description: `${form.description}\n\n📍 Node: ${node.name} (${node.lat?.toFixed(5)}, ${node.lng?.toFixed(5)})`,
        type: form.type,
        priority: form.priority,
        status: 'open',
      });
      toast.success('Work order created');
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      reset();
      onClose();
    } catch (e) {
      toast.error(`Failed: ${e.message}`);
    }
    setSubmitting(false);
  };

  const linkEquipment = async () => {
    setSubmitting(true);
    try {
      await ensureEquipment();
      toast.success('Equipment record created & linked');
      qc.invalidateQueries({ queryKey: ['equipment'] });
      qc.invalidateQueries({ queryKey: ['network-nodes'] });
      reset();
      onClose();
    } catch (e) {
      toast.error(`Failed: ${e.message}`);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg bg-slate-900 border-white/10 text-white z-[200]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            {node.name}
          </DialogTitle>
        </DialogHeader>

        {/* Node summary */}
        <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-white/50">Type</span><span className="capitalize">{node.node_type || 'node'}</span></div>
          {node.zone && <div className="flex justify-between"><span className="text-white/50">Zone</span><span>{node.zone}</span></div>}
          <div className="flex justify-between"><span className="text-white/50">Condition</span>
            <span className="capitalize" style={{ color: conditionColor(node.condition) }}>{node.condition || 'operational'}</span>
          </div>
          <div className="flex justify-between"><span className="text-white/50">Coordinates</span>
            <span className="font-mono text-xs">{Number(node.lat).toFixed(6)}, {Number(node.lng).toFixed(6)}</span>
          </div>
          {node.sensors?.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="text-[10px] font-semibold uppercase text-white/40 mb-1 flex items-center gap-1">
                <Radio className="w-3 h-3" /> Sensors ({node.sensors.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {node.sensors.map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-200 capitalize">{s.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}
          {node.equipment_id && (
            <div className="pt-2 text-[11px] text-emerald-300">✓ Linked to Equipment #{String(node.equipment_id).slice(0, 8)}</div>
          )}
        </div>

        {/* Action picker */}
        {!mode && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ActionBtn icon={Wrench} label="Create Task" color="amber" onClick={() => { setMode('task'); setForm((f) => ({ ...f, title: `Maintenance — ${node.name}` })); }} />
            <ActionBtn icon={ClipboardList} label="Work Order" color="indigo" onClick={() => { setMode('work_order'); setForm((f) => ({ ...f, title: `Work Order — ${node.name}` })); }} />
            <ActionBtn icon={Cpu} label="Link Equipment" color="emerald" onClick={() => setMode('equipment')} disabled={!!node.equipment_id} />
          </div>
        )}

        {/* Task / Work Order form */}
        {(mode === 'task' || mode === 'work_order') && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-white/70">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-slate-800 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-xs text-white/70">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-slate-800 border-white/10 text-white min-h-[70px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-white/70">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-slate-800 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="predictive">Predictive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/70">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="bg-slate-800 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {mode === 'task' && (
              <div>
                <Label className="text-xs text-white/70">Scheduled Date</Label>
                <Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className="bg-slate-800 border-white/10 text-white" />
              </div>
            )}
          </div>
        )}

        {mode === 'equipment' && (
          <div className="text-sm text-white/70 bg-slate-950/60 border border-white/10 rounded-xl p-4">
            This will create an Equipment record named <strong>{node.name}</strong> and link it to this node so you can track
            sensors, maintenance history, and health scores against it.
          </div>
        )}

        <DialogFooter>
          {mode ? (
            <>
              <Button variant="outline" onClick={reset} className="border-white/10 text-white bg-white/5">
                <X className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={mode === 'task' ? createTask : mode === 'work_order' ? createWorkOrder : linkEquipment}
                disabled={submitting}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                {submitting ? 'Saving...' :
                  mode === 'task' ? 'Create Task' :
                  mode === 'work_order' ? 'Create Work Order' : 'Link Equipment'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="border-white/10 text-white bg-white/5">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick, disabled }) {
  const colors = {
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-400/40 hover:bg-amber-500/20 text-amber-200',
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-400/40 hover:bg-indigo-500/20 text-indigo-200',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-400/40 hover:bg-emerald-500/20 text-emerald-200',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

function conditionColor(c) {
  return {
    operational: '#10b981',
    degraded: '#f59e0b',
    critical: '#ef4444',
    maintenance: '#3b82f6',
    offline: '#94a3b8',
  }[c] || '#94a3b8';
}

function mapNodeTypeToEquipment(nt) {
  const map = {
    station: 'building',
    junction: 'valve',
    sensor: 'motor',
    checkpoint: 'motor',
    facility: 'building',
    equipment: 'motor',
    substation: 'transformer',
    valve: 'valve',
    endpoint: 'motor',
    custom: 'motor',
  };
  return map[nt] || 'motor';
}