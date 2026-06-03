import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, Loader2, Inbox, Filter, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { scoreForSeverity } from '@/components/scan-analysis/severityScale';
import VerifyPhotoPane from '@/components/verify/VerifyPhotoPane';
import VerifyAIPanel from '@/components/verify/VerifyAIPanel';
import VerifySpreadsheetMatch from '@/components/verify/VerifySpreadsheetMatch';
import VerifyCorrectionForm from '@/components/verify/VerifyCorrectionForm';
import VerifyActionBar from '@/components/verify/VerifyActionBar';
import VerifyKeyboardHints from '@/components/verify/VerifyKeyboardHints';

export default function VerifyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState(null); // null | 'correct'
  const [correctedType, setCorrectedType] = useState('');
  const [correctedSeverity, setCorrectedSeverity] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ approved: 0, corrected: 0, rejected: 0 });
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [touchStart, setTouchStart] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const data = await secureEntity('ConditionReport').filter({ review_status: 'pending' }, '-created_date', 200);
    setReports(data);
    setIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const filtered = useMemo(() => {
    if (filterSeverity === 'all') return reports;
    return reports.filter((r) => r.severity === filterSeverity);
  }, [reports, filterSeverity]);

  const current = filtered[index] || null;

  // Reset local form state when card changes
  useEffect(() => {
    if (!current) return;
    setMode(null);
    setCorrectedType(current.anomaly_type || 'other');
    setCorrectedSeverity(current.severity || 'minor');
    setNotes('');
  }, [current?.id]);

  const handleAction = async (status) => {
    if (!current) return;
    if (status === 'rejected' && !notes.trim()) {
      toast.error('Add a short note explaining why this is not an issue.');
      return;
    }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const updates = {
        review_status: status,
        reviewed_by: user?.full_name || user?.email,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes,
      };
      if (status === 'corrected') {
        updates.corrected_anomaly_type = correctedType;
        updates.corrected_severity = correctedSeverity;
        updates.anomaly_type = correctedType;
        updates.severity = correctedSeverity;
        updates.condition_score = scoreForSeverity(correctedSeverity);
      }
      await secureEntity('ConditionReport').update(current.id, updates);

      setStats((s) => ({ ...s, [status === 'approved' ? 'approved' : status === 'corrected' ? 'corrected' : 'rejected']: s[status === 'approved' ? 'approved' : status === 'corrected' ? 'corrected' : 'rejected'] + 1 }));

      toast.success(
        status === 'approved' ? '✓ Approved' :
        status === 'corrected' ? '✓ Correction saved (trains the model)' :
        '✓ Marked as not an issue'
      );

      // Remove from list and advance
      setReports((rs) => rs.filter((r) => r.id !== current.id));
      // Keep index pointing to the next item naturally (filtered shrinks by 1)
      if (index >= filtered.length - 1) setIndex(Math.max(0, filtered.length - 2));
    } catch (err) {
      toast.error('Could not save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const advance = () => {
    if (index < filtered.length - 1) setIndex(index + 1);
  };
  const goBack = () => {
    if (index > 0) setIndex(index - 1);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (saving || !current) return;
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'textarea' || tag === 'input' || tag === 'select') return;
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        mode === 'correct' ? handleAction('corrected') : handleAction('approved');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setMode(mode === 'correct' ? null : 'correct');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleAction('rejected');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); advance();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); goBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, mode, saving, notes, correctedType, correctedSeverity, index, filtered.length]);

  // Swipe gestures (mobile)
  const onTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStart == null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 80) {
      delta < 0 ? advance() : goBack();
    }
    setTouchStart(null);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading verification queue…
      </div>
    );
  }

  const totalReviewed = stats.approved + stats.corrected + stats.rejected;

  // Empty state
  if (filtered.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">All caught up!</h2>
          <p className="text-sm text-slate-600 mb-4">
            {totalReviewed > 0
              ? `You verified ${totalReviewed} report${totalReviewed > 1 ? 's' : ''} this session.`
              : 'No reports are waiting for verification right now.'}
          </p>
          {totalReviewed > 0 && (
            <div className="flex justify-center gap-4 text-sm mb-4">
              <span className="text-emerald-700"><strong>{stats.approved}</strong> approved</span>
              <span className="text-amber-700"><strong>{stats.corrected}</strong> corrected</span>
              <span className="text-red-700"><strong>{stats.rejected}</strong> rejected</span>
            </div>
          )}
          <Button onClick={loadReports} variant="outline">
            Refresh queue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" /> Verify Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review AI findings · approve, fix, or reject · every action trains the model
          </p>
        </div>
        <VerifyKeyboardHints />
      </div>

      {/* Progress + filter */}
      <Card className="p-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-900">
            {index + 1} <span className="text-slate-400">of</span> {filtered.length}
          </div>
          <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${((index + 1) / filtered.length) * 100}%` }}
            />
          </div>
          {totalReviewed > 0 && (
            <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-2">
              <span className="text-emerald-600">✓{stats.approved}</span>
              <span className="text-amber-600">✎{stats.corrected}</span>
              <span className="text-red-600">✕{stats.rejected}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <Select value={filterSeverity} onValueChange={(v) => { setFilterSeverity(v); setIndex(0); }}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical only</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.18 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Left — photo */}
          <div className="space-y-3">
            <VerifyPhotoPane
              imageUrl={current.image_url}
              bbox={current.bounding_box}
              anomalyType={current.anomaly_type}
            />
          </div>

          {/* Right — AI suggestion + actions */}
          <div className="space-y-3">
            <VerifyAIPanel report={current} />

            <VerifySpreadsheetMatch report={current} />

            {mode === 'correct' && (
              <VerifyCorrectionForm
                type={correctedType}
                severity={correctedSeverity}
                onTypeChange={setCorrectedType}
                onSeverityChange={setCorrectedSeverity}
              />
            )}

            <Textarea
              placeholder="Notes — required when rejecting. E.g. 'confirmed crack' or 'shadow, not damage'…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />

            <VerifyActionBar
              onApprove={() => handleAction('approved')}
              onReject={() => handleAction('rejected')}
              onToggleCorrect={() => setMode(mode === 'correct' ? null : 'correct')}
              onSaveCorrection={() => handleAction('corrected')}
              onBack={goBack}
              onSkip={advance}
              mode={mode}
              loading={saving}
              canGoBack={index > 0}
              canGoForward={index < filtered.length - 1}
            />

            <div className="text-[10px] text-slate-400 text-center md:hidden">
              Swipe ← → to navigate
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}