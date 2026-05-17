import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DECK } from './deck';

/**
 * Renders each slide off-screen at 1920x1080, snapshots it to canvas,
 * and assembles a 16:9 landscape multi-page PDF.
 */
export default function DownloadDeckButton({ chapters, onJumpStub }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    setProgress({ current: 0, total: DECK.length });

    // Off-screen 1920x1080 stage
    const stage = document.createElement('div');
    stage.style.cssText =
      'position:fixed;left:-99999px;top:0;width:1920px;height:1080px;background:#000;z-index:-1;pointer-events:none;';
    document.body.appendChild(stage);

    // We render each slide into stage using ReactDOM's createRoot for proper React rendering.
    const { createRoot } = await import('react-dom/client');
    const root = createRoot(stage);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1920, 1080],
      compress: true,
    });

    try {
      for (let i = 0; i < DECK.length; i++) {
        const slide = DECK[i];
        const SlideComp = slide.Component;

        // Render the slide
        await new Promise((resolve) => {
          root.render(
            <div style={{ width: 1920, height: 1080 }}>
              {slide.dynamic ? (
                <SlideComp chapters={chapters.slice(2)} onJump={onJumpStub} />
              ) : (
                <SlideComp />
              )}
            </div>
          );
          // Wait for layout + animations to settle
          setTimeout(resolve, 500);
        });

        const canvas = await html2canvas(stage, {
          width: 1920,
          height: 1080,
          scale: 1,
          useCORS: true,
          backgroundColor: '#000',
          logging: false,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        if (i > 0) pdf.addPage([1920, 1080], 'landscape');
        pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080, undefined, 'FAST');

        setProgress({ current: i + 1, total: DECK.length });
      }

      pdf.save('AssetStack-Platform-Tour.pdf');
    } finally {
      root.unmount();
      document.body.removeChild(stage);
      setBusy(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white flex items-center gap-2 text-xs font-bold transition-colors"
      title="Download as PDF"
    >
      {busy ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline tabular-nums">
            {progress.current}/{progress.total}
          </span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
        </>
      )}
    </button>
  );
}