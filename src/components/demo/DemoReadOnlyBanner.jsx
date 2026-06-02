import React from 'react';
import { Eye } from 'lucide-react';
import { isDemoSession } from '@/lib/demoMode';

// Thin banner shown only inside a locked /demo/<slug> session to make it clear
// the environment is a read-only showcase.
export default function DemoReadOnlyBanner() {
  if (!isDemoSession()) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] w-full bg-amber-500 text-amber-950 text-xs font-semibold flex items-center justify-center gap-2 py-1 px-3">
      <Eye className="w-3.5 h-3.5" />
      <span>Read-only demo environment — changes are disabled</span>
    </div>
  );
}