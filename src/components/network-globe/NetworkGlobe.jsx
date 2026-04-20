import React, { useEffect, useRef, useState, useCallback } from 'react';
import createGlobe from 'cobe';
import { motion } from 'framer-motion';

// Convert lat/lng → 3D unit vector (to project markers into globe screen space)
function latLngToVec3(lat, lng) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

// Build a condition → color map (normalised 0-1 RGB for cobe markers)
const CONDITION_RGB = {
  operational: [0.25, 0.95, 0.6],   // emerald
  degraded:    [0.99, 0.75, 0.2],   // amber
  critical:    [0.98, 0.3, 0.35],   // rose
  maintenance: [0.35, 0.65, 0.98],  // blue
  offline:     [0.6, 0.65, 0.75],   // slate
};

/**
 * High-fidelity interactive WebGL globe.
 *
 * Props:
 *  - markers: [{ lat, lng, name, condition, ... }]
 *  - focus:   { lat, lng }  initial camera focus
 *  - onMarkerHover: (marker|null) => void
 *  - theme: 'dark' | 'light'
 */
export default function NetworkGlobe({
  markers = [],
  focus = { lat: 0, lng: 0 },
  onMarkerHover,
  theme = 'dark',
  autoRotate = true,
}) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef((focus.lng + 180) * (Math.PI / 180) - Math.PI);
  const thetaRef = useRef((-focus.lat) * (Math.PI / 180) * 0.6);
  const widthRef = useRef(0);
  const globeRef = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 600 });

  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Observe container for responsive canvas sizing
  useEffect(() => {
    if (!canvasRef.current) return;
    const el = canvasRef.current.parentElement;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      const s = Math.min(width, height);
      setSize({ w: s, h: s });
      widthRef.current = s;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build cobe marker payload
  const cobeMarkers = markers.map((m) => ({
    location: [m.lat, m.lng],
    size: m.condition === 'critical' ? 0.08 : m.condition === 'degraded' ? 0.065 : 0.05,
  }));

  // Create / recreate globe when size or theme changes
  useEffect(() => {
    if (!canvasRef.current || size.w === 0) return;

    const dark = theme === 'dark';
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: size.w * 2,
      height: size.h * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: dark ? 1 : 0,
      diffuse: dark ? 1.3 : 1.1,
      mapSamples: 16000,
      mapBrightness: dark ? 5 : 1.2,
      mapBaseBrightness: dark ? 0.05 : 0.9,
      baseColor: dark ? [0.12, 0.18, 0.32] : [0.95, 0.96, 0.99],
      markerColor: [0.38, 0.5, 1],
      glowColor: dark ? [0.45, 0.55, 1] : [0.75, 0.8, 1],
      opacity: 0.98,
      offset: [0, 0],
      markers: cobeMarkers,
      onRender: (state) => {
        if (autoRotate && !pointerInteracting.current) {
          phiRef.current += 0.0025;
        }
        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.width = size.w * 2;
        state.height = size.h * 2;
      },
    });

    globeRef.current = globe;

    // Fade-in canvas
    canvasRef.current.style.opacity = '0';
    requestAnimationFrame(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    });

    return () => globe.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, theme, JSON.stringify(cobeMarkers), autoRotate]);

  // Pointer / touch interaction
  const onPointerDown = (e) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    canvasRef.current.style.cursor = 'grabbing';
  };
  const onPointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };
  const onPointerMove = useCallback((e) => {
    // Drag rotate
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      phiRef.current = ((focus.lng + 180) * (Math.PI / 180) - Math.PI) + delta / 200;
    }

    // Hover detection (approximate — project each marker to screen and pick nearest)
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    const mx = e.clientX - cx;
    const my = e.clientY - cy;

    // Camera basis derived from current phi/theta
    const phi = phiRef.current;
    const theta = thetaRef.current;

    let best = null;
    let bestDist = 18; // px threshold

    for (const m of markers) {
      const v = latLngToVec3(m.lat, m.lng);
      // Rotate around Y by -phi, then around X by -theta (matches cobe internal rotation)
      const cosP = Math.cos(-phi), sinP = Math.sin(-phi);
      let x1 = v.x * cosP + v.z * sinP;
      let z1 = -v.x * sinP + v.z * cosP;
      const cosT = Math.cos(-theta), sinT = Math.sin(-theta);
      let y1 = v.y * cosT - z1 * sinT;
      let z2 = v.y * sinT + z1 * cosT;

      if (z2 < 0) continue; // back of globe

      const sx = x1 * radius;
      const sy = -y1 * radius;
      const d = Math.hypot(sx - mx, sy - my);
      if (d < bestDist) {
        bestDist = d;
        best = m;
        setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }

    if (best !== hoveredMarker) {
      setHoveredMarker(best);
      onMarkerHover && onMarkerHover(best);
    }
  }, [markers, hoveredMarker, onMarkerHover, focus.lng]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Radial glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.22) 0%, rgba(15,23,42,0) 60%)'
              : 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12) 0%, rgba(255,255,255,0) 60%)',
        }}
      />

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerUp}
        onMouseMove={onPointerMove}
        onTouchMove={(e) => e.touches[0] && onPointerMove(e.touches[0])}
        style={{
          width: size.w,
          height: size.h,
          cursor: 'grab',
          contain: 'layout paint size',
          opacity: 0,
          transition: 'opacity 0.8s ease-out',
        }}
      />

      {/* Hover tooltip */}
      {hoveredMarker && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.12 }}
          className="absolute pointer-events-none z-10"
          style={{
            left: hoverPos.x + 14,
            top: hoverPos.y + 14,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm text-white rounded-lg px-3 py-2 shadow-2xl border border-white/10 min-w-[160px]">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: `rgb(${(CONDITION_RGB[hoveredMarker.condition] || CONDITION_RGB.offline)
                    .map((c) => Math.round(c * 255))
                    .join(',')})`,
                }}
              />
              <span className="text-sm font-semibold">{hoveredMarker.name}</span>
            </div>
            {hoveredMarker.zone && (
              <p className="text-[11px] text-slate-400 mt-0.5">{hoveredMarker.zone}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1 capitalize">
              {hoveredMarker.condition}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
              {hoveredMarker.lat.toFixed(3)}°, {hoveredMarker.lng.toFixed(3)}°
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}