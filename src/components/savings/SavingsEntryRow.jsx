import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertTriangle, Clock, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const STATUS_CONFIG = {
  projected:   { icon: Clock,         color: 'bg-amber-100 text-amber-800 border-amber-200',     label: 'Projected' },
  in_progress: { icon: Clock,         color: 'bg-blue-100 text-blue-800 border-blue-200',         label: 'In Progress' },
  verified:    { icon: CheckCircle2,  color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Verified' },
  disputed:    { icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200',             label: 'Disputed' },
  rejected:    { icon: XCircle,       color: 'bg-slate-200 text-slate-700 border-slate-300',       label: 'Rejected' },
};

export default function SavingsEntryRow({ entry, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [method, setMethod] = useState(entry.verification_method || 'post_action_inspection');
  const [notes, setNotes] = useState(entry.verification_notes || '');
  const [actualSavings, setActualSavings] = useState(
    entry.verified_savings ?? ((entry.predicted_failure_cost || 0) - (entry.intervention_cost || 0))
  );

  const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.projected;
  const Icon = cfg.icon;
  const projectedSavings = (entry.predicted_failure_cost || 0) - (entry.intervention_cost || 0);

  const verify = async (newStatus) => {
    setVerifying(true);
    const me = await base44.auth.me();
    await base44.entities.SavingsLedgerEntry.update(entry.id, {
      status: newStatus,
      verification_method: method,
      verification_notes: notes,
      verified_savings: newStatus === 'verified' ? Number(actualSavings) : 0,
      verified_by: me?.email,
      verified_at: new Date().toISOString(),
    });
    setVerifying(false);
    setExpanded(false);
    onUpdated?.();
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm truncate">{entry.title}</span>
            <Badge className={`${cfg.color} text-[10px] border`}>
              <Icon className="w-3 h-3 mr-1" />
              {cfg.label}
            </Badge>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
            {entry.equipment_name && <span>📦 {entry.equipment_name}</span>}
            <span className="capitalize">🎯 {entry.trigger_source?.replace(/_/g, ' ')}</span>
            <span>{format(new Date(entry.created_date), 'MMM d, yyyy')}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-base font-bold ${entry.status === 'verified' ? 'text-emerald-700' : 'text-slate-700'}`}>
            {fmt(entry.status === 'verified' ? entry.verified_savings : projectedSavings)}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            {entry.status === 'verified' ? 'verified' : 'projected'}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Predicted Failure Cost</div>
              <div className="text-lg font-bold text-red-700 mt-1">{fmt(entry.predicted_failure_cost)}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Intervention Cost</div>
              <div className="text-lg font-bold text-slate-700 mt-1">{fmt(entry.intervention_cost)}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-3">
              <div className="text-[10px] text-emerald-600 uppercase tracking-wider">Net Savings</div>
              <div className="text-lg font-bold text-emerald-700 mt-1">{fmt(projectedSavings)}</div>
            </div>
          </div>

          {entry.status === 'verified' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Verified by {entry.verified_by}
              </div>
              {entry.verified_at && (
                <div className="text-xs text-emerald-700 mt-0.5">
                  {format(new Date(entry.verified_at), 'PPp')} • via {entry.verification_method?.replace(/_/g, ' ')}
                </div>
              )}
              {entry.verification_notes && (
                <div className="text-xs text-emerald-800 mt-2 italic">"{entry.verification_notes}"</div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Verification Method</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post_action_inspection">Post-action inspection</SelectItem>
                    <SelectItem value="sensor_confirmation">Sensor confirmation</SelectItem>
                    <SelectItem value="expert_review">Expert review</SelectItem>
                    <SelectItem value="historical_comparison">Historical comparison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Actual Verified Savings (USD)
                </label>
                <input
                  type="number"
                  value={actualSavings}
                  onChange={(e) => setActualSavings(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Verification Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Evidence, sensor readings, inspection results…"
                  className="text-sm min-h-[70px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => verify('verified')}
                  disabled={verifying}
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  size="sm"
                >
                  {verifying ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                  Verify
                </Button>
                <Button onClick={() => verify('disputed')} disabled={verifying} variant="outline" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" /> Dispute
                </Button>
                <Button onClick={() => verify('rejected')} disabled={verifying} variant="outline" size="sm">
                  <XCircle className="w-4 h-4 mr-1.5 text-slate-500" /> Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}