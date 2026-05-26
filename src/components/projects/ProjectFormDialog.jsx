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

const defaultProject = {
  name: '',
  code: '',
  description: '',
  project_type: 'renewal',
  status: 'planning',
  priority: 'medium',
  health: 'on_track',
  start_date: '',
  target_end_date: '',
  budget: 0,
  funding_source: 'capital',
  project_manager: '',
  sponsor: ''
};

export default function ProjectFormDialog({ open, onOpenChange, project, onSaved }) {
  const [form, setForm] = useState(defaultProject);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(project || defaultProject);
  }, [project, open]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let saved;
      if (project?.id) {
        saved = await secureEntity('Project').update(project.id, form);
      } else {
        saved = await secureEntity('Project').create({
          ...form,
          code: form.code || `PRJ-${Date.now().toString().slice(-6)}`
        });
      }
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project?.id ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Project Name</Label>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                placeholder="PRJ-001"
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Type</Label>
              <Select
                value={form.project_type}
                onValueChange={(v) => update('project_type', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="new_build">New Build</SelectItem>
                  <SelectItem value="compliance_program">Compliance</SelectItem>
                  <SelectItem value="disposal">Disposal</SelectItem>
                  <SelectItem value="grant_funded">Grant-Funded</SelectItem>
                  <SelectItem value="maintenance_program">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_delivery">In Delivery</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => update('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => update('start_date', e.target.value)}
              />
            </div>
            <div>
              <Label>Target End Date</Label>
              <Input
                type="date"
                value={form.target_end_date || ''}
                onChange={(e) => update('target_end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Budget</Label>
              <Input
                type="number"
                value={form.budget || 0}
                onChange={(e) => update('budget', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Funding Source</Label>
              <Select
                value={form.funding_source}
                onValueChange={(v) => update('funding_source', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="capital">Capital</SelectItem>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="tbd">TBD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Project Manager</Label>
              <Input
                value={form.project_manager || ''}
                onChange={(e) => update('project_manager', e.target.value)}
              />
            </div>
            <div>
              <Label>Sponsor</Label>
              <Input
                value={form.sponsor || ''}
                onChange={(e) => update('sponsor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name}>
            {saving ? 'Saving…' : 'Save Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}