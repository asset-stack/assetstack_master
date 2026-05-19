import React, { useRef } from "react";

const IMG1 = "https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/78b1f1b84_1.png";
const IMG2 = "https://media.base44.com/images/public/69c1f3c7f9a453fedbd46eba/c85a8fdda_2.png";
const RADIUS = 240;

export default function HeroBanner({ pos }) {
  const containerRef = useRef(null);

  const maskStyle = pos
    ? {
        maskImage: `radial-gradient(circle ${RADIUS}px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 45%, black 85%, black 100%)`,
        WebkitMaskImage: `radial-gradient(circle ${RADIUS}px at ${pos.x}px ${pos.y}px, transparent 0%, transparent 45%, black 85%, black 100%)`,
      }
    : {};

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1 }}
    >
      {/* Layer 1 — sharp image underneath */}
      <img
        src={IMG1}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Layer 2 — pixelated image on top, masked away near cursor */}
      <img
        src={IMG2}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: "pixelated",
          transition: "mask-image 0.05s, -webkit-mask-image 0.05s",
          ...maskStyle,
        }}
      />

      {/* Dark overlay so text remains legible */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,30,0.35)", pointerEvents: "none" }} />
    </div>
  );
}