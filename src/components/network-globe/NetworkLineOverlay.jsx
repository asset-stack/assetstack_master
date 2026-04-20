import React, { useEffect, useRef, useState } from 'react';

// Project a lat/lng to 2D screen coordinates given the globe's current phi/theta.
// This is an approximation of cobe's projection — good enough for rendering
// railway line segments over the globe canvas.
function project(lat, lng, phi, theta, radius) {
  const phiRad = (90 - lat) * (Math.PI / 180);
  const thetaRad = (lng + 180) * (Math.PI / 180);
  const vx = -Math.sin(phiRad) * Math.cos(thetaRad);
  const vy = Math.cos(phiRad);
  const vz = Math.sin(phiRad) * Math.sin(thetaRad);

  const cosP = Math.cos(-phi), sinP = Math.sin(-phi);
  const x1 = vx * cosP + vz * sinP;
  const z1 = -vx * sinP + vz * cosP;
  const cosT = Math.cos(-theta), sinT = Math.sin(-theta);
  const y1 = vy * cosT - z1 * sinT;
  const z2 = vy * sinT + z1 * cosT;

  return {
    x: x1 * radius,
    y: -y1 * radius,
    visible: z2 > -0.05, // cull far side
    depth: z2,
  };
}

/**
 * Animated line overlay that draws the network (train line) on top of the globe.
 * Uses an SVG layer that follows the globe rotation.
 */
export default function NetworkLineOverlay({
  stations = [],
  phi = 0,
  theta = 0,
  size = 600,
  color = '#6366f1',
  label = 'T1 Western Line',
}) {
  const [dash, setDash] = useState(0);

  // Animate the dash offset so the line pulses along its path
  useEffect(() => {
    let raf;
    const tick = () => {
      setDash((d) => (d - 1) % 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const radius = size / 2;
  const cx = size / 2;
  const cy = size / 2;

  const points = stations.map((s) => {
    const p = project(s.lat, s.lng, phi, theta, radius * 0.98);
    return { ...s, sx: p.x + cx, sy: p.y + cy, visible: p.visible };
  });

  // Build path through visible points
  const segments = [];
  let current = [];
  points.forEach((p) => {
    if (p.visible) {
      current.push(p);
    } else if (current.length > 1) {
      segments.push(current);
      current = [];
    } else {
      current = [];
    }
  });
  if (current.length > 1) segments.push(current);

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.9" />
        </linearGradient>
        <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {segments.map((seg, i) => {
        const d = seg.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.sx} ${p.sy}`).join(' ');
        return (
          <g key={i}>
            {/* Glow base */}
            <path
              d={d}
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.25}
              filter="url(#line-glow)"
            />
            {/* Main line */}
            <path
              d={d}
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.95}
            />
            {/* Animated dash overlay */}
            <path
              d={d}
              fill="none"
              stroke="#fff"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="6 14"
              strokeDashoffset={dash}
              opacity={0.55}
            />
          </g>
        );
      })}

      {/* Station dots (visible only) */}
      {points.filter((p) => p.visible).map((p, i) => (
        <g key={`dot-${i}`}>
          <circle cx={p.sx} cy={p.sy} r={p.condition === 'critical' ? 5 : 3.5} fill="#fff" opacity={0.9} />
          <circle
            cx={p.sx}
            cy={p.sy}
            r={p.condition === 'critical' ? 8 : 6}
            fill="none"
            stroke={
              p.condition === 'critical' ? '#f43f5e' :
              p.condition === 'degraded' ? '#f59e0b' :
              '#10b981'
            }
            strokeWidth={1.5}
            opacity={0.75}
          >
            {p.condition === 'critical' && (
              <animate attributeName="r" values="6;12;6" dur="1.6s" repeatCount="indefinite" />
            )}
            {p.condition === 'critical' && (
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.6s" repeatCount="indefinite" />
            )}
          </circle>
        </g>
      ))}

      {/* Line label on first visible segment */}
      {segments[0] && segments[0].length > 2 && (
        <g>
          <rect
            x={segments[0][0].sx - 48}
            y={segments[0][0].sy - 30}
            width={96}
            height={20}
            rx={10}
            fill="rgba(15,23,42,0.85)"
            stroke="rgba(255,255,255,0.1)"
          />
          <text
            x={segments[0][0].sx}
            y={segments[0][0].sy - 16}
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontWeight="600"
            fontFamily="ui-sans-serif, system-ui"
          >
            {label}
          </text>
        </g>
      )}
    </svg>
  );
}