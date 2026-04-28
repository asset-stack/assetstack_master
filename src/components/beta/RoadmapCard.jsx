import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, CheckCircle2, Circle } from 'lucide-react';

const items = [
  { done: true, title: 'Prediction Accuracy entity', desc: 'Every AI call logged with model version, confidence, and outcome.' },
  { done: true, title: 'Live accuracy dashboard', desc: 'Per-model-version verified accuracy, updated in real time.' },
  { done: true, title: 'Image quality gate', desc: 'Client-side brightness/contrast/sharpness scoring before AI runs.' },
  { done: false, title: 'Dual-model ensemble in analyzeScanCondition', desc: 'Run a second model on critical findings and persist agreement.' },
  { done: false, title: 'Calibration curves', desc: 'Verify "80% confidence" is right 80% of the time.' },
  { done: false, title: 'Golden dataset benchmarking', desc: 'Fixed expert-labeled set; every model release tested against it.' },
  { done: false, title: 'Verified Savings Ledger', desc: 'Tie predictions → actions → outcomes → dollars saved.' },
  { done: false, title: 'Physics-based guardrails', desc: 'Reject impossible sensor readings & predictions automatically.' },
];

export default function RoadmapCard() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="w-5 h-5 text-indigo-600" />
          Accuracy Engine Roadmap
        </CardTitle>
        <p className="text-xs text-slate-500">
          The path to demonstrably more accurate than any competitor — with a verifiable audit trail.
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${item.done ? 'text-slate-900' : 'text-slate-600'}`}>
                    {item.title}
                  </span>
                  {item.done && <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px]">SHIPPED</Badge>}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}