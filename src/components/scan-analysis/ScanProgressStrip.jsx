import React from 'react';
import { Upload, Camera, Sparkles, ShieldCheck, Check } from 'lucide-react';

/**
 * Visual 4-step progress for a scan:
 *  Uploaded → Frames captured → AI analyzed → Certified (all findings reviewed)
 */
export default function ScanProgressStrip({ scan, frames = [], reports = [] }) {
  if (!scan) return null;

  const hasUpload = !!(scan.file_url || scan.preview_image_url);
  const hasFrames = frames.length > 0;
  const aiDone = hasFrames && frames.every((f) => f.analysis_status === 'completed' || f.analysis_status === 'failed');
  const allReviewed = reports.length > 0 && reports.every((r) => r.review_status && r.review_status !== 'pending');
  const certified = aiDone && allReviewed;

  const steps = [
    { label: 'Uploaded', icon: Upload, done: hasUpload },
    { label: `Frames (${frames.length})`, icon: Camera, done: hasFrames },
    { label: `AI analyzed (${reports.length})`, icon: Sparkles, done: aiDone },
    { label: 'Certified', icon: ShieldCheck, done: certified },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg shrink-0 ${
                step.done ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  step.done ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 min-w-[16px] ${steps[i + 1].done ? 'bg-green-300' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {certified && (
        <p className="mt-2 text-[11px] text-green-700 font-medium">
          ✓ All findings reviewed — this scan is certified.
        </p>
      )}
    </div>
  );
}