import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, TrendingDown, AlertTriangle, Target, ChevronDown, ChevronUp,
  Activity, Zap
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { format, addDays } from 'date-fns';

export default function RULVisualization({ equipment, predictions = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Seeded random for consistent visualization
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate RUL trend data with confidence intervals
  const generateRULTrend = React.useCallback((eq) => {
    const baseRUL = eq.remaining_useful_life_days || 90;
    const degradationRate = (100 - (eq.health_score || 80)) / 100;
    const eqSeed = eq.id ? eq.id.charCodeAt(0) : 42;
    
    return Array.from({ length: 60 }, (_, i) => {
      const day = addDays(new Date(), i);
      const noise = seededRandom(eqSeed + i * 0.7) * 2 - 1;
      const predicted = Math.max(0, baseRUL - i - (degradationRate * i * 0.5) + noise);
      const upperBound = Math.min(predicted * 1.2, baseRUL);
      const lowerBound = Math.max(predicted * 0.8, 0);
      
      return {
        date: format(day, 'MMM d'),
        predicted: Math.round(predicted),
        upperBound: Math.round(upperBound),
        lowerBound: Math.round(lowerBound),
        threshold: 14
      };
    });
  }, []);

  // Generate failure probability trend
  const generateFailureProbability = React.useCallback((eq) => {
    const baseProb = eq.failure_probability || 15;
    const eqSeed = eq.id ? eq.id.charCodeAt(0) : 42;
    
    return Array.from({ length: 30 }, (_, i) => {
      const day = addDays(new Date(), i);
      const noise = seededRandom(eqSeed + i * 1.3) * 5 - 2.5;
      const probability = Math.min(100, baseProb + (i * 1.5) + noise);
      
      return {
        date: format(day, 'MMM d'),
        probability: Math.round(probability),
        critical: 70
      };
    });
  }, []);

  const getRiskColor = (rul) => {
    if (rul <= 7) return 'text-rose-600 bg-rose-50';
    if (rul <= 14) return 'text-orange-600 bg-orange-50';
    if (rul <= 30) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const atRiskEquipment = equipment
    .filter(eq => (eq.remaining_useful_life_days || 999) < 60 || (eq.failure_probability || 0) > 30)
    .sort((a, b) => (a.remaining_useful_life_days || 999) - (b.remaining_useful_life_days || 999));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.name.includes('RUL') ? 'days' : '%'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">RUL & Failure Probability Analysis</h3>
              <p className="text-sm text-slate-500">{atRiskEquipment.length} assets require attention</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-medium text-rose-700">Critical (&lt;7 days)</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">
            {equipment.filter(eq => (eq.remaining_useful_life_days || 999) < 7).length}
          </p>
        </div>
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Warning (7-14 days)</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            {equipment.filter(eq => (eq.remaining_useful_life_days || 999) >= 7 && (eq.remaining_useful_life_days || 999) < 14).length}
          </p>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Monitor (14-30 days)</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            {equipment.filter(eq => (eq.remaining_useful_life_days || 999) >= 14 && (eq.remaining_useful_life_days || 999) < 30).length}
          </p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Healthy (&gt;30 days)</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {equipment.filter(eq => (eq.remaining_useful_life_days || 999) >= 30).length}
          </p>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-slate-100"
        >
          {/* Asset Selection */}
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Select Asset for Detailed Analysis</h4>
            <div className="flex flex-wrap gap-2">
              {atRiskEquipment.slice(0, 10).map(eq => (
                <button
                  key={eq.id}
                  onClick={() => setSelectedAsset(eq)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    selectedAsset?.id === eq.id 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="font-medium">{eq.name}</span>
                  <Badge className={`ml-2 ${getRiskColor(eq.remaining_useful_life_days)}`}>
                    {eq.remaining_useful_life_days || 'N/A'} days
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {selectedAsset && (
            <div className="p-5 space-y-6">
              {/* RUL Trend with Confidence Interval */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Remaining Useful Life Forecast - {selectedAsset.name}
                </h4>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateRULTrend(selectedAsset)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <ReferenceLine y={14} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Critical Threshold', fill: '#ef4444', fontSize: 10 }} />
                      <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="#c7d2fe" name="Upper Bound" />
                      <Area type="monotone" dataKey="lowerBound" stroke="transparent" fill="#ffffff" name="Lower Bound" />
                      <Line type="monotone" dataKey="predicted" stroke="#4f46e5" strokeWidth={2} dot={false} name="Predicted RUL" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Failure Probability Trend */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Failure Probability Trend
                </h4>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateFailureProbability(selectedAsset)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Critical (70%)', fill: '#ef4444', fontSize: 10 }} />
                      <Area type="monotone" dataKey="probability" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} name="Failure Probability" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Current Status Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">Current Health</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedAsset.health_score || 0}%</p>
                  <Progress value={selectedAsset.health_score || 0} className="h-1.5 mt-2" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">RUL</p>
                  <p className={`text-2xl font-bold ${getRiskColor(selectedAsset.remaining_useful_life_days).split(' ')[0]}`}>
                    {selectedAsset.remaining_useful_life_days || 'N/A'} days
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">Failure Probability</p>
                  <p className="text-2xl font-bold text-amber-600">{selectedAsset.failure_probability || 0}%</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}