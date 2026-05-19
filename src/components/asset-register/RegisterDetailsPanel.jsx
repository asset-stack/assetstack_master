import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Cpu, Activity, AlertTriangle, Calendar, Gauge, Wrench, MapPin, DoorOpen,
  Sparkles, FileText, Camera, Package, ShieldCheck, TrendingDown, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import HealthBar from './HealthBar';
import Sparkline from './Sparkline';
import { generateSparkline, computeDataQuality, RISK_BADGE, CRITICALITY_BADGE } from './registerUtils';

const statusStyles = {
  operational: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  degraded: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  maintenance: 'bg-blue-50 text-blue-700 border-blue-200',
  offline: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function RegisterDetailsPanel({ asset, onClose }) {
  const [aiThought, setAiThought] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const askAssetMind = async () => {
    if (!asset) return;
    setLoadingAi(true);
    setAiThought(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an asset management expert. Analyse this asset in 4 short bullet points: 1) Current condition assessment, 2) Top risk factor, 3) Recommended next action, 4) Cohort comparison vs similar assets.\n\nAsset:\n${JSON.stringify({
          name: asset.name, type: asset.type, location: asset.location,
          status: asset.status, health_score: asset.health_score,
          risk_level: asset.risk_level, criticality: asset.criticality,
          failure_probability: asset.failure_probability,
          operating_hours: asset.operating_hours,
          installation_date: asset.installation_date,
          last_maintenance_date: asset.last_maintenance_date,
        }, null, 2)}`,
      });
      setAiThought(result);
    } catch (e) {
      setAiThought('Unable to reach AssetMind right now.');
    }
    setLoadingAi(false);
  };

  if (!asset) return null;

  const dq = computeDataQuality(asset);
  const sparkPoints = generateSparkline(asset);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 460, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 460, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="fixed right-3 top-20 bottom-3 w-[420px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-40 overflow-hidden flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shrink-0">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{asset.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 capitalize truncate">
                  {asset.type?.replace(/_/g, ' ')} · {asset.location || 'Unassigned'}
                  {asset.room && <span className="text-teal-700"> · {asset.room}</span>}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="outline" className={statusStyles[asset.status] || statusStyles.offline}>
              {asset.status || 'unknown'}
            </Badge>
            {asset.risk_level && (
              <Badge variant="outline" className={`border-0 ${RISK_BADGE[asset.risk_level] || ''}`}>
                <AlertTriangle className="w-3 h-3 mr-1" /> {asset.risk_level} risk
              </Badge>
            )}
            {asset.criticality && (
              <Badge variant="outline" className={`border-0 ${CRITICALITY_BADGE[asset.criticality] || ''}`}>
                {asset.criticality.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 grid grid-cols-3 h-8">
            <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
            <TabsTrigger value="ai" className="text-[11px]">AssetMind</TabsTrigger>
            <TabsTrigger value="linked" className="text-[11px]">Linked</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-y-auto p-5 space-y-4 mt-0">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Health · 90 day trend</span>
                <Gauge className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-slate-900 tabular-nums">{asset.health_score ?? 0}</span>
                  <span className="text-sm text-slate-500 mb-1">/100</span>
                </div>
                <Sparkline points={sparkPoints} width={100} height={28}
                  color={(asset.health_score || 0) >= 70 ? '#10b981' : (asset.health_score || 0) >= 50 ? '#f59e0b' : '#ef4444'} />
              </div>
              <div className="mt-2">
                <HealthBar score={asset.health_score} showValue={false} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <InfoCard icon={MapPin} label="Location" value={asset.location || '—'} />
              <InfoCard icon={DoorOpen} label="Room" value={asset.room || '—'} />
              <InfoCard icon={Activity} label="Operating Hrs" value={asset.operating_hours?.toLocaleString() || '0'} />
              <InfoCard icon={TrendingDown} label="Failure Prob." value={asset.failure_probability != null ? `${asset.failure_probability}%` : '—'} />
              <InfoCard icon={Calendar} label="Last Maint." value={asset.last_maintenance_date || '—'} />
              <InfoCard icon={ShieldCheck} label="Data Quality" value={`${dq}%`} />
            </div>

            {asset.manufacturer && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Specifications</p>
                <div className="space-y-1 text-[12px]">
                  <Row label="Manufacturer" value={asset.manufacturer} />
                  <Row label="Model" value={asset.model} />
                  <Row label="Serial" value={asset.serial_number} />
                  {asset.rated_capacity && <Row label="Capacity" value={`${asset.rated_capacity} ${asset.capacity_unit || ''}`} />}
                  {asset.installation_date && <Row label="Installed" value={asset.installation_date} />}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="flex-1 overflow-y-auto p-5 space-y-3 mt-0">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">AssetMind · Explain this asset</p>
              </div>
              {!aiThought && !loadingAi && (
                <Button onClick={askAssetMind} size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Generate AI insight
                </Button>
              )}
              {loadingAi && (
                <div className="flex items-center gap-2 text-[12px] text-indigo-700 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analysing this asset…
                </div>
              )}
              {aiThought && (
                <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap">{aiThought}</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="linked" className="flex-1 overflow-y-auto p-5 space-y-2 mt-0">
            <LinkedItem icon={Wrench} label="Work Orders" hint="View open & history" to="/Maintenance" />
            <LinkedItem icon={Camera} label="Photo timeline" hint="Visual condition over time" to="/PhotoLibrary" />
            <LinkedItem icon={FileText} label="Compliance docs" hint="Certificates & inspections" to="/Compliance" />
            <LinkedItem icon={Package} label="Spare parts" hint="Inventory & reorders" to="/SpareParts" />
            <LinkedItem icon={TrendingDown} label="Depreciation" hint="WDV & replacement value" to="/Depreciation" />
          </TabsContent>
        </Tabs>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = '/Equipment'}>
            Edit
          </Button>
          <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-1.5" onClick={() => window.location.href = '/Maintenance'}>
            <Wrench className="w-3.5 h-3.5" /> Raise WO
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-lg p-2.5 border border-slate-100">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-[13px] font-semibold text-slate-900 truncate">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium truncate">{value}</span>
    </div>
  );
}

function LinkedItem({ icon: Icon, label, hint, to }) {
  return (
    <a href={to} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-500">{hint}</p>
      </div>
    </a>
  );
}