import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Edit3, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function VerifyActionBar({
  onApprove, onReject, onToggleCorrect, onSaveCorrection,
  onBack, onSkip, mode, loading, canGoBack, canGoForward,
}) {
  return (
    <div className="space-y-2">
      {/* Primary actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={onReject}
          disabled={loading}
          variant="outline"
          className="h-14 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold flex-col gap-0.5"
        >
          <X className="w-5 h-5" />
          <div className="text-xs">Reject</div>
          <kbd className="text-[9px] text-slate-400 font-mono">R</kbd>
        </Button>

        {mode !== 'correct' ? (
          <Button
            onClick={onToggleCorrect}
            disabled={loading}
            variant="outline"
            className="h-14 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-semibold flex-col gap-0.5"
          >
            <Edit3 className="w-5 h-5" />
            <div className="text-xs">Fix AI</div>
            <kbd className="text-[9px] text-slate-400 font-mono">F</kbd>
          </Button>
        ) : (
          <Button
            onClick={onSaveCorrection}
            disabled={loading}
            className="h-14 bg-amber-500 hover:bg-amber-600 text-white font-semibold flex-col gap-0.5"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            <div className="text-xs">Save Fix</div>
            <kbd className="text-[9px] text-white/70 font-mono">A</kbd>
          </Button>
        )}

        <Button
          onClick={onApprove}
          disabled={loading}
          className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex-col gap-0.5"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          <div className="text-xs">Approve</div>
          <kbd className="text-[9px] text-white/70 font-mono">A</kbd>
        </Button>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onBack}
          disabled={!canGoBack || loading}
          variant="ghost"
          size="sm"
          className="flex-1 text-slate-500 text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <Button
          onClick={onSkip}
          disabled={!canGoForward || loading}
          variant="ghost"
          size="sm"
          className="flex-1 text-slate-500 text-xs"
        >
          Skip <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}