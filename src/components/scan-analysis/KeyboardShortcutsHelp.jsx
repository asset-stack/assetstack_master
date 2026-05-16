import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

/**
 * Keyboard shortcut help — surfaces the speed-mode hotkeys.
 * Inspired by GitHub/Linear's `?` shortcut convention.
 */
const SHORTCUTS = [
  { keys: ['A'], action: 'Approve current finding' },
  { keys: ['R'], action: 'Reject (not an issue)' },
  { keys: ['C'], action: 'Open correction dialog' },
  { keys: ['→', 'J'], action: 'Next finding' },
  { keys: ['←', 'K'], action: 'Previous finding' },
  { keys: ['Esc'], action: 'Exit keyboard mode' },
  { keys: ['?'], action: 'Show this help' }
];

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // ignore if typing in input/textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-slate-500 hover:text-slate-900 h-8"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-3.5 h-3.5" />
        <span className="text-[11px]">Shortcuts</span>
        <kbd className="ml-1 px-1.5 py-0.5 text-[9px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-600">
          ?
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {SHORTCUTS.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm text-slate-700">{s.action}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, j) => (
                    <React.Fragment key={j}>
                      {j > 0 && (
                        <span className="text-[10px] text-slate-400">or</span>
                      )}
                      <kbd className="px-2 py-1 text-[11px] font-mono bg-slate-100 border border-slate-200 rounded-md text-slate-700 shadow-sm">
                        {k}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center">
            Press <kbd className="px-1 bg-slate-100 rounded text-slate-600">?</kbd>{' '}
            anytime to open this panel
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}