import React from 'react';
import { motion } from 'framer-motion';

/**
 * Inline SVG-style dashboard mock — looks like an AssetStack screenshot
 * without depending on an external image. Always renders instantly.
 */
export default function DashboardMock() {
  return (
    <div className="w-full h-full bg-[#0A0A0F] flex">
      {/* Sidebar */}
      <div className="w-[140px] border-r border-white/5 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }} />
          <span className="text-[9px] font-semibold text-white">AssetStack</span>
        </div>
        {['Dashboard', 'Assets', 'Maintenance', 'AI Mind', 'Reports'].map((item, i) => (
          <div key={item} className={`text-[8px] py-1 px-1.5 rounded ${i === 0 ? 'bg-violet-500/15 text-violet-200' : 'text-white/40'}`}>
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-white">Asset Management</div>
          <div className="text-[8px] text-white/40">Bunbury Portfolio · 2,847 assets</div>
        </div>

        {/* Top row: map + KPI */}
        <div className="grid grid-cols-3 gap-3 flex-1">
          <div className="col-span-2 rounded-md p-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.04))', border: '1px solid rgba(168,85,247,0.15)' }}
          >
            <div className="text-[8px] tracking-wider uppercase text-white/40 mb-1">Asset Map</div>
            <svg viewBox="0 0 200 100" className="w-full h-[80%]">
              {/* Simplified continent outline */}
              <path d="M 30 40 Q 50 25, 90 30 T 170 45 L 175 70 Q 130 85, 80 75 T 35 70 Z"
                fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.3)" strokeWidth="0.5" />
              {[
                [50, 55], [70, 45], [85, 60], [110, 50], [130, 65], [150, 55],
                [60, 65], [95, 70], [120, 45], [140, 70], [75, 55], [105, 60],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="1.2" fill="#A855F7" opacity="0.8">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>
          </div>

          <div className="rounded-md p-3 flex flex-col"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <div className="text-[8px] tracking-wider uppercase text-white/40 mb-2">Predictive</div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <svg viewBox="0 0 60 60" className="w-16 h-16">
                <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <motion.circle
                  cx="30" cy="30" r="24" fill="none"
                  stroke="url(#gaugeG)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray="150.8" strokeDashoffset="117.6"
                  transform="rotate(-90 30 30)"
                  initial={{ strokeDashoffset: 150.8 }}
                  animate={{ strokeDashoffset: 117.6 }}
                  transition={{ duration: 1.5, delay: 1.5 }}
                />
                <defs>
                  <linearGradient id="gaugeG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <text x="30" y="33" textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff">22%</text>
              </svg>
              <div className="text-[7px] text-white/40 mt-1">Predictive coverage</div>
            </div>
          </div>
        </div>

        {/* Bottom row: table + chart */}
        <div className="grid grid-cols-3 gap-3 h-[40%]">
          <div className="col-span-2 rounded-md p-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-[8px] tracking-wider uppercase text-white/40 mb-2">Asset Register</div>
            <div className="space-y-1.5">
              {[
                ['Predictive maintenance', '$5,053,100', 'High'],
                ['Corrective maintenance', '$3,094,200', 'Med'],
                ['Inspection',             '$1,094,300', 'Low'],
                ['Compliance',             '$2,053,200', 'High'],
              ].map(([a, b, c]) => (
                <div key={a} className="grid grid-cols-3 text-[8px] py-1 border-b border-white/5">
                  <span className="text-white/70">{a}</span>
                  <span className="text-white/60 tabular-nums text-right">{b}</span>
                  <span className={`text-right ${c === 'High' ? 'text-violet-300' : 'text-white/40'}`}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md p-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-[8px] tracking-wider uppercase text-white/40 mb-2">Budget</div>
            <svg viewBox="0 0 100 50" className="w-full h-[70%]">
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0 35 Q 15 28, 25 30 T 50 18 T 75 22 T 100 15 L 100 50 L 0 50 Z" fill="url(#areaG)" />
              <path d="M 0 35 Q 15 28, 25 30 T 50 18 T 75 22 T 100 15" fill="none" stroke="#A855F7" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}