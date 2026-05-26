import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Check, X, Edit3, Loader2, ChevronLeft, ChevronRight, Sparkles, Zap, Keyboard } from 'lucide-react';
import { toast } from 'sonner';

const SEV_TONE = {
  minor: 'bg-blue-100 text-blue-700',
  moderate: 'bg-amber-100 text-amber-700',
  major: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

// Full-screen keyboard-driven review mode.
// J/K = prev/next, A = approve, R = reject, E = edit (opens correction), W = approve + draft WO.
export default function KeyboardReviewMode({ open, onClose, reports = [], onChanged }) {
  const pending = useMemo(() => reports.filter((r) => r.review_status === 'pending'), [reports]);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  // Reset to first pending when opened or list changes
  useEffect(() => {
    if (open) setIdx(0);
  }, [open]);

  // Clamp index when pending shrinks
  useEffect(() => {
    if (idx >= pending.length) setIdx(Math.max(0, pending.length - 1));
  }, [pending.length, idx]);

  const current = pending[idx];

  const advance = useCallback(() => {
    setIdx((i) => Math.min(i + 1, Math.max(0, pending.length - 1)));
  }, [pending.length]);

  const goPrev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setIdx((i) => Math.min(i + 1, pending.length - 1)), [pending.length]);

  const review = useCallback(async (status, opts = {}) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const user = await base44.auth.me();
      const reviewer = user?.full_name || user?.email || 'reviewer';
      await secureEntity('ConditionReport').update(current.id, {
        review_status: status,
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: opts.note || `Power-review: ${status}`,
      });

      // Auto-draft WO for critical/major approvals
      if (opts.autoWO && current.equipment_id && (current.severity === 'critical' || current.severity === 'major')) {
        try {
          await secureEntity('WorkOrder').create({
            equipment_id: current.equipment_id,
            title: `[Scan] ${current.severity} ${current.anomaly_type?.replace(/_/g, ' ')} — ${current.equipment_name || 'asset'}`,
            description: `Auto-drafted from power-review.\n\nAI finding: ${current.ai_description || current.anomaly_type}\nSeverity: ${current.severity}\nAI confidence: ${Math.round(current.ai_confidence || 0)}%`,
            type: current.severity === 'critical' ? 'emergency' : 'corrective',
            priority: current.severity === 'critical' ? 'urgent' : 'high',
            status: 'draft',
            attachments: current.image_url ? [current.image_url] : [],
          });
          toast?.success?.('Approved & work order drafted');
        } catch (e) {
          toast?.success?.('Approved (WO draft failed)');
        }
      } else {
        toast?.success?.(`Marked ${status}`);
      }

      onChanged && onChanged();
      advance();
    } catch (err) {
      toast?.error?.(`Failed: ${err?.message}`);
    } finally {
      setBusy(false);
    }
  }, [current, busy, advance, onChanged]);

  // Keyboard handlers
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      // Ignore when typing in inputs
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'j' || k === 'arrowleft') { e.preventDefault(); goPrev(); }
      else if (k === 'k' || k === 'arrowright') { e.preventDefault(); goNext(); }
      else if (k === 'a') { e.preventDefault(); review('approved'); }
      else if (k === 'w') { e.preventDefault(); review('approved', { autoWO: true, note: 'Power-review: approved + WO drafted' }); }
      else if (k === 'r') { e.preventDefault(); review('rejected'); }
      else if (k === 'escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, goPrev, goNext, review, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        {pending.length === 0 ? (
          <div className="p-12 text-center">
            <Check className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-900">All caught up</h3>
            <p className="text-sm text-slate-500 mt-1">No pending findings to review.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        ) : current ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">Power Review</span>
                <Badge variant="outline" className="text-[10px]">{idx + 1} / {pending.length}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={goPrev} disabled={idx === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={goNext} disabled={idx >= pending.length - 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative bg-slate-900 aspect-video max-h-[55vh] overflow-hidden">
              {current.image_url ? (
                <img src={current.image_url} alt="Anomaly" className="w-full h-full object-contain" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">No image</div>
              )}
              {current.bounding_box && (
                <div
                  className="absolute border-2 border-red-500 bg-red-500/10 rounded animate-pulse"
                  style={{
                    left: `${(current.bounding_box.x || 0) * 100}%`,
                    top: `${(current.bounding_box.y || 0) * 100}%`,
                    width: `${(current.bounding_box.width || 0) * 100}%`,
                    height: `${(current.bounding_box.height || 0) * 100}%`,
                  }}
                />
              )}
              <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" />
                AI {Math.round(current.ai_confidence || 0)}%
              </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize text-xs">{current.anomaly_type?.replace(/_/g, ' ')}</Badge>
                <Badge className={`${SEV_TONE[current.severity] || SEV_TONE.minor} text-xs`}>{current.severity}</Badge>
                {current.equipment_name && (
                  <span className="text-xs text-slate-500">on <span className="font-medium text-slate-700">{current.equipment_name}</span></span>
                )}
              </div>
              {current.ai_description && (
                <p className="text-sm text-slate-700 leading-relaxed">{current.ai_description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-200 p-3 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <Kbd>J</Kbd>/<Kbd>K</Kbd> nav • <Kbd>A</Kbd> approve • <Kbd>W</Kbd> approve+WO • <Kbd>R</Kbd> reject • <Kbd>Esc</Kbd> exit
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => review('rejected')}
                  className="text-red-600 border-red-200 hover:bg-red-50 h-8"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
                {(current.severity === 'critical' || current.severity === 'major') && current.equipment_id && (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => review('approved', { autoWO: true, note: 'Power-review: approved + WO drafted' })}
                    className="bg-rose-600 hover:bg-rose-700 h-8"
                    title="Approve and draft work order (W)"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
                    Approve + WO
                  </Button>
                )}
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => review('approved')}
                  className="bg-emerald-600 hover:bg-emerald-700 h-8"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                  Approve
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }) {
  return <span className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 shadow-sm">{children}</span>;
}