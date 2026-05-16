import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { formatCurrency } from '@/lib/projectUtils';

const SAMPLE_PROMPTS = [
  'Plan the FY27 lift modernisation program across the 12 council buildings',
  'Roof renewal program for all sites with condition score below 50',
  'Compliance upgrade for fire suppression systems, 18-month delivery',
  'Energy-efficiency retrofit for the highest-spend HVAC assets'
];

export default function AIComposerDialog({ open, onOpenChange, onCreated }) {
  const [prompt, setPrompt] = useState('');
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleCompose = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const res = await base44.functions.invoke('composeProjectFromPrompt', { prompt });
      setDraft(res.data?.draft || null);
    } catch (e) {
      setError(e.message || 'Failed to compose project');
    }
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const project = await base44.entities.Project.create({
        ...draft,
        code: `PRJ-${Date.now().toString().slice(-6)}`
      });
      onCreated?.(project);
      setPrompt('');
      setDraft(null);
      onOpenChange(false);
    } catch (e) {
      setError(e.message || 'Failed to save project');
    }
    setSaving(false);
  };

  const reset = () => {
    setPrompt('');
    setDraft(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <DialogTitle>AI Project Composer</DialogTitle>
              <DialogDescription>
                Describe the project you want to deliver. AssetMind will draft scope, phases, budget and risks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!draft && (
          <div className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Plan the FY27 roof renewal program across all sites with condition score under 60..."
              className="min-h-[120px]"
            />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Try a sample
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 rounded-md p-2">{error}</div>
            )}
            <Button onClick={handleCompose} disabled={!prompt.trim() || loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> AssetMind is drafting…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" /> Compose Project
                </>
              )}
            </Button>
          </div>
        )}

        {draft && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
                  AI Draft
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{draft.name}</h3>
              <p className="text-xs text-slate-600">{draft.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Budget</div>
                <div className="text-sm font-bold text-slate-900 tabular-nums">
                  {formatCurrency(draft.budget)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Type</div>
                <div className="text-sm font-bold text-slate-900 capitalize">
                  {draft.project_type?.replace('_', ' ')}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Priority</div>
                <div className="text-sm font-bold text-slate-900 capitalize">{draft.priority}</div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Phases ({draft.phases?.length || 0})
              </p>
              <div className="space-y-1.5">
                {draft.phases?.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-md bg-white border border-slate-200 text-xs"
                  >
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-slate-500 tabular-nums">
                      {p.start_date} → {p.end_date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {draft.risks?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Risks ({draft.risks.length})
                </p>
                <ul className="space-y-1 text-xs text-slate-700">
                  {draft.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{r.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 rounded-md p-2">{error}</div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDraft(null)} className="flex-1">
                Edit Prompt
              </Button>
              <Button onClick={handleAccept} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}