import React from 'react';
import { motion } from 'framer-motion';

// Condition score → color
const scoreColor = (score) => {
  if (score <= 1) return '#10b981';
  if (score === 2) return '#84cc16';
  if (score === 3) return '#f59e0b';
  if (score === 4) return '#f97316';
  return '#ef4444';
};

const scoreLabel = (score) => ({ 1: 'Excellent', 2: 'Good', 3: 'Fair', 4: 'Poor', 5: 'Failed' }[score] || 'Unknown');

// Library room layout — top-down plan view
// Coordinates in a 1000x700 SVG viewBox
const FURNITURE = [
  // Bookshelves (back wall)
  { type: 'bookshelf', x: 150, y: 60, w: 120, h: 40, score: 1, name: 'Bookshelf A' },
  { type: 'bookshelf', x: 290, y: 60, w: 120, h: 40, score: 2, name: 'Bookshelf B' },
  { type: 'bookshelf', x: 430, y: 60, w: 120, h: 40, score: 3, name: 'Bookshelf C (worn)' },
  { type: 'bookshelf', x: 570, y: 60, w: 120, h: 40, score: 2, name: 'Bookshelf D' },
  { type: 'bookshelf', x: 710, y: 60, w: 120, h: 40, score: 4, name: 'Bookshelf E (damaged)' },
  // Side wall bookshelves
  { type: 'bookshelf', x: 50, y: 180, w: 40, h: 100, score: 1, name: 'Reference A' },
  { type: 'bookshelf', x: 50, y: 320, w: 40, h: 100, score: 2, name: 'Reference B' },
  // Reading tables
  { type: 'table', x: 220, y: 260, w: 160, h: 90, score: 1, name: 'Reading Table 1' },
  { type: 'table', x: 520, y: 260, w: 160, h: 90, score: 2, name: 'Reading Table 2' },
  // Chairs around table 1
  { type: 'chair', x: 240, y: 220, w: 40, h: 40, score: 2, name: 'Chair 1A' },
  { type: 'chair', x: 320, y: 220, w: 40, h: 40, score: 3, name: 'Chair 1B (loose)' },
  { type: 'chair', x: 240, y: 360, w: 40, h: 40, score: 2, name: 'Chair 1C' },
  { type: 'chair', x: 320, y: 360, w: 40, h: 40, score: 1, name: 'Chair 1D' },
  // Chairs around table 2
  { type: 'chair', x: 540, y: 220, w: 40, h: 40, score: 1, name: 'Chair 2A' },
  { type: 'chair', x: 620, y: 220, w: 40, h: 40, score: 2, name: 'Chair 2B' },
  { type: 'chair', x: 540, y: 360, w: 40, h: 40, score: 5, name: 'Chair 2C (broken)' },
  { type: 'chair', x: 620, y: 360, w: 40, h: 40, score: 1, name: 'Chair 2D' },
  // Librarian desk
  { type: 'desk', x: 780, y: 480, w: 160, h: 70, score: 2, name: 'Librarian Desk' },
  { type: 'chair', x: 840, y: 560, w: 40, h: 40, score: 1, name: 'Staff Chair' },
];

const furnitureFillByType = (type) => ({
  bookshelf: '#78350f',
  table: '#92400e',
  chair: '#7c2d12',
  desk: '#78350f',
}[type] || '#78350f');

function FurnitureItem({ item }) {
  const color = scoreColor(item.score);
  const fill = furnitureFillByType(item.type);
  return (
    <g>
      <rect
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx={item.type === 'chair' ? 6 : 4}
        fill={fill}
        stroke={color}
        strokeWidth={2.5}
        opacity={0.85}
      />
      {/* Condition pill */}
      <g>
        <rect
          x={item.x + item.w / 2 - 14}
          y={item.y + item.h / 2 - 8}
          width={28}
          height={16}
          rx={8}
          fill={color}
          stroke="white"
          strokeWidth={1.5}
        />
        <text
          x={item.x + item.w / 2}
          y={item.y + item.h / 2 + 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="white"
        >
          {item.score}/5
        </text>
      </g>
    </g>
  );
}

function AssetOverlay({ overlay, index, hoveredAsset, setHoveredAsset, onAssetClick }) {
  // Map 3D (x,z) → 2D SVG coordinates. Scene range ~ -9..9 → 50..950
  const sx = 500 + (overlay.x || 0) * 45;
  const sy = 350 + (overlay.z || 0) * 45;
  const condition = overlay.condition || 'operational';
  const color = condition === 'critical' ? '#ef4444' : condition === 'degraded' ? '#f59e0b' : '#10b981';
  const isHovered = hoveredAsset === index;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setHoveredAsset(index)}
      onMouseLeave={() => setHoveredAsset(null)}
      onClick={() => onAssetClick && onAssetClick(overlay)}
    >
      {/* Pulsing halo */}
      <circle cx={sx} cy={sy} r={isHovered ? 24 : 18} fill={color} opacity={0.2}>
        <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={sx} cy={sy} r={10} fill={color} stroke="white" strokeWidth={2.5} />
      <circle cx={sx} cy={sy} r={4} fill="white" />

      {isHovered && (
        <g>
          <rect
            x={sx + 14}
            y={sy - 24}
            width={Math.max(120, (overlay.equipment_name?.length || 8) * 7)}
            height={28}
            rx={6}
            fill="#0f172a"
            stroke={color}
            strokeWidth={1.5}
          />
          <text x={sx + 22} y={sy - 6} fontSize={12} fontWeight={600} fill="white">
            {overlay.equipment_name || `Asset ${index + 1}`}
          </text>
        </g>
      )}
    </g>
  );
}

export default function LibraryRoomView2D({ overlays = [], hoveredAsset, setHoveredAsset, onAssetClick }) {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      viewBox="0 0 1000 700"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id="floor-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#d4a574" />
          <path d="M 0 0 L 40 0 M 0 20 L 40 20" stroke="#a87849" strokeWidth="0.5" opacity="0.4" />
        </pattern>
        <linearGradient id="rug-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9f1239" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>

      {/* Floor */}
      <rect x="40" y="40" width="920" height="620" fill="url(#floor-pattern)" rx="4" />
      {/* Walls */}
      <rect x="40" y="40" width="920" height="620" fill="none" stroke="#fef3c7" strokeWidth="12" rx="4" />

      {/* Central rug */}
      <rect x="200" y="230" width="520" height="180" fill="url(#rug-gradient)" rx="6" opacity="0.7" />

      {/* Room label */}
      <text x="500" y="680" textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight={500}>
        Library Room — Top-Down Plan View
      </text>

      {/* Furniture */}
      {FURNITURE.map((item, i) => <FurnitureItem key={i} item={item} />)}

      {/* Asset overlays */}
      {overlays.map((o, i) => (
        <AssetOverlay
          key={i}
          overlay={o}
          index={i}
          hoveredAsset={hoveredAsset}
          setHoveredAsset={setHoveredAsset}
          onAssetClick={onAssetClick}
        />
      ))}
    </motion.svg>
  );
}