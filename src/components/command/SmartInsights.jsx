import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Shield, Zap } from 'lucide-react';

const INSIGHT_STYLES = {
  trend: { icon: TrendingUp, bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', accent: 'border-l-blue-500' },
  anomaly: { icon: AlertCircle, bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', accent: 'border-l-amber-500' },
  opportunity: { icon: Lightbulb, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', accent: 'border-l-emerald-500' },
  risk: { icon: Shield, bg: 'bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', accent: 'border-l-rose-500' },
  efficiency: { icon: Zap, bg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', accent: 'border-l-violet-500' },
};

export default function SmartInsights({ insights = [], loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-2.5 p-4 sm:p-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-[15px]">AI Insights</h3>
          <p className="text-[11px] text-slate-500">Patterns AssetMind detected in your data</p>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-2.5">
        {loading && insights.length === 0 ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="p-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Generating insights...</p>
          </div>
        ) : (
          insights.map((insight, idx) => {
            const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.trend;
            const Icon = style.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`${style.bg} rounded-xl p-3.5 border-l-4 ${style.accent}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${style.iconColor}`}>
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}