import React from 'react';

/**
 * Dithered WebGL banner background for the MechanismSection.
 * Embeds the prebuilt HTML banner in an iframe so the original Three.js
 * shader (with its embedded texture and Bayer-matrix dither) runs untouched.
 */
export default function MechanismBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
      <iframe
        src="https://media.base44.com/files/public/6a0a6a5d4d043b0e41a16d90/8696cb5ef_Dave_Banner1.html"
        title="AssetStack dither banner"
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        scrolling="no"
        aria-hidden="true"
      />
      {/* Soft fade so foreground text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950/70" />
    </div>
  );
}