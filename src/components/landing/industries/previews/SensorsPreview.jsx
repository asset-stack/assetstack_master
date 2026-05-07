import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Wifi, AlertTriangle, Activity } from 'lucide-react';

/**
 * Sensors preview — live IoT readings strip with auto-updating values
 * and a real-time vibration trace with threshold alert.
 */

const SENSORS = [
  { name: 'Vibration', unit: 'mm/s', base: 4.2, threshold: 5.0, type: 'warn' },
  { name: 'Temperature', unit: '°C', base: 78, threshold: 85, type: 'ok' },
  { name: 'Current', unit: 'A', base: 21.4, threshold: 28, type: 'ok' },
  { name: 'Pressure', unit: 'bar', base: 6.8, threshold: 8.0, type: 'ok' },
];

export default function SensorsPreview() {
  const [tick, setTick] = useState(0);
  const [trace, setTrace] = useState(() => Array.from({ length: 30 }, (_, i) => 4 + Math.sin(i / 3) * 0.4 + Math.random() * 0.3));

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setTrace((prev) => {
        const next = [...prev.slice(1), 4 + Math.sin(prev.length / 3) * 0.4 + Math.random() * 0.6];
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center">
          <Radio className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900 leading-none">Live sensor stream</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Library HVAC #2 · 4 sensors online</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-2.5 h-2.5" /> Live · MQTT
        </div>
      </div>

      {/* Sensor grid */}
      <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-slate-100">
        {SENSORS.map((s, i) => {
          const value = (s.base + Math.sin((tick + i) / 2) * 0.3 + (Math.random() * 0.2 - 0.1)).toFixed(s.unit === '°C' ? 0 : 1);
          const isWarn = s.type === 'warn';
          return (
            <div
              key={s.name}
              className={`rounded-lg border px-2.5 py-1.5 ${
                isWarn ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50/60 border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{s.name}</span>
                {isWarn && <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />}
              </div>
              <motion.div
                key={value}
                initial={{ opacity: 0.7, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-baseline gap-1"
              >
                <span className={`text-[15px] font-semibold tabular-nums ${isWarn ? 'text-amber-700' : 'text-slate-900'}`}>
                  {value}
                </span>
                <span className="text-[9px] text-slate-500">{s.unit}</span>
              </motion.div>
              <div className="text-[8px] text-slate-400 mt-0.5">limit {s.threshold} {s.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Live trace */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" /> Vibration · last 60s
          </span>
          <span className="text-[9px] text-slate-500 tabular-nums">10 Hz · MQTT</span>
        </div>
        <SensorTrace points={trace} threshold={5.0} />
      </div>

      {/* Threshold alert */}
      <div className="px-4 py-3 flex-1 space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Threshold rules</span>
        {[
          { name: 'Vibration > 5.0 mm/s', state: 'armed', count: '0 hits' },
          { name: 'Temperature > 85°C', state: 'armed', count: '0 hits' },
          { name: 'Current draw > 28 A', state: 'armed', count: '0 hits' },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-2 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 flex-1">{r.name}</span>
            <span className="text-slate-400 tabular-nums">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SensorTrace({ points, threshold }) {
  const w = 320;
  const h = 50;
  const max = 6;
  const stepX = w / (points.length - 1);
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - (v / max) * h}`).join(' ');
  const thresholdY = h - (threshold / max) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 50 }}>
      <line x1="0" y1={thresholdY} x2={w} y2={thresholdY} stroke="#f59e0b" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.6" />
      <text x="2" y={thresholdY - 2} fontSize="7" fill="#d97706" fontWeight="600">5.0 limit</text>
      <motion.path
        key={points[points.length - 1]}
        d={path}
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx={(points.length - 1) * stepX} cy={h - (points[points.length - 1] / max) * h} r="2.5" fill="#10b981">
        <animate attributeName="r" values="2.5;4;2.5" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}