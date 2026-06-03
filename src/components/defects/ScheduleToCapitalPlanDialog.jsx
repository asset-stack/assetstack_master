import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock, Loader2 } from 'lucide-react';

const CURRENT_FY = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_FY + i);

const PRIORITY_MAP = { high: 'urgent', medium: 'medium', low: 'low' };

export default function ScheduleToCapitalPlanDialog({ open, onOpenChange, defect, onScheduled }) {
  const [year, setYear] = useState(CURRENT_FY + 1);
  const [cost, setCost] = useState('');
  const [priority, setPriority] = useState('medium');
  const [rationale, setRationale] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defect) {
      setYear(defect.year || CURRENT_FY + 1);
      setCost(defect.factored_cost != null ? Math.round(defect.factored_cost) : '');
      setPriority(PRIORITY_MAP[(defect.priority || '').toLowerCase()] || 'medium');
      setRationale(
        `From condition assessment — ${defect.defect_id}: ${defect.description || ''}${defect.rectification ? `\nRectification: ${defect.rectification}` : ''}`
      );
    }
  }, [defect]);

  if (!defect) return null;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onScheduled({
        defect,
        year: Number(year),
        cost: Number(cost) || 0,
        priority,
        rationale,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-600" /> Schedule into Capital Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="bg-slate-50 rounded-lg p-3 text-xs">
            <span className="font-semibold text-slate-700">{defect.defect_id}</span>
            <span className="text-slate-400"> · {defect.room_name || defect.room_code}</span>
            <p className="text-slate-600 mt-1 leading-relaxed">{defect.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fiscal Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(v)}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => <SelectItem key={y} value={String(y)}>FY{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Estimated Cost ($)</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="h-9 mt-1" placeholder="0" />
          </div>

          <div>
            <Label className="text-xs">Rationale</Label>
            <Textarea value={rationale} onChange={(e) => setRationale(e.target.value)} className="mt-1 h-20 text-xs" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CalendarClock className="w-4 h-4 mr-1" />}
            Add to Capital Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}