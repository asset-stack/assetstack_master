import React from 'react';
import { MapPin, Building2, Cpu, Layers, DoorOpen } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Map status to colors
const statusColors = {
  operational: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', dot: '#10b981' },
  degraded: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  critical: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
  maintenance: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
  offline: { bg: '#f8fafc', border: '#94a3b8', text: '#475569', dot: '#94a3b8' },
};

const typeColors = {
  root: { bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: '#4f46e5', text: '#ffffff' },
  location: { bg: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', border: '#0284c7', text: '#ffffff' },
  room: { bg: 'linear-gradient(135deg,#14b8a6,#0d9488)', border: '#0d9488', text: '#ffffff' },
  group: { bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)', border: '#7c3aed', text: '#ffffff' },
};

// svg-safe icon rendering
const iconSvg = (Icon, color = '#fff', size = 16) =>
  renderToStaticMarkup(<Icon color={color} size={size} strokeWidth={2.5} />);

export default function AssetTreeNode({ nodeDatum, toggleNode, onNodeClick }) {
  const { attributes = {}, children = [], __rd3t } = nodeDatum;
  const kind = attributes.kind || 'asset';
  const isCollapsed = __rd3t?.collapsed;
  const hasChildren = (nodeDatum.children && nodeDatum.children.length > 0) || (nodeDatum._children && nodeDatum._children.length > 0);

  // Root / grouping nodes
  if (kind === 'root' || kind === 'location' || kind === 'room' || kind === 'group') {
    const palette = typeColors[kind];
    const Icon = kind === 'location' ? MapPin : kind === 'room' ? DoorOpen : kind === 'group' ? Layers : Building2;
    const iconHtml = iconSvg(Icon, '#fff', 18);
    const count = attributes.count || 0;
    const critical = attributes.critical || 0;

    return (
      <g onClick={() => hasChildren && toggleNode()} style={{ cursor: hasChildren ? 'pointer' : 'default' }}>
        {/* Glow */}
        <circle r={38} fill={palette.border} opacity={0.15} />
        {/* Main circle */}
        <circle r={32} fill={palette.border} stroke="#fff" strokeWidth={3} />
        {/* Icon */}
        <foreignObject x={-9} y={-9} width={18} height={18}>
          <div dangerouslySetInnerHTML={{ __html: iconHtml }} />
        </foreignObject>
        {/* Label */}
        <foreignObject x={-90} y={38} width={180} height={60}>
          <div style={{
            textAlign: 'center',
            fontFamily: 'ui-sans-serif, system-ui',
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#0f172a',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {nodeDatum.name}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {count} asset{count !== 1 ? 's' : ''}
              {critical > 0 && (
                <span style={{
                  marginLeft: 6, padding: '1px 6px', background: '#fee2e2',
                  color: '#991b1b', borderRadius: 6, fontWeight: 600, fontSize: 10
                }}>
                  {critical} critical
                </span>
              )}
            </div>
          </div>
        </foreignObject>
        {/* Collapse indicator */}
        {hasChildren && (
          <g transform="translate(22, 22)">
            <circle r={10} fill="#fff" stroke={palette.border} strokeWidth={2} />
            <text textAnchor="middle" dy={4} fontSize={13} fontWeight={700} fill={palette.border}>
              {isCollapsed ? '+' : '−'}
            </text>
          </g>
        )}
      </g>
    );
  }

  // Asset (leaf) node — card style
  const status = attributes.status || 'operational';
  const palette = statusColors[status] || statusColors.operational;
  const health = attributes.health_score ?? 0;
  const iconHtml = iconSvg(Cpu, palette.border, 16);

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick && onNodeClick(nodeDatum);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Shadow */}
      <rect x={-95} y={-28} width={190} height={56} rx={12} fill="#000" opacity={0.05} transform="translate(2,3)" />
      {/* Card */}
      <rect x={-95} y={-28} width={190} height={56} rx={12} fill="#ffffff" stroke={palette.border} strokeWidth={1.5} />
      {/* Status dot */}
      <circle cx={-80} cy={-15} r={4} fill={palette.dot}>
        {status === 'critical' && (
          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>
      {/* Icon badge */}
      <rect x={-72} y={-20} width={28} height={28} rx={6} fill={palette.bg} />
      <foreignObject x={-66} y={-14} width={16} height={16}>
        <div dangerouslySetInnerHTML={{ __html: iconHtml }} />
      </foreignObject>
      {/* Text */}
      <foreignObject x={-38} y={-22} width={128} height={44}>
        <div style={{ fontFamily: 'ui-sans-serif, system-ui', overflow: 'hidden' }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#0f172a',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {nodeDatum.name}
          </div>
          <div style={{
            fontSize: 10, color: '#64748b', marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {attributes.type?.replace(/_/g, ' ')} • <span style={{ color: palette.text, fontWeight: 600 }}>{health}%</span>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}