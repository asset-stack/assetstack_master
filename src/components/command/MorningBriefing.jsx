import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Sun, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_STYLES = {
  healthy: { bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600', icon: CheckCircle2, label: 'HEALTHY' },
  attention: { bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500', icon: AlertTriangle, label: 'ATTENTION' },
  critical: { bg: 'bg-gradient-to-br from-rose-600 via-red-600 to-rose-700', icon: AlertTriangle, label: 'CRITICAL' },
};

const TREND_ICON = { improving: TrendingUp, stable: Minus, declining: TrendingDown };
const TREND_COLOR = { improving: 'text-emerald-300', stable: 'text-slate-200', declining: 'text-rose-300' };

export default function MorningBriefing({ briefing, loading, onRefresh, userName, lastGenerated }) {
  const status = briefing?.status || 'attention';
  const style = STATUS_STYLES[status] || STATUS_STYLES.attention;
  const StatusIcon = style.icon;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const TrendIcon = briefing?.key_metrics?.fleet_health_trend ? TREND_ICON[briefing.key_metrics.fleet_health_trend] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl ${style.bg} text-white shadow-xl shadow-slate-900/10`}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-white/5 rounded-full blur-3xl" />

      <div className="relative p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/70 font-semibold">AI Morning Briefing</p>
              <p className="text-sm text-white/90 font-medium">{greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <StatusIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-wider">{style.label}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {loading && !briefing ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-white/90">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm">AssetMind is analyzing your fleet...</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/60 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ width: '40%' }}
              />
            </div>
          </div>
        ) : briefing ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-2">{briefing.headline}</h2>
            <p className="text-sm sm:text-[15px] text-white/90 leading-relaxed max-w-3xl">{briefing.briefing}</p>

            {/* Key metrics bar */}
            {briefing.key_metrics && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-white/15">
                {briefing.key_metrics.fleet_health_trend && TrendIcon && (
                  <div className="flex items-center gap-1.5">
                    <TrendIcon className={`w-3.5 h-3.5 ${TREND_COLOR[briefing.key_metrics.fleet_health_trend]}`} />
                    <span className="text-xs text-white/80">
                      Health <span className="font-semibold capitalize">{briefing.key_metrics.fleet_health_trend}</span>
                    </span>
                  </div>
                )}
                {briefing.key_metrics.risk_delta && (
                  <span className="text-xs text-white/80">{briefing.key_metrics.risk_delta}</span>
                )}
                {briefing.key_metrics.cost_outlook && (
                  <span className="text-xs text-white/80">{briefing.key_metrics.cost_outlook}</span>
                )}
              </div>
            )}

            {lastGenerated && (
              <p className="text-[10px] text-white/60 mt-4">
                Generated {new Date(lastGenerated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/70" />
            <p className="text-sm text-white/90">Tap refresh to generate your AI briefing</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}