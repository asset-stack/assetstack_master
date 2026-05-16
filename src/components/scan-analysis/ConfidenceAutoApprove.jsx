import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Zap, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Confidence-driven auto-approve.
 * Inspired by Label Studio's active-learning pattern:
 * humans should ONLY review the uncertain cases.
 * High-confidence detections get auto-approved; humans focus on the bottom 20-30%.
 */
export default function ConfidenceAutoApprove({ reports, onDone }) {
  const [threshold, setThreshold] = useState(90);
  const [busy, setBusy] = useState(false);

  const pending = useMemo(
    () => reports.filter((r) => r.review_status === 'pending'),
    [reports]
  );

  const eligible = useMemo(
    () => pending.filter((r) => (r.ai_confidence || 0) >= threshold),
    [pending, threshold]
  );

  const distribution = useMemo(() => {
    const buckets = { '95+': 0, '90-95': 0, '80-90': 0, '70-80': 0, '<70': 0 };
    pending.forEach((r) => {
      const c = r.ai_confidence || 0;
      if (c >= 95) buckets['95+']++;
      else if (c >= 90) buckets['90-95']++;
      else if (c >= 80) buckets['80-90']++;
      else if (c >= 70) buckets['70-80']++;
      else buckets['<70']++;
    });
    return buckets;
  }, [pending]);

  const handleAutoApprove = async () => {
    if (eligible.length === 0) return;
    setBusy(true);
    try {
      const user = await base44.auth.me();
      const stamp = new Date().toISOString();
      await Promise.all(
        eligible.map((r) =>
          base44.entities.ConditionReport.update(r.id, {
            review_status: 'approved',
            reviewed_by: `Auto-approve (≥${threshold}% confidence) by ${user?.full_name || user?.email}`,
            reviewed_at: stamp,
            reviewer_notes: r.reviewer_notes || `Auto-approved at ${threshold}% confidence threshold`
          })
        )
      );
      toast?.success?.(`Auto-approved ${eligible.length} high-confidence finding(s)`);
      onDone?.();
    } catch (e) {
      toast?.error?.('Auto-approve failed');
      console.error(e);
    }
    setBusy(false);
  };

  if (pending.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-lg p-3 mb-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Smart Auto-Approve
          </h4>
          <p className="text-[10px] text-violet-700 mt-0.5 flex items-center gap-1">
            <Info className="w-2.5 h-2.5" /> Only review uncertain cases — let AI handle the obvious ones
          </p>
        </div>
        <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px]">
          {pending.length} pending
        </Badge>
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {Object.entries(distribution).map(([k, v]) => (
          <div key={k} className="bg-white/60 rounded p-1 text-center">
            <div className="text-[9px] text-slate-500">{k}%</div>
            <div className="text-xs font-bold text-slate-900 tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      {/* Threshold slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-violet-800">
            Threshold: ≥{threshold}%
          </span>
          <span className="text-[10px] text-violet-700 tabular-nums">
            {eligible.length} eligible
          </span>
        </div>
        <Slider
          value={[threshold]}
          onValueChange={(v) => setThreshold(v[0])}
          min={70}
          max={99}
          step={1}
          className="w-full"
        />
      </div>

      <Button
        size="sm"
        onClick={handleAutoApprove}
        disabled={busy || eligible.length === 0}
        className="w-full bg-violet-600 hover:bg-violet-700 h-7 text-[11px]"
      >
        {busy ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <Zap className="w-3 h-3 mr-1" />
        )}
        Auto-approve {eligible.length} finding{eligible.length !== 1 ? 's' : ''}
      </Button>
    </div>
  );
}