import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Layers, Zap, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'beta_ensemble_enabled';

export default function EnsembleToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const toggle = (value) => {
    setEnabled(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="w-5 h-5 text-purple-600" />
            Dual-Model Ensemble
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">EXPERIMENTAL</Badge>
        </div>
        <p className="text-xs text-slate-500">
          Run two independent vision models on every <span className="font-semibold">critical</span> finding.
          When they agree, confidence is much higher. When they disagree, it's escalated to a human.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between p-3 rounded-lg bg-purple-50 border border-purple-100">
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-purple-900">Enable for critical severity findings</div>
              <div className="text-xs text-purple-700 mt-1">
                Adds a second model pass on findings flagged <span className="font-mono">critical</span>.
                Expect ~10% extra cost, ~10pp accuracy lift.
              </div>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={toggle} />
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Beta:</span> the toggle is stored in your browser. The next iteration will
            wire this into <span className="font-mono">analyzeScanCondition</span> to actually run the second model
            and persist agreement/disagreement to the Accuracy Ledger.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}