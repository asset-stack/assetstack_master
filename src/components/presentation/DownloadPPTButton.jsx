import React, { useState } from 'react';
import { Presentation as PresentationIcon, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import PptxGenJS from 'pptxgenjs';
import { BOARDROOM_DECK } from './deck';

/**
 * Renders each slide off-screen at 1920x1080, snapshots it to canvas,
 * and embeds each as a full-bleed image into a 16:9 .pptx file.
 */
export default function DownloadPPTButton({ deck = BOARDROOM_DECK, chapters, onJumpStub }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    setProgress({ current: 0, total: deck.length });

    const stage = document.createElement('div');
    stage.style.cssText =
      'position:fixed;left:-99999px;top:0;width:1920px;height:1080px;background:#000;z-index:-1;pointer-events:none;';
    document.body.appendChild(stage);

    const { createRoot } = await import('react-dom/client');
    const root = createRoot(stage);

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 inches = 16:9
    pptx.title = deck.length > 20 ? 'AssetStack Platform Tour' : 'AssetStack Boardroom';
    pptx.company = 'AssetStack';

    try {
      for (let i = 0; i < deck.length; i++) {
        const slide = deck[i];
        const SlideComp = slide.Component;

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

        const pptSlide = pptx.addSlide();
        pptSlide.background = { color: '000000' };
        pptSlide.addImage({ data: imgData, x: 0, y: 0, w: 13.333, h: 7.5 });

        setProgress({ current: i + 1, total: deck.length });
      }

      const name = deck.length > 20 ? 'AssetStack-Platform-Tour.pptx' : 'AssetStack-Boardroom.pptx';
      await pptx.writeFile({ fileName: name });
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
      className="h-9 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-70 text-white flex items-center gap-2 text-xs font-bold transition-colors"
      title="Download as PowerPoint"
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
          <PresentationIcon className="w-4 h-4" />
          <span className="hidden sm:inline">PPT</span>
        </>
      )}
    </button>
  );
}