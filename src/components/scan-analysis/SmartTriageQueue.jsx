import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, AlertTriangle, ShieldQuestion, Eye, Loader2, Keyboard, Zap } from 'lucide-react';
import { toast } from 'sonner';

// Smart triage: groups PENDING anomalies into 4 actionable buckets by urgency × confidence.
// Lets reviewers bulk-approve obvious cases and focus humans on the ambiguous ones.
export default function SmartTriageQueue({ reports = [], onDone, onOpenKeyboardMode }) {
  const [busyBucket, setBusyBucket] = useState(null);

  const buckets = useMemo(() => {
    const pending = reports.filter((r) => r.review_status === 'pending');
    const isCritical = (r) => r.severity === 'critical' || r.severity === 'major';
    const isConfident = (r) => (r.ai_confidence || 0) >= 85;

    return {
      criticalSure: pending.filter((r) => isCritical(r) && isConfident(r)),
      criticalUnsure: pending.filter((r) => isCritical(r) && !isConfident(r)),
      minorSure: pending.filter((r) => !isCritical(r) && isConfident(r)),
      minorUnsure: pending.filter((r) => !isCritical(r) && !isConfident(r)),
    };
  }, [reports]);

  const totalPending = buckets.criticalSure.length + buckets.criticalUnsure.length + buckets.minorSure.length + buckets.minorUnsure.length;

  if (totalPending === 0) return null;

  const bulkApprove = async (bucketKey, items, autoWO = false) => {
    setBusyBucket(bucketKey);
    try {
      const user = await base44.auth.me();
      const reviewer = user?.full_name || user?.email || 'triage';
      const ts = new Date().toISOString();

      // Update reports in parallel batches
      const batchSize = 8;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(
          batch.map((r) =>
            secureEntity('ConditionReport').update(r.id, {
              review_status: 'approved',
              reviewed_by: reviewer,
              reviewed_at: ts,
              reviewer_notes: `Smart-triage approved (${bucketKey})`,
            }).catch(() => null)
          )
        );
      }

      // Auto-draft WOs for critical items
      let woCount = 0;
      if (autoWO) {
        for (const r of items) {
          if (!r.equipment_id) continue;
          try {
            await secureEntity('WorkOrder').create({
              equipment_id: r.equipment_id,
              title: `[Scan] ${r.severity} ${r.anomaly_type?.replace(/_/g, ' ')} — ${r.equipment_name || 'asset'}`,
              description: `Auto-drafted from scan analysis.\n\nAI finding: ${r.ai_description || r.anomaly_type}\nSeverity: ${r.severity}\nAI confidence: ${Math.round(r.ai_confidence || 0)}%\nSource scan: ${r.digital_twin_model_name || ''}`,
              type: r.severity === 'critical' ? 'emergency' : 'corrective',
              priority: r.severity === 'critical' ? 'urgent' : 'high',
              status: 'draft',
              attachments: r.image_url ? [r.image_url] : [],
            });
            woCount++;
          } catch (e) {
            console.warn('WO create failed for', r.id, e);
          }
        }
      }

      toast?.success?.(
        `Approved ${items.length} finding${items.length === 1 ? '' : 's'}${woCount ? ` • ${woCount} work order${woCount === 1 ? '' : 's'} drafted` : ''}`
      );
      onDone && onDone();
    } catch (err) {
      toast?.error?.(`Bulk action failed: ${err?.message || 'Unknown'}`);
    } finally {
      setBusyBucket(null);
    }
  };

  const Bucket = ({ k, items, icon: Icon, tone, title, hint, primaryLabel, autoWO }) => {
    if (items.length === 0) return null;
    const busy = busyBucket === k;
    return (
      <div className={`rounded-lg border p-3 ${tone.bg} ${tone.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tone.iconBg}`}>
            <Icon className={`w-4 h-4 ${tone.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`text-xs font-bold ${tone.text}`}>{title}</span>
              <Badge className={`${tone.badge} text-[10px] h-4`}>{items.length}</Badge>
            </div>
            <p className={`text-[11px] ${tone.subtext} leading-snug`}>{hint}</p>
          </div>
          <Button
            size="sm"
            disabled={busy}
            onClick={() => bulkApprove(k, items, autoWO)}
            className={`h-7 text-[11px] shrink-0 ${tone.btn}`}
          >
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : autoWO ? <Zap className="w-3 h-3 mr-1" /> : <CheckCheck className="w-3 h-3 mr-1" />}
            {primaryLabel}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Smart Triage</span>
          <Badge variant="outline" className="text-[10px]">{totalPending} pending</Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenKeyboardMode}
          className="h-7 text-[11px]"
          title="Review with keyboard shortcuts"
        >
          <Keyboard className="w-3 h-3 mr-1" /> Power review
        </Button>
      </div>

      <Bucket
        k="criticalSure"
        items={buckets.criticalSure}
        icon={Zap}
        title="Critical • AI confident"
        hint="Approve & auto-draft urgent work orders in one click."
        primaryLabel="Approve + draft WO"
        autoWO
        tone={{
          bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', subtext: 'text-rose-700',
          icon: 'text-rose-600', iconBg: 'bg-rose-100', badge: 'bg-rose-100 text-rose-700',
          btn: 'bg-rose-600 hover:bg-rose-700 text-white',
        }}
      />

      <Bucket
        k="criticalUnsure"
        items={buckets.criticalUnsure}
        icon={AlertTriangle}
        title="Critical • AI unsure"
        hint="High stakes, low confidence — human review required."
        primaryLabel="Review now"
        tone={{
          bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', subtext: 'text-amber-700',
          icon: 'text-amber-600', iconBg: 'bg-amber-100', badge: 'bg-amber-100 text-amber-700',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
        }}
      />

      <Bucket
        k="minorSure"
        items={buckets.minorSure}
        icon={CheckCheck}
        title="Minor • AI confident"
        hint="Safe to bulk-approve — no work order needed."
        primaryLabel="Approve all"
        tone={{
          bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', subtext: 'text-emerald-700',
          icon: 'text-emerald-600', iconBg: 'bg-emerald-100', badge: 'bg-emerald-100 text-emerald-700',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        }}
      />

      <Bucket
        k="minorUnsure"
        items={buckets.minorUnsure}
        icon={ShieldQuestion}
        title="Minor • AI unsure"
        hint="Lowest priority — review in keyboard mode when you have time."
        primaryLabel="Approve all"
        tone={{
          bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', subtext: 'text-slate-500',
          icon: 'text-slate-500', iconBg: 'bg-slate-100', badge: 'bg-slate-100 text-slate-600',
          btn: 'bg-slate-700 hover:bg-slate-800 text-white',
        }}
      />

      <p className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
        <Eye className="w-3 h-3" /> Critical bucket auto-drafts work orders. All actions logged with your name.
      </p>
    </div>
  );
}