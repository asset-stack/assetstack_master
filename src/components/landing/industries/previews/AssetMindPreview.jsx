import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, FileText, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';

/**
 * Rich, auto-playing AssetMind conversation demo.
 * Cycles through a multi-turn scripted conversation with charts,
 * action buttons, and tool-call UI to feel like the real product.
 */

const SCRIPT = [
  {
    role: 'user',
    content: 'Which LGA Council assets need attention this week?',
  },
  {
    role: 'assistant',
    type: 'tool',
    tool: 'analyse_fleet_risk',
    status: 'completed',
    detail: 'Scanned 156 assets · 4ms',
  },
  {
    role: 'assistant',
    type: 'priority_list',
    content: 'Found 3 priority items across the council portfolio:',
    items: [
      { label: 'Library HVAC #2', detail: 'Vibration anomaly · 4σ above baseline', severity: 'high' },
      { label: 'Town Hall lift', detail: 'Service due in 4 days · contract SLA', severity: 'med' },
      { label: 'Park irrigation pump', detail: 'Pressure drop trending · seal wear', severity: 'high' },
    ],
  },
  {
    role: 'user',
    content: 'Show me the HVAC #2 vibration trend',
  },
  {
    role: 'assistant',
    type: 'chart',
    content: 'Vibration · Library HVAC #2 (last 14 days)',
    points: [1.8, 1.9, 2.0, 1.95, 2.1, 2.0, 2.2, 2.5, 2.8, 3.2, 3.6, 4.1, 4.4, 4.8],
    threshold: 3.0,
    unit: 'mm/s',
  },
  {
    role: 'assistant',
    type: 'recommendation',
    content: 'Recommend scheduling bearing inspection within 5 days. Estimated avoided cost: $8,400.',
    actions: ['Draft work order', 'Add to schedule', 'Notify team'],
  },
];

export default function AssetMindPreview() {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (step >= SCRIPT.length) {
      // Restart loop after a pause
      const restart = setTimeout(() => setStep(0), 4000);
      return () => clearTimeout(restart);
    }
    const isUser = SCRIPT[step].role === 'user';
    setTyping(!isUser);
    const delay = isUser ? 1100 : 1500;
    const t = setTimeout(() => {
      setTyping(false);
      setStep((s) => s + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [step]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [step]);

  const visible = SCRIPT.slice(0, step);

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center elevation-2">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold leading-none">AssetMind</div>
          <div className="text-[10px] text-white/40 mt-0.5">Connected to 156 assets · LGA Council</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-300 font-medium">Live</span>
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {visible.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === 'user' ? (
                <UserMessage text={msg.content} />
              ) : (
                <AssistantMessage msg={msg} />
              )}
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl rounded-tl-sm w-fit"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-300"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-5 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span className="text-[11px] text-white/40 flex-1">Ask AssetMind anything…</span>
          <kbd className="text-[9px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-500 rounded-xl rounded-tr-sm px-3 py-2 max-w-[80%] text-[12px] elevation-2">
        {text}
      </div>
    </div>
  );
}

function AssistantMessage({ msg }) {
  if (msg.type === 'tool') {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg w-fit text-[10px]">
        <div className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-white/70 font-medium">{msg.tool}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/40">{msg.detail}</span>
      </div>
    );
  }

  if (msg.type === 'priority_list') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl rounded-tl-sm px-3 py-2.5 text-[12px] max-w-[90%]">
        <div className="text-white/85 mb-2">{msg.content}</div>
        <div className="space-y-1.5">
          {msg.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/5"
            >
              <AlertTriangle className={`w-3 h-3 shrink-0 ${
                item.severity === 'high' ? 'text-rose-400' : 'text-amber-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-white truncate">{item.label}</div>
                <div className="text-[10px] text-white/50 truncate">{item.detail}</div>
              </div>
              <ChevronRight className="w-3 h-3 text-white/30" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (msg.type === 'chart') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[90%]">
        <div className="flex items-center gap-1.5 text-[10px] text-blue-300 font-semibold mb-2">
          <TrendingUp className="w-3 h-3" /> {msg.content}
        </div>
        <SparkChart points={msg.points} threshold={msg.threshold} />
        <div className="flex items-center justify-between mt-2 text-[10px] text-white/50">
          <span>14d ago</span>
          <span className="text-rose-300 font-semibold">↑ 2.6× threshold</span>
          <span>Now</span>
        </div>
      </div>
    );
  }

  if (msg.type === 'recommendation') {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/30 rounded-xl rounded-tl-sm px-3 py-2.5 max-w-[90%]">
        <div className="text-[12px] text-white/90 leading-relaxed">{msg.content}</div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {msg.actions.map((a, i) => (
            <button
              key={a}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                i === 0
                  ? 'bg-blue-500 hover:bg-blue-400 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
              }`}
            >
              {i === 0 && <FileText className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />}
              {a}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function SparkChart({ points, threshold }) {
  const max = Math.max(...points, threshold) * 1.15;
  const w = 280;
  const h = 60;
  const stepX = w / (points.length - 1);

  const path = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${h - (v / max) * h}`)
    .join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  const tY = h - (threshold / max) * h;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="am-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Threshold line */}
      <line x1="0" y1={tY} x2={w} y2={tY} stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <text x={w - 4} y={tY - 3} fontSize="8" fill="#fbbf24" textAnchor="end" fontWeight="600">threshold</text>
      <motion.path
        d={area}
        fill="url(#am-grad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Last point */}
      <circle
        cx={(points.length - 1) * stepX}
        cy={h - (points[points.length - 1] / max) * h}
        r="3"
        fill="#f87171"
      />
    </svg>
  );
}