import { toJpeg } from 'html-to-image';

/**
 * Capture each slide of a deck as a JPEG data URL by driving the LIVE
 * presentation viewer one slide at a time. This is the only reliable way to
 * snapshot slides because they depend on framer-motion animations, fonts,
 * gradients, backdrop-blur and other CSS features that off-screen rendering
 * mangles.
 *
 * Requires:
 *   - The Presentation viewer is currently mounted.
 *   - A DOM node with [data-slide-capture] wrapping the visible slide.
 *   - A `setIndex(i)` function exposed by the viewer to advance slides.
 *
 * @param {object} opts
 * @param {number} opts.total            number of slides
 * @param {(i:number)=>void} opts.setIndex  jumps viewer to slide i
 * @param {(p:{current:number,total:number})=>void} [opts.onProgress]
 * @param {number} [opts.settleMs=900]   ms to wait after navigating before snapshot
 * @returns {Promise<string[]>} array of JPEG data URLs in slide order
 */
export async function captureDeck({ total, setIndex, onProgress, settleMs = 900 }) {
  const images = [];

  // Wait helper
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Wait for next animation frame (twice — once to flush React, once to flush paint)
  const nextFrame = () =>
    new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Wait for fonts to be ready (only blocks first slide)
  if (document?.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }

  for (let i = 0; i < total; i++) {
    setIndex(i);

    // Let React commit, framer-motion start, and the browser paint
    await nextFrame();
    await wait(settleMs);

    const node = document.querySelector('[data-slide-capture]');
    if (!node) {
      throw new Error('Slide capture target not found. Is the Presentation viewer mounted?');
    }

    // Wait for any <img> inside the slide to finish loading
    const imgs = Array.from(node.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
              // Safety timeout per image
              setTimeout(res, 2500);
            })
      )
    );

    // Snapshot
    const dataUrl = await toJpeg(node, {
      quality: 0.92,
      pixelRatio: 1,
      width: 1920,
      height: 1080,
      cacheBust: true,
      backgroundColor: '#000000',
      style: {
        // Force the node to render at exactly 1920x1080 regardless of viewport
        transform: 'none',
        transformOrigin: 'top left',
      },
    });

    images.push(dataUrl);
    onProgress?.({ current: i + 1, total });
  }

  return images;
}