import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Camera, Sparkles, Loader2, CheckCircle2, X, MapPin,
  AlertTriangle, RotateCcw, ChevronRight
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const GRADES = [
  { g: 1, label: 'Excellent', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
  { g: 2, label: 'Good', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
  { g: 3, label: 'Fair', bg: 'bg-amber-500', hover: 'hover:bg-amber-600' },
  { g: 4, label: 'Poor', bg: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  { g: 5, label: 'Failed', bg: 'bg-red-600', hover: 'hover:bg-red-700' },
];

export default function TinderInspectorCard({ asset, onSubmit, onSkip, position }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [grade, setGrade] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoQualityWarning, setPhotoQualityWarning] = useState(null);
  const fileRef = useRef(null);

  const handlePhoto = async (file) => {
    if (!file) return;
    setAiLoading(true);
    setPhotoQualityWarning(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);

      // AI pre-fill
      const { data } = await base44.functions.invoke('aiGradeAssetPhoto', {
        photo_url: file_url,
        asset_name: asset.name,
        asset_type: asset.specifications?.component_type || asset.type,
        current_grade: asset.specifications?.condition_grade,
      });

      if (data?.result) {
        setAiSuggestion(data.result);
        setGrade(data.result.condition_grade);
        if (data.result.defect_description && data.result.defect_type !== 'none') {
          setNote(data.result.defect_description);
        }
        if (data.result.photo_quality === 'poor') {
          setPhotoQualityWarning('Photo quality is poor — consider retaking for a more accurate AI assessment.');
        }
      }
    } catch (err) {
      toast.error('AI analysis failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const retakePhoto = () => {
    setPhotoUrl('');
    setAiSuggestion(null);
    setPhotoQualityWarning(null);
    fileRef.current?.click();
  };

  const submit = async () => {
    if (!grade) {
      toast.error('Pick a condition grade');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        asset,
        grade,
        photoUrl,
        note,
        aiSuggestion,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={asset.id}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50/40 to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                Asset {position.current} of {position.total}
              </div>
              <h2 className="font-bold text-slate-900 text-lg leading-tight">{asset.name}</h2>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin className="w-3 h-3" />
                {asset.location} · {asset.room || '—'}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onSkip} className="shrink-0 text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {asset.specifications?.condition_grade != null && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              Last graded: <strong className="text-slate-700">C{asset.specifications.condition_grade}</strong>
            </div>
          )}
        </div>

        {/* Photo area */}
        <div className="p-4">
          {!photoUrl && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-indigo-50/40 hover:border-indigo-300 transition-colors"
            >
              <Camera className="w-10 h-10 text-slate-400 mb-2" />
              <div className="font-semibold text-slate-700">Snap a photo</div>
              <div className="text-xs text-slate-500 mt-1">AI will auto-grade it</div>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
            className="hidden"
          />

          {photoUrl && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={photoUrl} alt="captured" className="w-full aspect-[4/3] object-cover" />
              <button
                onClick={retakePhoto}
                className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Retake
              </button>
              {aiLoading && (
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-white px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    AI analysing photo…
                  </div>
                </div>
              )}
            </div>
          )}

          {photoQualityWarning && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {photoQualityWarning}
            </div>
          )}

          {/* AI suggestion banner */}
          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-700 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3" /> AI suggests · {aiSuggestion.confidence}% confidence
              </div>
              <div className="text-sm text-slate-800 font-medium">
                Grade <strong>C{aiSuggestion.condition_grade}</strong> · {aiSuggestion.defect_type !== 'none' && (
                  <span className="capitalize">{aiSuggestion.defect_type.replace('_', ' ')}</span>
                )}
                {aiSuggestion.defect_type === 'none' && <span>No defects detected</span>}
              </div>
              <div className="text-xs text-slate-600 mt-1">{aiSuggestion.recommended_action}</div>
              {aiSuggestion.estimated_cost_aud > 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  Est. cost: <strong>${aiSuggestion.estimated_cost_aud.toLocaleString()}</strong>
                </div>
              )}
            </motion.div>
          )}

          {/* Grade picker */}
          <div className="mt-4">
            <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
              Condition Grade {aiSuggestion && <span className="text-indigo-500">(confirm or change)</span>}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {GRADES.map(({ g, label, bg, hover }) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`p-2.5 rounded-lg text-white font-bold transition-all ${bg} ${hover} ${
                    grade === g ? 'ring-4 ring-indigo-300 scale-105' : 'opacity-50'
                  }`}
                >
                  <div className="text-xl">C{g}</div>
                  <div className="text-[9px] mt-0.5 font-semibold">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cost-aware nudge */}
          {grade >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800"
            >
              <strong>Heads up:</strong> Grade {grade} will flag this for capital renewal
              {aiSuggestion?.estimated_cost_aud > 0 && ` (~$${aiSuggestion.estimated_cost_aud.toLocaleString()} est.)`}.
            </motion.div>
          )}

          {/* Optional note */}
          <div className="mt-3">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={submit}
            disabled={!grade || submitting}
            className="w-full mt-3 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Save & Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}