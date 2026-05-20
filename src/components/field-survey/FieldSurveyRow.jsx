import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, Edit3, Camera, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const GRADES = [
  { g: 1, label: 'Excellent', bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-100' },
  { g: 2, label: 'Good', bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
  { g: 3, label: 'Fair', bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-100' },
  { g: 4, label: 'Poor', bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
  { g: 5, label: 'Failed', bg: 'bg-red-600', text: 'text-red-700', light: 'bg-red-100' },
];

const getGradeMeta = (g) => GRADES.find((x) => x.g === g) || null;

export default function FieldSurveyRow({ asset, onSubmit }) {
  const currentGrade = asset.specifications?.condition_grade;
  const reportedCondition = asset.specifications?.condition; // e.g. "Good Condition"
  const meta = getGradeMeta(currentGrade);

  const [expanded, setExpanded] = useState(false);
  const [newGrade, setNewGrade] = useState(currentGrade || null);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    if (!currentGrade) return;
    setSubmitting(true);
    try {
      await onSubmit({ asset, grade: currentGrade, note: 'Verified — no change', photoUrl: '', verified_only: true });
      setVerified(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoto = async (file, uploadFn) => {
    if (!file) return;
    const url = await uploadFn(file);
    setPhotoUrl(url);
  };

  const saveEdit = async () => {
    if (!newGrade) return;
    setSubmitting(true);
    try {
      await onSubmit({ asset, grade: newGrade, note, photoUrl, verified_only: false });
      setVerified(true);
      setExpanded(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.6 }}
        className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center gap-2"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">{asset.name}</div>
          <div className="text-[11px] text-emerald-700">Verified · C{newGrade || currentGrade}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {/* Compact row — always visible */}
      <div className="p-3 flex items-start gap-3">
        {/* Grade badge */}
        <div className="shrink-0">
          {meta ? (
            <div className={`w-12 h-12 rounded-lg ${meta.bg} text-white flex flex-col items-center justify-center font-bold`}>
              <div className="text-base leading-none">C{currentGrade}</div>
              <div className="text-[8px] font-semibold mt-0.5">{meta.label.slice(0, 4)}</div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">{asset.name}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{asset.location} · {asset.room || asset.specifications?.room_location || '—'}</span>
          </div>
          {reportedCondition && (
            <div className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${meta?.light || 'bg-slate-100'} ${meta?.text || 'text-slate-600'} font-medium`}>
              {reportedCondition}
            </div>
          )}
          {!currentGrade && (
            <div className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
              Not graded yet
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {currentGrade && !expanded && (
            <Button
              size="sm"
              onClick={verify}
              disabled={submitting}
              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Verify</>}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            disabled={submitting}
            className="h-8 px-2.5 text-xs"
          >
            {expanded ? <><X className="w-3 h-3 mr-1" />Cancel</> : <><Edit3 className="w-3 h-3 mr-1" />{currentGrade ? 'Fix' : 'Grade'}</>}
          </Button>
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-slate-100 p-3 bg-slate-50/60 space-y-3"
        >
          <div>
            <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">
              New grade
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {GRADES.map(({ g, label, bg }) => (
                <button
                  key={g}
                  onClick={() => setNewGrade(g)}
                  className={`p-2 rounded-lg text-white font-bold transition-all ${bg} ${
                    newGrade === g ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105' : 'opacity-60'
                  }`}
                >
                  <div className="text-base leading-none">C{g}</div>
                  <div className="text-[8px] mt-0.5">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setSubmitting(true);
                  try {
                    const { base44 } = await import('@/api/base44Client');
                    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
                    setPhotoUrl(file_url);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              />
              <div className={`h-10 rounded-lg border text-xs flex items-center justify-center gap-1.5 ${photoUrl ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                <Camera className="w-3.5 h-3.5" /> {photoUrl ? 'Photo added' : 'Add photo'}
              </div>
            </label>
            <Button
              onClick={saveEdit}
              disabled={!newGrade || newGrade === currentGrade && !note && !photoUrl ? false : false || submitting || !newGrade}
              className="h-10 bg-indigo-600 hover:bg-indigo-700 text-xs"
            >
              {submitting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
              Save
            </Button>
          </div>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes (optional)…"
            rows={2}
            className="text-xs resize-none bg-white"
          />
        </motion.div>
      )}
    </div>
  );
}