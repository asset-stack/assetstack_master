import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, X, MapPin, Wrench } from 'lucide-react';

// Status color from health score
function healthColor(score) {
  if (score == null) return { bg: 'bg-slate-400', ring: 'ring-slate-200', text: 'text-slate-700' };
  if (score >= 85) return { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700' };
  if (score >= 70) return { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700' };
  return { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700' };
}

export default function ScanSitePlanOverlay({ overlays = [], equipment = [], conditionReports = [], workOrders = [] }) {
  const [activeId, setActiveId] = useState(null);

  const equipmentById = useMemo(() => Object.fromEntries(equipment.map(e => [e.id, e])), [equipment]);

  const issuesByAsset = useMemo(() => {
    const map = {};
    conditionReports.forEach(r => {
      if (r.review_status === 'pending' || r.review_status === 'approved') {
        map[r.equipment_id] = (map[r.equipment_id] || 0) + 1;
      }
    });
    return map;
  }, [conditionReports]);

  const openWOsByAsset = useMemo(() => {
    const map = {};
    workOrders.forEach(w => {
      if (['open', 'assigned', 'in_progress'].includes(w.status)) {
        map[w.equipment_id] = (map[w.equipment_id] || 0) + 1;
      }
    });
    return map;
  }, [workOrders]);

  const active = overlays.find(o => o.equipment_id === activeId);
  const activeEquip = active ? equipmentById[active.equipment_id] : null;
  const activeReports = active ? conditionReports.filter(r => r.equipment_id === active.equipment_id) : [];
  const activeWOs = active ? workOrders.filter(w => w.equipment_id === active.equipment_id) : [];

  if (overlays.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-sm text-slate-900">Site Plan — Asset Overlay</span>
          <Badge variant="outline" className="text-[10px] ml-1">{overlays.length} tagged</Badge>
        </div>
        <span className="text-xs text-slate-400">Click any pin to inspect</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Site plan canvas */}
        <div className="lg:col-span-3 relative bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-100" style={{ aspectRatio: '4/3' }}>
          {/* Simple isometric building outline */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            {/* Main building */}
            <rect x="10" y="15" width="65" height="65" fill="white" stroke="#94a3b8" strokeWidth="0.4" rx="1" />
            {/* Sports hall divider */}
            <line x1="10" y1="45" x2="75" y2="45" stroke="#cbd5e1" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="45" y1="15" x2="45" y2="80" stroke="#cbd5e1" strokeWidth="0.3" strokeDasharray="1,1" />
            {/* Pool plant area */}
            <rect x="12" y="60" width="20" height="18" fill="#dbeafe" fillOpacity="0.5" stroke="#93c5fd" strokeWidth="0.3" rx="0.5" />
            <text x="22" y="71" fontSize="2.2" fill="#1e40af" textAnchor="middle" fontWeight="600">Pool Plant</text>
            {/* Sports hall */}
            <text x="45" y="32" fontSize="2.2" fill="#475569" textAnchor="middle" fontWeight="600">Sports Hall</text>
            {/* Gym mezz */}
            <text x="63" y="32" fontSize="2" fill="#475569" textAnchor="middle">Gym</text>
            {/* Change rooms */}
            <rect x="32" y="50" width="18" height="14" fill="#fef3c7" fillOpacity="0.5" stroke="#fbbf24" strokeWidth="0.3" rx="0.5" />
            <text x="41" y="58" fontSize="1.9" fill="#92400e" textAnchor="middle">Change Rooms</text>
            {/* Outdoor courts */}
            <rect x="78" y="65" width="18" height="22" fill="#d1fae5" fillOpacity="0.6" stroke="#6ee7b7" strokeWidth="0.3" rx="0.5" />
            <text x="87" y="77" fontSize="2" fill="#065f46" textAnchor="middle" fontWeight="600">Courts</text>
            {/* North arrow */}
            <g transform="translate(92, 8)">
              <path d="M 0 -3 L 1.5 2 L 0 1 L -1.5 2 Z" fill="#475569" />
              <text x="0" y="6" fontSize="2" fill="#475569" textAnchor="middle" fontWeight="700">N</text>
            </g>
          </svg>

          {/* Asset pins */}
          {overlays.map(o => {
            const eq = equipmentById[o.equipment_id];
            const score = eq?.health_score;
            const c = healthColor(score);
            const issues = issuesByAsset[o.equipment_id] || 0;
            const wos = openWOsByAsset[o.equipment_id] || 0;
            const isActive = activeId === o.equipment_id;
            return (
              <button
                key={o.equipment_id}
                onClick={() => setActiveId(isActive ? null : o.equipment_id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${o.x}%`, top: `${o.y}%` }}
              >
                <div className={`relative w-6 h-6 rounded-full ${c.bg} ring-4 ${c.ring} flex items-center justify-center text-white text-[10px] font-bold shadow-lg transition-all ${isActive ? 'scale-125 ring-8' : 'group-hover:scale-110'}`}>
                  {score ?? '?'}
                  {(issues + wos) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {issues + wos}
                    </span>
                  )}
                </div>
                <div className={`absolute left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-white rounded text-[10px] font-medium text-slate-700 shadow-sm border border-slate-200 whitespace-nowrap transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {o.equipment_name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 p-4 min-h-[300px]">
          {!active ? (
            <div className="text-center py-8">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Select an asset pin to view details</p>
              <div className="mt-6 space-y-2 text-xs text-slate-500 text-left">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Health ≥ 85 — Good</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Health 70–84 — Watch</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Health &lt; 70 — Action needed</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-white" /> Has open issues / work orders</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{activeEquip?.name || active.equipment_name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{active.note}</p>
                </div>
                <button onClick={() => setActiveId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeEquip && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Health</div>
                    <div className={`text-lg font-bold ${healthColor(activeEquip.health_score).text}`}>{activeEquip.health_score ?? '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Status</div>
                    <div className="text-xs font-semibold text-slate-700 capitalize mt-1">{activeEquip.status}</div>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-[10px] text-slate-500 uppercase">Risk</div>
                    <div className="text-xs font-semibold text-slate-700 capitalize mt-1">{activeEquip.risk_level || '—'}</div>
                  </div>
                </div>
              )}

              {activeReports.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Condition observations ({activeReports.length})
                  </div>
                  <div className="space-y-1.5">
                    {activeReports.slice(0, 3).map(r => (
                      <div key={r.id} className="text-xs bg-amber-50 border border-amber-100 rounded p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="outline" className="text-[9px] py-0 h-4 capitalize">{r.severity}</Badge>
                          <Badge variant="outline" className="text-[9px] py-0 h-4 capitalize">{r.review_status}</Badge>
                        </div>
                        <p className="text-slate-700">{r.ai_description || r.reviewer_notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeWOs.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                    Work orders ({activeWOs.length})
                  </div>
                  <div className="space-y-1">
                    {activeWOs.slice(0, 3).map(w => (
                      <div key={w.id} className="text-xs bg-slate-50 border border-slate-100 rounded p-1.5 flex items-center justify-between">
                        <span className="text-slate-700 truncate">{w.title}</span>
                        <Badge variant="outline" className="text-[9px] py-0 h-4 ml-1 capitalize">{w.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeReports.length === 0 && activeWOs.length === 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded p-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  No open issues or work orders
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}