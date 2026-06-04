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
import { Plus, X, Trash2, Loader2 } from 'lucide-react';
import AssigneePicker from './AssigneePicker';
import { TASK_COLUMNS } from '@/lib/taskUtils';

const blank = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee_ids: [],
  assignee_names: [],
  lead_id: '',
  required_skills: [],
  depends_on_ids: [],
  start_date: '',
  due_date: '',
  estimated_hours: 0,
  checklist: []
};

export default function TaskDialog({
  open,
  onOpenChange,
  task,
  project,
  technicians = [],
  siblingTasks = [],
  onSaved
}) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [checkInput, setCheckInput] = useState('');

  useEffect(() => {
    setForm(task ? { ...blank, ...task } : blank);
    setSkillInput('');
    setCheckInput('');
  }, [task, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const phases = project?.phases || [];

  const toggleAssignee = (tech) => {
    setForm((f) => {
      const has = f.assignee_ids.includes(tech.id);
      const ids = has ? f.assignee_ids.filter((id) => id !== tech.id) : [...f.assignee_ids, tech.id];
      const names = ids
        .map((id) => technicians.find((t) => t.id === id)?.name)
        .filter(Boolean);
      return {
        ...f,
        assignee_ids: ids,
        assignee_names: names,
        lead_id: has && f.lead_id === tech.id ? '' : f.lead_id
      };
    });
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.required_skills.includes(s)) {
      set('required_skills', [...form.required_skills, s]);
    }
    setSkillInput('');
  };

  const addCheck = () => {
    const t = checkInput.trim();
    if (t) set('checklist', [...(form.checklist || []), { text: t, done: false }]);
    setCheckInput('');
  };

  const toggleDep = (id) => {
    const has = form.depends_on_ids.includes(id);
    set('depends_on_ids', has ? form.depends_on_ids.filter((d) => d !== id) : [...form.depends_on_ids, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const phaseName = phases.find((p) => p.id === form.phase_id)?.name || '';
      const payload = {
        ...form,
        project_id: project.id,
        phase_name: phaseName,
        estimated_hours: Number(form.estimated_hours) || 0,
        completed_date: form.status === 'done' ? new Date().toISOString() : form.completed_date
      };
      let saved;
      if (task?.id) saved = await secureEntity('ProjectTask').update(task.id, payload);
      else saved = await secureEntity('ProjectTask').create(payload);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!task?.id || !confirm('Delete this task?')) return;
    setSaving(true);
    await secureEntity('ProjectTask').delete(task.id);
    onSaved?.();
    onOpenChange(false);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task?.id ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} autoFocus />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_COLUMNS.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phase</Label>
              <Select value={form.phase_id || 'none'} onValueChange={(v) => set('phase_id', v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No phase</SelectItem>
                  {phases.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date || ''} onChange={(e) => set('start_date', e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date || ''} onChange={(e) => set('due_date', e.target.value)} />
            </div>
            <div>
              <Label>Est. Hours</Label>
              <Input
                type="number"
                value={form.estimated_hours || 0}
                onChange={(e) => set('estimated_hours', e.target.value)}
              />
            </div>
          </div>

          {/* Required skills */}
          <div>
            <Label>Required Skills</Label>
            <div className="flex gap-2 mb-1.5">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g. HVAC Systems"
              />
              <Button type="button" variant="outline" onClick={addSkill} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.required_skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                  {s}
                  <button type="button" onClick={() => set('required_skills', form.required_skills.filter((x) => x !== s))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <Label>Assign Team (★ = lead)</Label>
            <AssigneePicker
              technicians={technicians}
              selectedIds={form.assignee_ids}
              leadId={form.lead_id}
              requiredSkills={form.required_skills}
              onToggle={toggleAssignee}
              onSetLead={(id) => set('lead_id', id || '')}
            />
          </div>

          {/* Dependencies */}
          {siblingTasks.length > 0 && (
            <div>
              <Label>Depends On (must finish first)</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {siblingTasks.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.depends_on_ids.includes(t.id)}
                      onChange={() => toggleDep(t.id)}
                      className="rounded"
                    />
                    {t.title}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          <div>
            <Label>Checklist / Acceptance Criteria</Label>
            <div className="flex gap-2 mb-1.5">
              <Input
                value={checkInput}
                onChange={(e) => setCheckInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCheck())}
                placeholder="Add checklist item"
              />
              <Button type="button" variant="outline" onClick={addCheck} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {(form.checklist || []).map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={c.done}
                    onChange={() => {
                      const next = [...form.checklist];
                      next[i] = { ...c, done: !c.done };
                      set('checklist', next);
                    }}
                    className="rounded"
                  />
                  <span className={c.done ? 'line-through text-slate-400' : 'text-slate-700'}>{c.text}</span>
                  <button
                    type="button"
                    onClick={() => set('checklist', form.checklist.filter((_, idx) => idx !== i))}
                    className="ml-auto text-slate-300 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {task?.id ? (
            <Button variant="outline" onClick={handleDelete} className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title} className="gap-1.5">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}