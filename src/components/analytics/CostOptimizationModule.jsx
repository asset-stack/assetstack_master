import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export default function CostOptimizationModule({ equipment = [], predictions = [], tasks = [] }) {
  const [maintenanceInterval, setMaintenanceInterval] = useState(90); // days

  const optimization = useMemo(() => {
    // Calculate total predicted failure costs
    const totalFailureCost = equipment.reduce((sum, eq) => {
      const eqPredictions = predictions.filter(p => p.equipment_id === eq.id);
      const latestPrediction = eqPredictions[0];
      
      // Estimate failure cost based on criticality and failure probability
      const baseCost = {
        'low': 5000,
        'medium': 15000,
        'high': 50000,
        'mission_critical': 200000
      }[eq.criticality] || 15000;
      
      const failureProbability = (eq.failure_probability || 20) / 100;
      const estimatedCost = baseCost * failureProbability * 2; // 2x multiplier for unplanned failures
      
      return sum + estimatedCost;
    }, 0);

    // Calculate current maintenance costs
    const avgMaintenanceCost = tasks.length > 0
      ? tasks.reduce((sum, t) => sum + (t.actual_cost || t.cost_estimate || 2000), 0) / tasks.length
      : 2000;

    // Cost analysis for different maintenance intervals
    const intervalAnalysis = Array.from({ length: 13 }, (_, i) => {
      const interval = 30 + (i * 30); // 30 to 390 days
      const maintenancesPerYear = 365 / interval;
      const annualMaintenanceCost = maintenancesPerYear * avgMaintenanceCost * equipment.length;
      
      // Failure risk increases with longer intervals
      const riskMultiplier = Math.pow(interval / 60, 1.5); // Exponential risk growth
      const failureRiskCost = totalFailureCost * Math.min(riskMultiplier, 3);
      
      const totalCost = annualMaintenanceCost + failureRiskCost;
      
      return {
        interval,
        maintenanceCost: Math.round(annualMaintenanceCost),
        failureCost: Math.round(failureRiskCost),
        totalCost: Math.round(totalCost),
        maintenances: Math.round(maintenancesPerYear * 10) / 10
      };
    });

    // Find optimal interval (minimum total cost)
    const optimalPoint = intervalAnalysis.reduce((min, curr) => 
      curr.totalCost < min.totalCost ? curr : min
    );

    // Current strategy costs
    const currentStrategy = intervalAnalysis.find(a => a.interval === maintenanceInterval) || optimalPoint;

    // Potential savings
    const potentialSavings = currentStrategy.totalCost - optimalPoint.totalCost;
    const savingsPercent = (potentialSavings / currentStrategy.totalCost) * 100;

    return {
      intervalAnalysis,
      optimalPoint,
      currentStrategy,
      potentialSavings: Math.max(0, potentialSavings),
      savingsPercent: Math.max(0, savingsPercent),
      totalFailureCost,
      avgMaintenanceCost
    };
  }, [equipment, predictions, tasks, maintenanceInterval]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-2">{label} days interval</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: ${(entry.value / 1000).toFixed(0)}K
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-emerald-400" />
            Cost Optimization Analysis
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Minimize total cost by balancing maintenance frequency vs failure risk
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">OPTIMAL INTERVAL</span>
          </div>
          <p className="text-3xl font-bold text-white">{optimization.optimalPoint.interval}</p>
          <p className="text-sm text-slate-400">days</p>
          <p className="text-xs text-emerald-400 mt-2">
            {optimization.optimalPoint.maintenances}x maintenance/year
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">OPTIMAL TOTAL COST</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ${(optimization.optimalPoint.totalCost / 1000).toFixed(0)}K
          </p>
          <p className="text-sm text-slate-400">per year</p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
              Maint: ${(optimization.optimalPoint.maintenanceCost / 1000).toFixed(0)}K
            </Badge>
            <Badge className="bg-rose-500/20 text-rose-400 text-xs">
              Risk: ${(optimization.optimalPoint.failureCost / 1000).toFixed(0)}K
            </Badge>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">CURRENT STRATEGY</span>
          </div>
          <p className="text-3xl font-bold text-white">{maintenanceInterval}</p>
          <p className="text-sm text-slate-400">days interval</p>
          <p className="text-xs text-purple-400 mt-2">
            ${(optimization.currentStrategy.totalCost / 1000).toFixed(0)}K annual cost
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">POTENTIAL SAVINGS</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ${(optimization.potentialSavings / 1000).toFixed(0)}K
          </p>
          <p className="text-sm text-slate-400">per year</p>
          {optimization.savingsPercent > 0 && (
            <p className="text-xs text-amber-400 mt-2">
              {optimization.savingsPercent.toFixed(1)}% cost reduction
            </p>
          )}
        </div>
      </div>

      {/* Cost Comparison Chart */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          Cost-Benefit Analysis by Maintenance Interval
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={optimization.intervalAnalysis} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="totalCostGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="interval" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 11 }}
                label={{ value: 'Maintenance Interval (days)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                label={{ value: 'Annual Cost', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine 
                x={optimization.optimalPoint.interval} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                label={{ value: 'Optimal', fill: '#10b981', fontSize: 12 }}
              />
              <ReferenceLine 
                x={maintenanceInterval} 
                stroke="#8b5cf6" 
                strokeDasharray="5 5"
                label={{ value: 'Current', fill: '#8b5cf6', fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="maintenanceCost" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Maintenance Cost"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="failureCost" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Failure Risk Cost"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="totalCost" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Total Cost"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Slider */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Adjust Current Maintenance Interval</h3>
          <span className="text-2xl font-bold text-purple-400">{maintenanceInterval} days</span>
        </div>
        <Slider
          value={[maintenanceInterval]}
          onValueChange={(value) => setMaintenanceInterval(value[0])}
          min={30}
          max={390}
          step={30}
          className="mb-4"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>30 days</span>
          <span>390 days</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Optimization Recommendations
        </h3>
        <div className="space-y-3">
          {optimization.savingsPercent > 10 && (
            <div className="flex items-start gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <span className="font-medium text-white">Optimize Interval: </span>
                Switching to {optimization.optimalPoint.interval}-day intervals could save 
                ${(optimization.potentialSavings / 1000).toFixed(0)}K annually ({optimization.savingsPercent.toFixed(1)}% reduction).
              </p>
            </div>
          )}
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-300">
              <span className="font-medium text-white">Balanced Strategy: </span>
              The optimal {optimization.optimalPoint.interval}-day interval balances {optimization.optimalPoint.maintenances}x 
              annual maintenances against failure risk costs.
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-300">
              <span className="font-medium text-white">Risk Mitigation: </span>
              Current approach has ${(optimization.currentStrategy.failureCost / 1000).toFixed(0)}K 
              in estimated failure costs. Optimal interval reduces this to ${(optimization.optimalPoint.failureCost / 1000).toFixed(0)}K.
            </p>
          </div>
          {equipment.filter(e => e.criticality === 'mission_critical').length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <span className="font-medium text-white">Critical Assets: </span>
                {equipment.filter(e => e.criticality === 'mission_critical').length} mission-critical assets 
                require more frequent monitoring regardless of optimal interval.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}