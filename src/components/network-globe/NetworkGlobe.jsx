import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
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

// Map lat/lng to the target phi/theta that centres that point
function targetAngles(lat, lng) {
  return {
    phi: ((lng + 180) * (Math.PI / 180)) - Math.PI,
    theta: (-lat) * (Math.PI / 180) * 0.6,
  };
}

const CONDITION_RGB = {
  operational: [0.25, 0.95, 0.6],
  degraded:    [0.99, 0.75, 0.2],
  critical:    [0.98, 0.3, 0.35],
  maintenance: [0.35, 0.65, 0.98],
  offline:     [0.6, 0.65, 0.75],
};

/**
 * High-fidelity interactive WebGL globe with zoom, pause, fly-to, and
 * a phi/theta/size callback so overlays can render the network in sync.
 */
const NetworkGlobe = forwardRef(function NetworkGlobe(
  {
    markers = [],
    focus = { lat: 0, lng: 0 },
    onMarkerHover,
    theme = 'dark',
    autoRotate = true,
    zoom = 1, // 1 = default; higher = zoomed in (globe drawn bigger, clipped by container)
    onViewChange, // ({ phi, theta, size }) => void
  },
  ref
) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerStartPhi = useRef(0);
  const pointerStartTheta = useRef(0);

  const initial = targetAngles(focus.lat, focus.lng);
  const phiRef = useRef(initial.phi);
  const thetaRef = useRef(initial.theta);

  // fly-to target
  const targetPhiRef = useRef(null);
  const targetThetaRef = useRef(null);

  const globeRef = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 600 });

  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Expose imperative API
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng) => {
      const t = targetAngles(lat, lng);
      targetPhiRef.current = t.phi;
      targetThetaRef.current = t.theta;
    },
    getView: () => ({ phi: phiRef.current, theta: thetaRef.current }),
  }));

  // Observe container for responsive canvas sizing
  useEffect(() => {
    if (!canvasRef.current) return;
    const el = canvasRef.current.parentElement;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      const s = Math.min(width, height);
      setSize({ w: s, h: s });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build cobe marker payload
  const cobeMarkers = markers.map((m) => ({
    location: [m.lat, m.lng],
    size: m.condition === 'critical' ? 0.08 : m.condition === 'degraded' ? 0.065 : 0.05,
  }));

  // Emit view changes so overlays stay in sync (throttled via rAF)
  const emitRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current || size.w === 0) return;

    const dark = theme === 'dark';
    const drawSize = size.w * zoom;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: drawSize * 2,
      height: drawSize * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: dark ? 1 : 0,
      diffuse: dark ? 1.3 : 1.1,
      mapSamples: 20000,
      mapBrightness: dark ? 6 : 1.3,
      mapBaseBrightness: dark ? 0.05 : 0.9,
      baseColor: dark ? [0.12, 0.18, 0.32] : [0.95, 0.96, 0.99],
      markerColor: [0.38, 0.5, 1],
      glowColor: dark ? [0.45, 0.55, 1] : [0.75, 0.8, 1],
      opacity: 0.98,
      offset: [0, 0],
      markers: cobeMarkers,
      onRender: (state) => {
        // Ease toward fly-to target
        if (targetPhiRef.current !== null) {
          const dp = targetPhiRef.current - phiRef.current;
          const dt = targetThetaRef.current - thetaRef.current;
          if (Math.abs(dp) < 0.002 && Math.abs(dt) < 0.002) {
            phiRef.current = targetPhiRef.current;
            thetaRef.current = targetThetaRef.current;
            targetPhiRef.current = null;
            targetThetaRef.current = null;
          } else {
            phiRef.current += dp * 0.08;
            thetaRef.current += dt * 0.08;
          }
        } else if (autoRotate && !pointerInteracting.current) {
          phiRef.current += 0.0025;
        }

        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.width = drawSize * 2;
        state.height = drawSize * 2;

        // Throttle view change emission
        const now = performance.now();
        if (onViewChange && now - emitRef.current > 16) {
          emitRef.current = now;
          onViewChange({
            phi: phiRef.current,
            theta: thetaRef.current,
            size: drawSize,
          });
        }
      },
    });

    globeRef.current = globe;

    canvasRef.current.style.opacity = '0';
    requestAnimationFrame(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    });

    return () => globe.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, theme, JSON.stringify(cobeMarkers), autoRotate, zoom]);

  // Pointer interaction — rotate both phi (horizontal) and theta (vertical)
  const onPointerDown = (e) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    pointerStartPhi.current = phiRef.current;
    pointerStartTheta.current = thetaRef.current;
    canvasRef.current.style.cursor = 'grabbing';
    // Cancel any active fly-to on manual interaction
    targetPhiRef.current = null;
    targetThetaRef.current = null;
  };
  const onPointerUp = () => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  const onPointerMove = useCallback((e) => {
    if (pointerInteracting.current !== null) {
      const dx = e.clientX - pointerInteracting.current.x;
      const dy = e.clientY - pointerInteracting.current.y;
      phiRef.current = pointerStartPhi.current + dx / (200 * zoom);
      thetaRef.current = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, pointerStartTheta.current + dy / (200 * zoom))
      );
    }

    // Hover detection
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    const mx = e.clientX - cx;
    const my = e.clientY - cy;

    const phi = phiRef.current;
    const theta = thetaRef.current;

    let best = null;
    let bestDist = 18;

    for (const m of markers) {
      const v = latLngToVec3(m.lat, m.lng);
      const cosP = Math.cos(-phi), sinP = Math.sin(-phi);
      const x1 = v.x * cosP + v.z * sinP;
      const z1 = -v.x * sinP + v.z * cosP;
      const cosT = Math.cos(-theta), sinT = Math.sin(-theta);
      const y1 = v.y * cosT - z1 * sinT;
      const z2 = v.y * sinT + z1 * cosT;

      if (z2 < 0) continue;

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
  }, [markers, hoveredMarker, onMarkerHover, zoom]);

  const drawSize = size.w * zoom;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
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
          width: drawSize,
          height: drawSize,
          cursor: 'grab',
          contain: 'layout paint size',
          opacity: 0,
          transition: 'opacity 0.8s ease-out, width 0.4s ease, height 0.4s ease',
        }}
      />

      {/* Hover tooltip */}
      {hoveredMarker && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.12 }}
          className="absolute pointer-events-none z-20"
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
            <p className="text-[10px] text-slate-500 mt-1 capitalize">{hoveredMarker.condition}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
              {hoveredMarker.lat.toFixed(4)}°, {hoveredMarker.lng.toFixed(4)}°
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
});

export default NetworkGlobe;