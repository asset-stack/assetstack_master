import React from 'react';
import { Camera, Sparkles, ClipboardCheck, CheckCircle2 } from 'lucide-react';

const steps = [
  { icon: Camera, title: '1. Upload real photo', text: 'Use a JPEG/PNG of the actual asset or area.' },
  { icon: Sparkles, title: '2. Run AI analysis', text: 'AI detects only visible defects in that photo.' },
  { icon: ClipboardCheck, title: '3. Verify report', text: 'Confirm, correct, or reject each highlighted issue.' },
  { icon: CheckCircle2, title: '4. Final record', text: 'Approved reports become trusted condition evidence.' },
];

export default function RealPhotoWorkflowGuide() {
  return (
    <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Real asset photo workflow</h2>
          <p className="text-sm text-slate-600">For the best condition report, start with Analyze Image and upload the real JPEG/photo of the asset.</p>
        </div>
        <div className="text-xs font-semibold text-indigo-700 bg-white/70 border border-indigo-100 rounded-full px-3 py-1 w-fit">
          Recommended path
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="bg-white/80 rounded-xl border border-white p-3">
              <Icon className="w-4 h-4 text-indigo-600 mb-2" />
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="text-xs text-slate-500 mt-1">{step.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}