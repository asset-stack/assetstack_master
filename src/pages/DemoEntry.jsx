import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Entry point for interactive demo links like /demo/snowyhydro.
// It records the demo slug, then reloads into the app so the whole
// session is locked to that demo's ClientAccount (full data isolation).
export default function DemoEntry() {
  const { demoSlug } = useParams();

  useEffect(() => {
    if (demoSlug) {
      sessionStorage.setItem('demo_slug', demoSlug);
      window.location.replace('/CommandCenter');
    }
  }, [demoSlug]);

  return (
    <div className="fixed inset-0 flex items-center justify-center text-slate-500">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        Loading demo…
      </div>
    </div>
  );
}