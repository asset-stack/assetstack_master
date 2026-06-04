import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Loader2, ShieldCheck } from 'lucide-react';

const PHASE_STATUS = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-indigo-100 text-indigo-700',
  complete: 'bg-emerald-100 text-emerald-700',
  blocked: 'bg-rose-100 text-rose-700'
};

// Lets a PM/QA sign-off each phase as a quality gate.
export default function PhaseSignOffPanel({ project, onSaved }) {
  const phases = project.phases || [];
  const [busyId, setBusyId] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState('');

  const saveSignOff = async (phaseId, signOff) => {
    setBusyId(phaseId);
    try {
      const me = await base44.auth.me().catch(() => null);
      const next = phases.map((p) =>
        p.id === phaseId
          ? {
              ...p,
              signed_off: signOff,
              signed_off_by: signOff ? me?.full_name || me?.email || 'Reviewer' : '',
              signed_off_at: signOff ? new Date().toISOString() : '',
              sign_off_notes: signOff ? note : ''
            }
          : p
      );
      await secureEntity('Project').update(project.id, { phases: next });
      setNoteFor(null);
      setNote('');
      onSaved?.();
    } catch (e) {
      console.error(e);
    }
    setBusyId(null);
  };

  if (!phases.length) {
    return (
      <Card className="p-6 text-center text-sm text-slate-500">
        No phases yet. Add phases to manage quality sign-offs.
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">Quality Gates &amp; Phase Sign-Off</h3>
      </div>
      <div className="space-y-2.5">
        {phases.map((phase) => (
          <div key={phase.id} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {phase.signed_off ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className="text-sm font-semibold text-slate-900 truncate">{phase.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${PHASE_STATUS[phase.status] || PHASE_STATUS.not_started}`}>
                  {(phase.status || 'not_started').replace('_', ' ')}
                </span>
              </div>
              {phase.signed_off ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === phase.id}
                  onClick={() => saveSignOff(phase.id, false)}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 shrink-0"
                >
                  {busyId === phase.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Revoke'}
                </Button>
              ) : noteFor === phase.id ? (
                <span />
              ) : (
                <Button size="sm" onClick={() => setNoteFor(phase.id)} className="shrink-0 gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sign Off
                </Button>
              )}
            </div>

            {phase.signed_off && (
              <p className="text-[11px] text-emerald-700 mt-1.5 ml-6">
                Signed off by {phase.signed_off_by} ·{' '}
                {phase.signed_off_at && new Date(phase.signed_off_at).toLocaleDateString()}
                {phase.sign_off_notes ? ` — ${phase.sign_off_notes}` : ''}
              </p>
            )}

            {noteFor === phase.id && !phase.signed_off && (
              <div className="mt-2.5 ml-6 space-y-2">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Sign-off notes (optional)…"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={busyId === phase.id} onClick={() => saveSignOff(phase.id, true)} className="gap-1.5">
                    {busyId === phase.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Sign-Off
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setNoteFor(null); setNote(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}