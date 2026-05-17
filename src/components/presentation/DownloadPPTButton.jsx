import React, { useState } from 'react';
import { Presentation as PresentationIcon, Loader2 } from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { captureDeck } from '@/lib/deckCapture';
import ExportProgressOverlay from './ExportProgressOverlay';

/**
 * Exports the deck as a 16:9 .pptx by capturing the LIVE slide viewer one
 * slide at a time and embedding each frame as a full-bleed image.
 */
export default function DownloadPPTButton({ deck, total, setIndex }) {
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

      // pptxgenjs ships as both a class and a default export; handle either shape
      const PptxCtor = pptxgen.default || pptxgen;
      const pptx = new PptxCtor();
      pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 inches = 16:9
      pptx.title = total > 20 ? 'AssetStack Platform Tour' : 'AssetStack Boardroom';
      pptx.company = 'AssetStack';

      images.forEach((img) => {
        const s = pptx.addSlide();
        s.background = { color: '000000' };
        s.addImage({ data: img, x: 0, y: 0, w: 13.333, h: 7.5 });
      });

      const name = total > 20 ? 'AssetStack-Platform-Tour.pptx' : 'AssetStack-Boardroom.pptx';
      await pptx.writeFile({ fileName: name });
    } catch (err) {
      console.error('PPT export failed:', err);
      alert('PPT export failed: ' + (err?.message || 'unknown error'));
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
        className="h-9 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-70 text-white flex items-center gap-2 text-xs font-bold transition-colors hidden"
        title="Download as PowerPoint">
        
        {busy ?
        <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline tabular-nums">
              {progress.current}/{progress.total}
            </span>
          </> :

        <>
            <PresentationIcon className="w-4 h-4" />
            <span className="hidden sm:inline">PPT</span>
          </>
        }
      </button>
      {busy &&
      <ExportProgressOverlay
        label="Exporting PowerPoint"
        current={progress.current}
        total={progress.total} />

      }
    </>);

}