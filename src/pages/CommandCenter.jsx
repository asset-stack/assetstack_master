import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Cpu, AlertTriangle, Wrench, TrendingUp, Activity, 
  ArrowRight, MessageSquare, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import MorningBriefing from '@/components/command/MorningBriefing';
import PriorityInbox from '@/components/command/PriorityInbox';
import SmartInsights from '@/components/command/SmartInsights';
import ActivityTimeline from '@/components/command/ActivityTimeline';
import MetricCard from '@/components/dashboard/MetricCard';
import PullToRefresh from '@/components/mobile/PullToRefresh';

export default function CommandCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [briefingData, setBriefingData] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState(null);

  // Core data
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => secureEntity('Equipment').list('-updated_date', 200),
  });
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => secureEntity('Alert').list('-created_date', 50),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => secureEntity('MaintenanceTask').list('-updated_date', 50),
  });
  const { data: workOrders = [] } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => secureEntity('WorkOrder').list('-updated_date', 50),
  });

  const loadBriefing = async () => {
    setBriefingLoading(true);
    setBriefingError(null);
    try {
      const res = await base44.functions.invoke('generateAIBriefing', {});
      if (res?.data?.briefing) {
        setBriefingData(res.data);
      } else {
        setBriefingError(res?.data?.error || 'Failed to generate briefing');
      }
    } catch (e) {
      setBriefingError(e.message);
    } finally {
      setBriefingLoading(false);
    }
  };

  // Auto-generate briefing on first load
  useEffect(() => {
    loadBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate metrics
  const totalAssets = equipment.length;
  const criticalCount = equipment.filter(e => e.risk_level === 'critical' || e.risk_level === 'high').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const pendingTasks = tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;
  const avgHealth = totalAssets ? Math.round(equipment.reduce((s, e) => s + (e.health_score || 0), 0) / totalAssets) : 0;

  const handleRefreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries(['equipment']),
      queryClient.invalidateQueries(['alerts']),
      queryClient.invalidateQueries(['tasks']),
      queryClient.invalidateQueries(['workOrders']),
      loadBriefing(),
    ]);
  };

  const briefing = briefingData?.briefing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      <PullToRefresh onRefresh={handleRefreshAll}>
        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1480px] mx-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 80px)' }}>
          {/* Top header — desktop only */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">Command Center</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-bold text-white tracking-wider">AI POWERED</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">Your intelligent operations hub</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/AIAssistant">
                <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  <MessageSquare className="w-4 h-4" />
                  Ask AssetMind
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"
          >
            {[
              { label: 'Equipment', to: '/Equipment', icon: Cpu, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
              { label: 'Maintenance', to: '/Maintenance', icon: Wrench, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
              { label: 'Predictions', to: '/Predictions', icon: TrendingUp, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
              { label: 'Analytics', to: '/Analytics', icon: Activity, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            ].map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.to} to={link.to}>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${link.iconBg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${link.iconColor}`} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{link.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>

          {/* Morning Briefing */}
          <div className="mb-5">
            <MorningBriefing
              briefing={briefing}
              loading={briefingLoading}
              onRefresh={loadBriefing}
              userName={user?.full_name}
              lastGenerated={briefingData?.generated_at}
            />
            {briefingError && (
              <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                Could not generate briefing: {briefingError}
              </div>
            )}
          </div>

          {/* Key metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-5">
            <MetricCard title="Total Assets" value={totalAssets} icon={Cpu} color="blue" delay={0} />
            <MetricCard title="Fleet Health" value={`${avgHealth}%`} icon={TrendingUp} color="purple" delay={0.05} />
            <MetricCard title="At Risk" value={criticalCount} icon={AlertTriangle} color="amber" delay={0.1} />
            <MetricCard title="Active Alerts" value={activeAlerts} icon={Activity} color="rose" delay={0.15} />
            <MetricCard title="Open Tasks" value={pendingTasks} icon={Wrench} color="green" delay={0.2} />
          </div>

          {/* Main grid: Inbox + Insights + Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            {/* Priority Inbox — left column */}
            <div className="lg:col-span-5">
              <PriorityInbox actions={briefing?.priority_actions || []} loading={briefingLoading} />
            </div>

            {/* Insights + Timeline — right columns */}
            <div className="lg:col-span-7 space-y-4">
              <SmartInsights insights={briefing?.insights || []} loading={briefingLoading} />
              <ActivityTimeline
                equipment={equipment}
                tasks={tasks}
                workOrders={workOrders}
                alerts={alerts}
              />
            </div>
          </div>

        </main>
      </PullToRefresh>
    </div>
  );
}