import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';

const SCENARIOS = [
  { id: 'Premium', label: 'Premium', hint: 'Every asset — full renewal program' },
  { id: 'Balanced', label: 'Balanced', hint: 'Criticality ≤3 or poor condition' },
  { id: 'Must Do', label: 'Must Do', hint: 'Only critical / failing assets' },
];

export default function GeneratePlanDialog({ open, onOpenChange, onGenerated }) {
  const [assessments, setAssessments] = useState([]);
  const [assessmentId, setAssessmentId] = useState('');
  const [scenario, setScenario] = useState('Balanced');
  const [escalation, setEscalation] = useState(3);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setError(null);
    (async () => {
      try {
        const data = await secureEntity('ConditionAssessment').list('-created_date', 100);
        setAssessments(data || []);
        if (data?.length && !assessmentId) setAssessmentId(data[0].id);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [open]);

  const run = async () => {
    if (!assessmentId) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('computeLifecyclePlan', {
        assessment_id: assessmentId,
        scenario,
        escalation_pct: Number(escalation) || 3,
      });
      const body = res?.data ?? res;
      if (body?.error) throw new Error(body.error);
      setResult(body.data || body);
      onGenerated?.();
    } catch (e) {
      setError(e.message);
    }
    setRunning(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Generate Financial Plan
          </DialogTitle>
          <DialogDescription>
            Run the deterministic lifecycle engine over a condition assessment to produce a
            year-by-year capital plan for the selected scenario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <Label className="text-xs">Condition assessment</Label>
            <Select value={assessmentId} onValueChange={setAssessmentId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select assessment" /></SelectTrigger>
              <SelectContent>
                {assessments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.title || a.location_name || a.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!assessments.length && (
              <p className="text-[11px] text-amber-600 mt-1">No condition assessments found.</p>
            )}
          </div>

          <div>
            <Label className="text-xs">Scenario</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenario(s.id)}
                  className={`rounded-lg border p-2 text-left transition-colors ${
                    scenario === s.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[12px] font-semibold text-slate-900">{s.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Annual cost escalation (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={escalation}
              onChange={(e) => setEscalation(e.target.value)}
              className="mt-1 w-28"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-[12px] text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-[12px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{result.created} items generated ({result.scenario})</p>
                <p className="text-emerald-700">
                  {result.included} included · {result.skipped} skipped · total forecast{' '}
                  ${(result.total_cost || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={run} disabled={running || !assessmentId}>
            {running ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1" /> Generate plan</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}