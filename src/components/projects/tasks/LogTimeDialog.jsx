import React, { useState, useEffect } from 'react';
import { secureEntity } from '@/lib/secureEntities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function LogTimeDialog({ open, onOpenChange, project, tasks = [], technicians = [], onSaved }) {
  const [form, setForm] = useState({
    technician_id: '',
    task_id: '',
    date: new Date().toISOString().slice(0, 10),
    hours: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ technician_id: '', task_id: '', date: new Date().toISOString().slice(0, 10), hours: '', notes: '' });
    }
  }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const tech = technicians.find((t) => t.id === form.technician_id);
      const task = tasks.find((t) => t.id === form.task_id);
      const hours = Number(form.hours) || 0;
      const rate = Number(tech?.hourly_rate) || 0;
      const cost = hours * rate;

      await secureEntity('TimeEntry').create({
        project_id: project.id,
        task_id: form.task_id || '',
        task_title: task?.title || '',
        technician_id: form.technician_id,
        technician_name: tech?.name || '',
        date: form.date,
        hours,
        hourly_rate: rate,
        cost,
        notes: form.notes
      });

      // Roll up onto the task
      if (task) {
        await secureEntity('ProjectTask').update(task.id, {
          logged_hours: (Number(task.logged_hours) || 0) + hours,
          actual_cost: (Number(task.actual_cost) || 0) + cost
        });
      }
      // Roll up labor onto the project
      await secureEntity('Project').update(project.id, {
        labor_cost_to_date: (Number(project.labor_cost_to_date) || 0) + cost,
        actual_cost: (Number(project.actual_cost) || 0) + cost
      });

      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const tech = technicians.find((t) => t.id === form.technician_id);
  const estCost = (Number(form.hours) || 0) * (Number(tech?.hourly_rate) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Team Member</Label>
            <Select value={form.technician_id} onValueChange={(v) => set('technician_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select a person" /></SelectTrigger>
              <SelectContent>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}{t.hourly_rate ? ` — $${t.hourly_rate}/h` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Task (optional)</Label>
            <Select value={form.task_id || 'none'} onValueChange={(v) => set('task_id', v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="General project time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General project time</SelectItem>
                {tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div>
              <Label>Hours</Label>
              <Input
                type="number"
                step="0.25"
                value={form.hours}
                onChange={(e) => set('hours', e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>

          {estCost > 0 && (
            <div className="bg-slate-50 rounded-lg p-2.5 text-sm text-slate-700">
              Labor cost: <span className="font-bold tabular-nums">${estCost.toLocaleString()}</span>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.technician_id || !form.hours}
            className="gap-1.5"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Log Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}