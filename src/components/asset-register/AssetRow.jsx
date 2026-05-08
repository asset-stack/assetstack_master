import React, { memo } from 'react';
import { Cpu, MapPin, ShieldAlert } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { STATUS_DOT, RISK_BADGE, generateSparkline, computeDataQuality } from './registerUtils';
import HealthBar from './HealthBar';
import Sparkline from './Sparkline';

function AssetRow({ asset, selected, onSelect, onClick, density = 'comfortable' }) {
  const dq = computeDataQuality(asset);
  const sparkPoints = generateSparkline(asset);
  const isCritical = asset.status === 'critical' || asset.risk_level === 'critical';
  const rowH = density === 'compact' ? 'py-1.5' : density === 'detailed' ? 'py-3' : 'py-2';

  return (
    <div
      className={`group grid grid-cols-[28px_1.6fr_1fr_140px_100px_80px_70px_44px] items-center gap-3 px-3 ${rowH} border-b border-slate-100 hover:bg-indigo-50/40 cursor-pointer transition-colors ${selected ? 'bg-indigo-50/70' : ''}`}
      onClick={onClick}
    >
      <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
        <Checkbox checked={selected} onCheckedChange={onSelect} />
      </div>

      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${isCritical ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: STATUS_DOT[asset.status] || STATUS_DOT.offline }}
        />
        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">{asset.name}</p>
          <p className="text-[11px] text-slate-500 truncate leading-tight capitalize">
            {asset.type?.replace(/_/g, ' ')}
            {asset.manufacturer && ` · ${asset.manufacturer}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-[12px] text-slate-700 truncate">{asset.location || 'Unassigned'}</span>
      </div>

      <HealthBar score={asset.health_score} />

      <div className="flex items-center gap-1">
        {asset.risk_level && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border-0 ${RISK_BADGE[asset.risk_level] || ''}`}>
            {asset.risk_level}
          </Badge>
        )}
      </div>

      <div className="text-right">
        {asset.failure_probability != null ? (
          <span className={`text-[12px] font-bold tabular-nums ${
            asset.failure_probability > 50 ? 'text-rose-600' :
            asset.failure_probability > 25 ? 'text-amber-600' : 'text-slate-600'
          }`}>
            {asset.failure_probability}%
          </span>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        )}
      </div>

      <div className="flex justify-center">
        <Sparkline
          points={sparkPoints}
          color={(asset.health_score || 0) >= 70 ? '#10b981' : (asset.health_score || 0) >= 50 ? '#f59e0b' : '#ef4444'}
        />
      </div>

      <div className="flex justify-center" title={`Data quality: ${dq}%`}>
        {dq < 60 ? (
          <ShieldAlert className={`w-3.5 h-3.5 ${dq < 40 ? 'text-rose-500' : 'text-amber-500'}`} />
        ) : (
          <span className="text-[10px] font-bold tabular-nums text-emerald-600">{dq}</span>
        )}
      </div>
    </div>
  );
}

export default memo(AssetRow);