import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit3, Sparkles, ShieldCheck, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [mode, setMode] = useState(null); // 'correct' | null
  const [correctedType, setCorrectedType] = useState(report.anomaly_type);
  const [correctedSeverity, setCorrectedSeverity] = useState(report.severity);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const allowedSeverity = ['minor', 'moderate', 'major', 'critical'];

  const handleReview = async (status) => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const updates = {
        review_status: status,
        reviewed_by: user?.full_name || user?.email,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes,
      };
      if (status === 'corrected') {
        // Validate against enums before save
        updates.corrected_anomaly_type = anomalyTypes.includes(correctedType) ? correctedType : 'other';
        updates.corrected_severity = allowedSeverity.includes(correctedSeverity) ? correctedSeverity : 'minor';
      }
      await base44.entities.ConditionReport.update(report.id, updates);
      onReviewed && onReviewed();
    } catch (err) {
      console.error('Review save failed:', err);
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
            {report.equipment_name && (
              <p className="text-xs text-slate-500 mt-1">on {report.equipment_name}</p>
            )}
          </div>
          <Badge variant="outline" className="text-[10px]">{report.ai_model_version}</Badge>
        </div>

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

        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Verification action
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => handleReview('rejected')}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Not issue
          </Button>
          {mode !== 'correct' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => setMode('correct')}
              className="text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Fix AI
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => handleReview('corrected')}
              className="text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              Save
            </Button>
          )}
          <Button
            size="sm"
            disabled={loading}
            onClick={() => handleReview('approved')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Verify
          </Button>
        </div>
      </div>
    </motion.div>
  );
}