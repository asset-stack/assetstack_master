import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { captureDeck } from '@/lib/deckCapture';
import ExportProgressOverlay from './ExportProgressOverlay';

/**
 * Exports the deck as a 16:9 PDF by capturing the LIVE slide viewer one
 * slide at a time. Requires the parent to pass `total` and `setIndex` so
 * we can drive the viewer.
 */
export default function DownloadDeckButton({ deck, total, setIndex }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    setProgress({ current: 0, total });

    try {
      const images = await captureDeck({
        total,
        setIndex,
        onProgress: setProgress
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080],
        compress: true
      });

      images.forEach((img, i) => {
        if (i > 0) pdf.addPage([1920, 1080], 'landscape');
        pdf.addImage(img, 'JPEG', 0, 0, 1920, 1080, undefined, 'FAST');
      });

      const name = total > 20 ? 'AssetStack-Platform-Tour.pdf' : 'AssetStack-Boardroom.pdf';
      pdf.save(name);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed: ' + (err?.message || 'unknown error'));
    } finally {
      setBusy(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={busy}
        className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white flex items-center gap-2 text-xs font-bold transition-colors hidden"
        title="Download as PDF">
        
        {busy ?
        <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline tabular-nums">
              {progress.current}/{progress.total}
            </span>
          </> :

        <>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </>
        }
      </button>
      {busy &&
      <ExportProgressOverlay
        label="Exporting PDF"
        current={progress.current}
        total={progress.total} />

      }
    </>);

}