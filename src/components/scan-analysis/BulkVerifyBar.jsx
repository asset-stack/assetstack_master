import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, CheckCheck } from 'lucide-react';

// Quick bulk-verify bar for high-confidence pending findings.
// Approves all reports above the confidence threshold in one click.
export default function BulkVerifyBar({ reports = [], onDone, threshold = 90 }) {
  const [busy, setBusy] = useState(false);

  const highConfPending = reports.filter(
    (r) => r.review_status === 'pending' && (r.ai_confidence || 0) >= threshold
  );

  if (highConfPending.length < 2) return null;

  const handleBulkApprove = async () => {
    setBusy(true);
    const user = await base44.auth.me();
    const reviewer = user?.full_name || user?.email || 'bulk';
    const ts = new Date().toISOString();

    // Parallel batches of 10
    const batchSize = 10;
    for (let i = 0; i < highConfPending.length; i += batchSize) {
      const batch = highConfPending.slice(i, i + batchSize);
      await Promise.all(
        batch.map((r) =>
          secureEntity('ConditionReport').update(r.id, {
            review_status: 'approved',
            reviewed_by: reviewer,
            reviewed_at: ts,
            reviewer_notes: `Bulk-approved (AI confidence ≥ ${threshold}%)`,
          }).catch(() => null)
        )
      );
    }
    setBusy(false);
    onDone && onDone();
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xs text-indigo-900">
        <CheckCheck className="w-4 h-4 text-indigo-600" />
        <span><span className="font-bold">{highConfPending.length}</span> high-confidence findings (≥{threshold}%) ready for bulk verify</span>
      </div>
      <Button
        size="sm"
        disabled={busy}
        onClick={handleBulkApprove}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7"
      >
        {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
        Approve all
      </Button>
    </div>
  );
}