import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertTriangle, MapPin, Wrench, Camera, Wifi, WifiOff } from 'lucide-react';

/* ============================================================
   ASSET REGISTER · table-style listing (matches AssetRegister page)
   ============================================================ */
export function AssetRegisterMock() {
  const rows = [
    ['EQ-00472', 'Pump-03', 'Pump', 'Lift Station 4', 92, 'Critical', 'text-rose-600 bg-rose-50'],
    ['EQ-00191', 'HVAC-12', 'HVAC', 'Town Hall L2', 81, 'High', 'text-rose-600 bg-rose-50'],
    ['EQ-00833', 'Generator-A', 'Generator', 'Depot', 67, 'Medium', 'text-amber-600 bg-amber-50'],
    ['EQ-00207', 'Lift-07', 'Elevator', 'Library', 54, 'Medium', 'text-amber-600 bg-amber-50'],
    ['EQ-00611', 'Motor-21', 'Motor', 'Treatment', 38, 'Low', 'text-emerald-600 bg-emerald-50'],
    ['EQ-00355', 'Valve-44', 'Valve', 'Reservoir 2', 22, 'Low', 'text-emerald-600 bg-emerald-50'],
  ];
  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-2">
        <span className="text-[11px] font-bold text-slate-700">Asset Register</span>
        <span className="text-[10px] text-slate-400">· 1,247 assets</span>
        <div className="ml-auto flex items-center gap-1.5">
          {['All', 'Pumps', 'HVAC', 'Lifts'].map((t, i) => (
            <span key={t} className={`px-2 py-0.5 rounded text-[10px] font-bold ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{t}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[80px_1fr_70px_1fr_60px_70px] gap-2 px-4 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
        <div>ID</div><div>Name</div><div>Type</div><div>Location</div><div>Health</div><div>Risk</div>
      </div>
      <div className="flex-1 overflow-hidden">
        {rows.map((r, i) => (
          <motion.div
            key={r[0]}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="grid grid-cols-[80px_1fr_70px_1fr_60px_70px] gap-2 px-4 py-2 border-b border-slate-50 items-center hover:bg-slate-50"
          >
            <div className="text-[10px] font-mono text-slate-500">{r[0]}</div>
            <div className="text-[11px] font-bold text-slate-900 truncate">{r[1]}</div>
            <div className="text-[10px] text-slate-600">{r[2]}</div>
            <div className="text-[10px] text-slate-600 truncate flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-slate-400" />{r[3]}</div>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${r[4] > 70 ? 'bg-rose-500' : r[4] > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${r[4]}%` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-700 tabular-nums">{r[4]}</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-center ${r[6]}`}>{r[5]}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MAINTENANCE BOARD · kanban-style work orders
   ============================================================ */
export function MaintenanceBoardMock() {
  const columns = [
    {
      title: 'Open', count: 4, color: 'bg-slate-400',
      cards: [
        ['WO-1247', 'Pump-03 bearing', 'URGENT', 'bg-rose-500'],
        ['WO-1248', 'HVAC filter swap', 'HIGH', 'bg-amber-500'],
      ],
    },
    {
      title: 'In progress', count: 3, color: 'bg-indigo-500',
      cards: [
        ['WO-1244', 'Lift-07 inspection', 'PRED-AI', 'bg-indigo-500'],
        ['WO-1245', 'Generator service', 'PM', 'bg-sky-500'],
      ],
    },
    {
      title: 'Review', count: 2, color: 'bg-amber-500',
      cards: [
        ['WO-1240', 'Valve replacement', 'DONE', 'bg-emerald-500'],
      ],
    },
    {
      title: 'Closed', count: 18, color: 'bg-emerald-500',
      cards: [
        ['WO-1232', 'Sensor calibration', 'CLOSED', 'bg-slate-400'],
      ],
    },
  ];
  return (
    <div className="w-full h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">
        Maintenance Hub · live board
      </div>
      <div className="grid grid-cols-4 gap-2 h-[calc(100%-28px)]">
        {columns.map((col, ci) => (
          <div key={col.title} className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-2.5 py-2 border-b border-slate-100 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
              <span className="text-[10px] font-bold text-slate-900">{col.title}</span>
              <span className="ml-auto text-[9px] font-bold text-slate-400 tabular-nums">{col.count}</span>
            </div>
            <div className="flex-1 p-1.5 space-y-1.5">
              {col.cards.map((c, i) => (
                <motion.div
                  key={c[0]}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.1 + i * 0.08 }}
                  className="bg-slate-50 border border-slate-100 rounded-lg p-2"
                >
                  <div className="text-[9px] font-mono text-slate-500">{c[0]}</div>
                  <div className="text-[10px] font-bold text-slate-900 leading-tight mt-0.5">{c[1]}</div>
                  <span className={`mt-1.5 inline-block text-[8px] font-bold text-white px-1.5 py-0.5 rounded ${c[3]}`}>{c[2]}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   FINANCE HUB · CFO ratios + variance
   ============================================================ */
export function FinanceHubMock() {
  const ratios = [
    ['CRR', '0.78', 'Consumption ratio', 'text-emerald-500'],
    ['ABI', '94%', 'Asset backlog index', 'text-indigo-500'],
    ['RUC', '$1.2M', 'Renewal under-fund', 'text-amber-500'],
    ['VAR', '−4.2%', 'Budget variance', 'text-rose-500'],
  ];
  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden flex flex-col">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">
        Finance Hub · CFO ratios
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {ratios.map(([k, v, l, c], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5"
          >
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{k}</div>
            <div className={`text-lg font-bold tabular-nums ${c}`}>{v}</div>
            <div className="text-[9px] text-slate-500">{l}</div>
          </motion.div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-lg p-2.5 mb-2">
        <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">Variance alerts</div>
        {[
          ['HVAC budget', '+$42k over', 'text-rose-300'],
          ['Pumps PM', '−$18k under', 'text-emerald-300'],
        ].map(([t, v, c], i) => (
          <div key={t} className="flex items-center justify-between py-1 border-t border-slate-800 first:border-0">
            <span className="text-[10px] text-slate-300">{t}</span>
            <span className={`text-[10px] font-bold ${c}`}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">FY26 capital plan</div>
        <div className="flex items-end gap-1 h-12">
          {[40, 55, 70, 60, 75, 85, 65, 90, 70, 80, 95, 60].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className={`flex-1 rounded-t ${i % 3 === 2 ? 'bg-rose-400' : 'bg-indigo-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SENSOR / IOT LIVE STREAM
   ============================================================ */
export function SensorStreamMock() {
  const series = [22, 24, 23, 26, 28, 32, 38, 45, 52, 58, 54, 48, 44, 42, 40];
  return (
    <div className="w-full h-full bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Live sensor stream</div>
          <div className="text-[11px] font-bold text-white">Pump-03 · vibration (mm/s)</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-400">LIVE</span>
        </div>
      </div>
      <div className="h-32 relative bg-slate-900 rounded-lg p-2 mb-2 border border-slate-800">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
          <line x1="0" y1="20" x2="100" y2="20" stroke="#475569" strokeWidth="0.3" strokeDasharray="1,1" />
          <line x1="0" y1="10" x2="100" y2="10" stroke="#f43f5e" strokeWidth="0.3" strokeDasharray="2,1" />
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
            points={series.map((v, i) => `${(i / (series.length - 1)) * 100},${50 - (v / 60) * 50}`).join(' ')}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1"
          />
          {series.map((v, i) => (
            <circle key={i} cx={(i / (series.length - 1)) * 100} cy={50 - (v / 60) * 50} r={v > 40 ? 1 : 0.6} fill={v > 40 ? '#f43f5e' : '#6366f1'} />
          ))}
        </svg>
        <div className="absolute top-1 left-2 text-[8px] font-bold text-rose-400">Threshold 4.5</div>
      </div>
      <div className="space-y-1.5">
        {[
          ['12:42:18', 'Anomaly detected — 5.8 mm/s', 'text-rose-400'],
          ['12:42:19', 'Failure prob: 78% → 92%', 'text-amber-400'],
          ['12:42:20', 'Auto-WO drafted, tech notified', 'text-emerald-400'],
        ].map(([t, msg, c], i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 + 1 }}
            className="flex items-start gap-2 text-[10px]"
          >
            <span className="font-mono text-slate-500">{t}</span>
            <span className={`font-bold ${c}`}>{msg}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   FIELD OPS DUO · two phones
   ============================================================ */
export function FieldOpsMock() {
  return (
    <div className="w-full h-full flex items-center justify-center gap-4 px-4">
      {/* Phone 1 — checklist with photos */}
      <motion.div
        initial={{ opacity: 0, y: 8, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        className="w-[200px] bg-slate-900 rounded-[24px] p-1.5 shadow-2xl"
      >
        <div className="bg-white rounded-[18px] overflow-hidden">
          <div className="h-5 bg-slate-900 flex items-center justify-center">
            <div className="w-12 h-2.5 bg-slate-900 rounded-full" />
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-slate-900">Inspection · Lift-07</span>
              <WifiOff className="w-3 h-3 text-amber-500" />
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square flex-1 rounded bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center">
                  <Camera className="w-2.5 h-2.5 text-slate-500" />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {[
                ['Cable wear check', true],
                ['Brake test', true],
                ['Door safety', false],
                ['Emergency stop', false],
              ].map(([t, done]) => (
                <div key={t} className="flex items-center gap-1.5">
                  {done ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Circle className="w-3 h-3 text-slate-300" />}
                  <span className={`text-[10px] ${done ? 'text-slate-400 line-through' : 'font-bold text-slate-900'}`}>{t}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-1.5 flex items-center gap-1">
              <WifiOff className="w-2.5 h-2.5 text-amber-600" />
              <span className="text-[9px] font-bold text-amber-700">Offline · 3 queued</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Phone 2 — defect capture w/ AI */}
      <motion.div
        initial={{ opacity: 0, y: 8, rotate: 3 }}
        animate={{ opacity: 1, y: 0, rotate: 3 }}
        transition={{ delay: 0.15 }}
        className="w-[200px] bg-slate-900 rounded-[24px] p-1.5 shadow-2xl"
      >
        <div className="bg-white rounded-[18px] overflow-hidden">
          <div className="h-5 bg-slate-900 flex items-center justify-center">
            <div className="w-12 h-2.5 bg-slate-900 rounded-full" />
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-slate-900">Photo defect</span>
              <Wifi className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="aspect-video rounded bg-gradient-to-br from-slate-700 to-slate-900 relative mb-2 overflow-hidden">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-3 left-4 w-12 h-8 border-2 border-rose-400 rounded"
              >
                <div className="absolute -top-3 left-0 text-[8px] font-bold text-rose-400 bg-slate-900 px-1 rounded">CRACK · 94%</div>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-3 right-3 w-8 h-6 border-2 border-amber-400 rounded"
              >
                <div className="absolute -top-3 left-0 text-[8px] font-bold text-amber-400 bg-slate-900 px-1 rounded">RUST · 81%</div>
              </motion.div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] font-bold text-slate-700">AI suggests:</div>
              <div className="bg-rose-50 border border-rose-200 rounded p-1.5">
                <div className="text-[9px] font-bold text-rose-700">Crack · Major</div>
                <div className="text-[8px] text-rose-600">Auto-WO ready</div>
              </div>
              <button className="w-full bg-indigo-600 text-white text-[9px] font-bold py-1.5 rounded">
                Approve &amp; sync
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}