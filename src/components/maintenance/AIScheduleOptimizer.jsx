import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Calendar, Clock, AlertTriangle, Zap, TrendingUp,
  Loader2, ChevronDown, ChevronUp, DollarSign, Users, Wrench
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, addDays, differenceInDays } from 'date-fns';

export default function AIScheduleOptimizer({ equipment = [], tasks = [], onCreateTask }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);

  const criticalityMultiplier = {
    'low': 1,
    'medium': 2,
    'high': 4,
    'mission_critical': 10
  };

  const baseCosts = {
    'low': 5000,
    'medium': 15000,
    'high': 50000,
    'mission_critical': 200000
  };

  const generateOptimizedSchedule = () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      // Get equipment needing maintenance (no pending tasks)
      const pendingTaskEquipmentIds = tasks
        .filter(t => t.status === 'scheduled' || t.status === 'in_progress')
        .map(t => t.equipment_id);

      const assetsNeedingMaintenance = equipment
        .filter(e => !pendingTaskEquipmentIds.includes(e.id))
        .filter(e => 
          e.failure_probability > 15 || 
          e.remaining_useful_life_days < 180 ||
          e.health_score < 80 ||
          e.risk_level === 'high' || 
          e.risk_level === 'critical'
        );

      // Calculate priority score for each asset
      const scoredAssets = assetsNeedingMaintenance.map(asset => {
        const failureProb = asset.failure_probability || 0;
        const rul = asset.remaining_useful_life_days || 365;
        const healthScore = asset.health_score || 100;
        const criticality = asset.criticality || 'medium';
        
        // Calculate potential failure cost
        const failureCost = (baseCosts[criticality] || 15000) * (failureProb / 100) * 3;
        
        // Calculate urgency score (higher = more urgent)
        const urgencyScore = 
          (failureProb * 2) + 
          (100 - healthScore) * 1.5 + 
          (180 - Math.min(rul, 180)) * 0.5 +
          (criticalityMultiplier[criticality] || 2) * 10;

        // Optimal scheduling window
        let optimalWindow = 'routine';
        let scheduleDays = 30;
        if (urgencyScore > 150 || failureProb > 50 || rul < 30) {
          optimalWindow = 'immediate';
          scheduleDays = 3;
        } else if (urgencyScore > 100 || failureProb > 30 || rul < 60) {
          optimalWindow = 'urgent';
          scheduleDays = 7;
        } else if (urgencyScore > 60 || failureProb > 20 || rul < 90) {
          optimalWindow = 'soon';
          scheduleDays = 14;
        }

        // Estimate maintenance cost and duration
        const maintenanceCost = Math.round((baseCosts[criticality] || 15000) * 0.1);
        const estimatedHours = optimalWindow === 'immediate' ? 8 : optimalWindow === 'urgent' ? 6 : 4;

        // Recommended personnel
        const personnelMap = {
          'motor': 'Electrical Technician',
          'pump': 'Mechanical Engineer',
          'bridge': 'Structural Engineer',
          'railway_track': 'Track Crew',
          'building': 'Facilities Team',
          'dam': 'Hydraulic Engineer',
          'wind_turbine': 'Wind Technician'
        };

        return {
          ...asset,
          urgencyScore: Math.round(urgencyScore),
          failureCost: Math.round(failureCost),
          maintenanceCost,
          estimatedHours,
          optimalWindow,
          scheduleDays,
          recommendedDate: addDays(new Date(), scheduleDays),
          recommendedPersonnel: personnelMap[asset.type] || 'Maintenance Technician',
          costSavings: Math.round(failureCost - maintenanceCost)
        };
      });

      // Sort by urgency score
      scoredAssets.sort((a, b) => b.urgencyScore - a.urgencyScore);

      // Group by week for scheduling
      const weeklySchedule = [];
      const technicianCapacity = 40; // hours per week
      let currentWeek = 0;
      let weekHours = 0;

      scoredAssets.forEach(asset => {
        if (weekHours + asset.estimatedHours > technicianCapacity) {
          currentWeek++;
          weekHours = 0;
        }
        
        const weekStart = addDays(new Date(), currentWeek * 7);
        const weekEnd = addDays(weekStart, 6);
        
        if (!weeklySchedule[currentWeek]) {
          weeklySchedule[currentWeek] = {
            weekNumber: currentWeek + 1,
            startDate: weekStart,
            endDate: weekEnd,
            tasks: [],
            totalHours: 0,
            totalCost: 0,
            potentialSavings: 0
          };
        }
        
        weeklySchedule[currentWeek].tasks.push(asset);
        weeklySchedule[currentWeek].totalHours += asset.estimatedHours;
        weeklySchedule[currentWeek].totalCost += asset.maintenanceCost;
        weeklySchedule[currentWeek].potentialSavings += asset.costSavings;
        weekHours += asset.estimatedHours;
      });

      // Calculate summary stats
      const totalSavings = scoredAssets.reduce((sum, a) => sum + a.costSavings, 0);
      const totalMaintenanceCost = scoredAssets.reduce((sum, a) => sum + a.maintenanceCost, 0);
      const criticalCount = scoredAssets.filter(a => a.optimalWindow === 'immediate').length;
      const urgentCount = scoredAssets.filter(a => a.optimalWindow === 'urgent').length;

      setOptimizedSchedule({
        assets: scoredAssets,
        weeklySchedule,
        summary: {
          totalAssets: scoredAssets.length,
          criticalCount,
          urgentCount,
          totalMaintenanceCost,
          totalSavings,
          totalHours: scoredAssets.reduce((sum, a) => sum + a.estimatedHours, 0),
          weeksRequired: weeklySchedule.length
        }
      });
      
      setIsOptimizing(false);
    }, 1500);
  };

  const getWindowColor = (window) => ({
    immediate: 'bg-rose-50 text-rose-700 border-rose-200',
    urgent: 'bg-orange-50 text-orange-700 border-orange-200',
    soon: 'bg-amber-50 text-amber-700 border-amber-200',
    routine: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }[window] || 'bg-slate-100 text-slate-600');

  const handleCreateTask = (asset) => {
    if (onCreateTask) {
      onCreateTask({
        equipment_id: asset.id,
        title: `AI-Scheduled Maintenance - ${asset.name}`,
        description: `Priority Score: ${asset.urgencyScore}. Potential failure cost avoided: $${asset.failureCost.toLocaleString()}. Health: ${asset.health_score}%, RUL: ${asset.remaining_useful_life_days} days.`,
        type: asset.optimalWindow === 'immediate' ? 'emergency' : 'predictive',
        priority: asset.optimalWindow === 'immediate' ? 'urgent' : asset.optimalWindow === 'urgent' ? 'high' : 'medium',
        scheduled_date: format(asset.recommendedDate, 'yyyy-MM-dd'),
        estimated_duration_hours: asset.estimatedHours,
        assigned_to: asset.recommendedPersonnel,
        cost_estimate: asset.maintenanceCost,
        ai_recommended: true,
        ai_confidence: Math.min(95, 70 + asset.urgencyScore / 5)
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl">
              <Brain className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">AI Schedule Optimizer</h3>
              <p className="text-sm text-slate-500">Optimal maintenance schedule based on predictions</p>
            </div>
          </div>
          <Button
            onClick={generateOptimizedSchedule}
            disabled={isOptimizing}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isOptimizing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Generate Schedule'}
          </Button>
        </div>
      </div>

      {isOptimizing && (
        <div className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-violet-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-900 font-medium">Analyzing predictions and optimizing schedule...</p>
          <p className="text-sm text-slate-500 mt-1">Considering failure risks, costs, and resource allocation</p>
        </div>
      )}

      {optimizedSchedule && !isOptimizing && (
        <div className="p-5 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
              <Wrench className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold text-slate-900">{optimizedSchedule.summary.totalAssets}</p>
              <p className="text-xs text-slate-500">Assets to Schedule</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
              <AlertTriangle className="w-5 h-5 text-rose-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold text-rose-600">{optimizedSchedule.summary.criticalCount}</p>
              <p className="text-xs text-slate-500">Immediate Action</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
              <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold text-emerald-600">${(optimizedSchedule.summary.totalSavings / 1000).toFixed(0)}k</p>
              <p className="text-xs text-slate-500">Potential Savings</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
              <Clock className="w-5 h-5 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold text-slate-900">{optimizedSchedule.summary.totalHours}h</p>
              <p className="text-xs text-slate-500">Total Work Hours</p>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Optimized Weekly Schedule
            </h4>

            {optimizedSchedule.weeklySchedule.map((week, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setExpandedWeek(expandedWeek === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-violet-600">{week.weekNumber}</span>
                      </div>
                      <div>
                        <p className="text-slate-900 font-medium">
                          {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-slate-500">
                          {week.tasks.length} tasks • {week.totalHours}h workload
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-emerald-600">+${(week.potentialSavings / 1000).toFixed(1)}k savings</p>
                        <p className="text-xs text-slate-500">${week.totalCost.toLocaleString()} cost</p>
                      </div>
                      {expandedWeek === idx ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={(week.totalHours / 40) * 100} className="h-1.5 bg-slate-200" />
                    <p className="text-xs text-slate-500 mt-1">{Math.round((week.totalHours / 40) * 100)}% capacity utilized</p>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedWeek === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-4 space-y-2">
                        {week.tasks.map((asset, taskIdx) => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">
                                {asset.health_score || 0}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{asset.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={getWindowColor(asset.optimalWindow)}>
                                    {asset.optimalWindow}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {asset.estimatedHours}h • {asset.recommendedPersonnel}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs text-slate-500">Score: {asset.urgencyScore}</p>
                                <p className="text-xs text-emerald-600">Save ${asset.costSavings.toLocaleString()}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleCreateTask(asset)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                              >
                                Create Task
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {optimizedSchedule.weeklySchedule.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>All assets are either healthy or already have scheduled tasks</p>
            </div>
          )}
        </div>
      )}

      {!optimizedSchedule && !isOptimizing && (
        <div className="p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Click "Generate Schedule" to create an AI-optimized maintenance plan</p>
          <p className="text-sm text-slate-400 mt-1">Based on failure predictions, asset criticality, and resource constraints</p>
        </div>
      )}
    </div>
  );
}