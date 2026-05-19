import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit3, Sparkles, ShieldCheck, ClipboardCheck, CheckCircle2, Loader2, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import AnomalyEvidencePack from './AnomalyEvidencePack';

const severityColors = {
  minor: 'bg-blue-100 text-blue-700 border-blue-200',
  moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  major: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const anomalyTypes = [
  'scratch', 'dent', 'crack', 'corrosion', 'stain',
  'broken_part', 'missing_part', 'wear', 'water_damage',
  'graffiti', 'misalignment', 'other'
];

export default function AnomalyReviewCard({ report, onReviewed }) {
  const [mode, setMode] = useState(null); // 'correct' | 'assign' | null
  const [correctedType, setCorrectedType] = useState(report.anomaly_type);
  const [correctedSeverity, setCorrectedSeverity] = useState(report.severity);
  const [notes, setNotes] = useState(report.reviewer_notes || '');
  const [loading, setLoading] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);

  // Lightweight equipment list for re-assignment (cached across cards)
  const { data: equipmentList = [] } = useQuery({
    queryKey: ['equipmentMini'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
    staleTime: 60_000,
  });

  const handleReassign = async (newEquipmentId) => {
    if (newEquipmentId === report.equipment_id) return;
    setSavingAssign(true);
    try {
      const eq = equipmentList.find((e) => e.id === newEquipmentId);
      await base44.entities.ConditionReport.update(report.id, {
        equipment_id: newEquipmentId || null,
        equipment_name: eq?.name || '',
      });
      toast?.success?.(eq ? `Linked to ${eq.name}` : 'Unlinked');
      setMode(null);
      onReviewed && onReviewed();
    } catch (err) {
      toast?.error?.(`Could not link: ${err?.message || 'Unknown'}`);
    } finally {
      setSavingAssign(false);
    }
  };

  // Re-sync local state when the parent report record changes (e.g. after a save invalidates cache)
  useEffect(() => {
    setCorrectedType(report.anomaly_type);
    setCorrectedSeverity(report.severity);
    setNotes(report.reviewer_notes || '');
    setMode(null);
  }, [report.id, report.anomaly_type, report.severity, report.reviewer_notes, report.review_status]);

  const allowedSeverity = ['minor', 'moderate', 'major', 'critical'];

  const handleReview = async (status) => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const updates = {
        review_status: status,
        reviewed_by: status === 'pending' ? null : (user?.full_name || user?.email),
        reviewed_at: status === 'pending' ? null : new Date().toISOString(),
        reviewer_notes: notes,
      };
      if (status === 'corrected') {
        // Validate against enums before save
        const safeType = anomalyTypes.includes(correctedType) ? correctedType : 'other';
        const safeSeverity = allowedSeverity.includes(correctedSeverity) ? correctedSeverity : 'minor';
        updates.corrected_anomaly_type = safeType;
        updates.corrected_severity = safeSeverity;
        // Also update the primary fields so downstream displays/filters reflect the correction
        updates.anomaly_type = safeType;
        updates.severity = safeSeverity;
      }
      await base44.entities.ConditionReport.update(report.id, updates);
      toast?.success?.(
        status === 'approved' ? 'Verified as correct' :
        status === 'corrected' ? 'Saved correction — feeds back into model training' :
        status === 'pending' ? 'Reopened for review' :
        'Marked as not an issue'
      );
      setMode(null);
      onReviewed && onReviewed();
    } catch (err) {
      console.error('Review save failed:', err);
      toast?.error?.(`Could not save: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const bbox = report.bounding_box;
  const isReviewed = report.review_status && report.review_status !== 'pending';
  const statusLabel = report.review_status === 'approved' ? 'Verified as correct' :
    report.review_status === 'corrected' ? 'Verified with correction' :
    report.review_status === 'rejected' ? 'Marked as not an issue' :
    'Needs verification';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border rounded-xl overflow-hidden shadow-sm ${isReviewed ? 'border-green-200' : 'border-amber-300 ring-1 ring-amber-100'}`}
    >
      {/* Image with bounding box overlay */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {report.image_url ? (
          <img src={report.image_url} alt="Anomaly" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">No image</div>
        )}
        {bbox && (
          <div
            className="absolute border-2 border-red-500 bg-red-500/10 rounded"
            style={{
              left: `${(bbox.x || 0) * 100}%`,
              top: `${(bbox.y || 0) * 100}%`,
              width: `${(bbox.width || 0) * 100}%`,
              height: `${(bbox.height || 0) * 100}%`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
              AI detected: {report.anomaly_type?.replace(/_/g, ' ')}
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3" />
          AI {Math.round(report.ai_confidence || 0)}%
        </div>
      </div>

      <div className="p-4">
        <div className={`mb-3 rounded-lg border p-3 ${isReviewed ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start gap-2">
            {isReviewed ? <CheckCircle2 className="w-4 h-4 text-green-700 mt-0.5" /> : <ClipboardCheck className="w-4 h-4 text-amber-700 mt-0.5" />}
            <div className="flex-1">
              <p className={`text-sm font-bold ${isReviewed ? 'text-green-900' : 'text-amber-900'}`}>{statusLabel}</p>
              <p className={`text-xs mt-1 ${isReviewed ? 'text-green-700' : 'text-amber-700'}`}>
                {isReviewed
                  ? `Reviewed${report.reviewed_by ? ` by ${report.reviewed_by}` : ''}.`
                  : 'Inspect the highlighted photo, then choose: verify, correct, or reject.'}
              </p>
            </div>
            {!isReviewed && <Badge className="bg-amber-100 text-amber-800 border-amber-200">Action needed</Badge>}
          </div>
        </div>

        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="capitalize">{report.anomaly_type?.replace(/_/g, ' ')}</Badge>
              <Badge className={severityColors[report.severity] || severityColors.minor}>
                {report.severity} • score {report.condition_score}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <p className="text-xs text-slate-500">
                {report.equipment_name ? `on ${report.equipment_name}` : <span className="text-amber-700">Unassigned</span>}
              </p>
              <button
                type="button"
                onClick={() => setMode(mode === 'assign' ? null : 'assign')}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 underline underline-offset-2 flex items-center gap-0.5"
              >
                <Link2 className="w-3 h-3" /> {report.equipment_id ? 'change' : 'link asset'}
              </button>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">{report.ai_model_version}</Badge>
        </div>

        {mode === 'assign' && (
          <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-2">
            <p className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
              <Link2 className="w-3 h-3" /> Link this anomaly to an asset
            </p>
            <Select
              value={report.equipment_id || undefined}
              onValueChange={handleReassign}
              disabled={savingAssign}
            >
              <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="Pick asset…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {equipmentList.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="text-xs">{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {savingAssign && <p className="text-[10px] text-indigo-700">Saving…</p>}
          </div>
        )}

        {report.ai_description && (
          <p className="text-sm text-slate-700 mb-3 leading-relaxed">{report.ai_description}</p>
        )}

        {mode === 'correct' && (
          <div className="space-y-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Correct the AI
            </p>
            <Select value={correctedType} onValueChange={setCorrectedType}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {anomalyTypes.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={correctedSeverity} onValueChange={setCorrectedSeverity}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['minor', 'moderate', 'major', 'critical'].map((s) => (
                  <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Textarea
          placeholder="Optional verification notes, e.g. ‘confirmed crack on chair leg’ or ‘false detection’…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-xs mb-3 min-h-[60px]"
        />

        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            {isReviewed ? 'Change verification' : 'Verification action'}
          </span>
          <div className="flex items-center gap-1">
            <AnomalyEvidencePack report={report} equipment={equipmentList} />
            {isReviewed && (
              <button
                type="button"
                onClick={() => handleReview('pending')}
                disabled={loading}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline underline-offset-2"
              >
                Reopen
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading || isReviewed}
            onClick={() => handleReview('rejected')}
            className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <X className="w-3.5 h-3.5 mr-1" />} Not issue
          </Button>
          {mode !== 'correct' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={loading || isReviewed}
              onClick={() => setMode('correct')}
              className="text-amber-700 border-amber-200 hover:bg-amber-50 disabled:opacity-40"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Fix AI
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={loading || isReviewed}
              onClick={() => handleReview('corrected')}
              className="text-amber-700 border-amber-200 hover:bg-amber-50 disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null} Save
            </Button>
          )}
          <Button
            size="sm"
            disabled={loading || isReviewed}
            onClick={() => handleReview('approved')}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />} Verify
          </Button>
        </div>
      </div>
    </motion.div>
  );
}