import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { useClient } from '@/lib/ClientContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, AlertTriangle, Wrench, Cpu, TrendingUp, Clock, 
  RefreshCw, Settings, Bell, Search, ArrowRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import MetricCard from '@/components/dashboard/MetricCard';
import FleetOverview from '@/components/dashboard/FleetOverview';
import RiskHeatmap from '@/components/dashboard/RiskHeatmap';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import PredictionChart from '@/components/dashboard/PredictionChart';
import EquipmentCard from '@/components/dashboard/EquipmentCard';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import OnboardingBanner from '@/components/onboarding/OnboardingBanner';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import MatterportEmbed from '@/components/dashboard/MatterportEmbed';
import PullToRefresh from '@/components/mobile/PullToRefresh';

export default function Dashboard() {
  const { currentClient } = useClient();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveUpdates, setLiveUpdates] = useState({ equipment: [], alerts: [] });
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading: loadingEquipment } = useQuery({
    queryKey: ['equipment', currentClient?.id],
    queryFn: () => secureEntity('Equipment').list('-created_date', 1000),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', currentClient?.id],
    queryFn: () => secureEntity('Location').list('-created_date', 200),
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts', currentClient?.id],
    queryFn: () => secureEntity('Alert').list('-created_date', 50),
  });

  // Real-time subscriptions
  useEffect(() => {
    const equipmentUnsubscribe = base44.entities.Equipment.subscribe((event) => {
      queryClient.invalidateQueries(['equipment']);
      setLiveUpdates(prev => ({
        ...prev,
        equipment: [{ id: event.id, type: event.type, timestamp: Date.now() }, ...prev.equipment.slice(0, 9)]
      }));
    });

    const alertUnsubscribe = base44.entities.Alert.subscribe((event) => {
      queryClient.invalidateQueries(['alerts']);
      setLiveUpdates(prev => ({
        ...prev,
        alerts: [{ id: event.id, type: event.type, timestamp: Date.now() }, ...prev.alerts.slice(0, 9)]
      }));
    });

    return () => {
      equipmentUnsubscribe();
      alertUnsubscribe();
    };
  }, [queryClient]);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', currentClient?.id],
    queryFn: () => secureEntity('MaintenanceTask').list('-created_date', 50),
  });

  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['sensorReadings', selectedEquipment?.id],
    queryFn: () => selectedEquipment 
      ? secureEntity('SensorReading').filter({ equipment_id: selectedEquipment.id }, '-created_date', 100)
      : [],
    enabled: !!selectedEquipment,
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => secureEntity('Alert').update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['alerts']),
  });

  const handleAcknowledgeAlert = async (alertId) => {
    await updateAlertMutation.mutateAsync({ 
      id: alertId, 
      data: { status: 'acknowledged', acknowledged_at: new Date().toISOString() }
    });
  };

  const handleResolveAlert = async (alertId) => {
    await updateAlertMutation.mutateAsync({ 
      id: alertId, 
      data: { status: 'resolved', resolved_at: new Date().toISOString() }
    });
  };

  // Calculate metrics
  const totalEquipment = equipment.length;
  const operationalCount = equipment.filter(e => e.status === 'operational').length;
  const avgHealth = totalEquipment > 0 
    ? Math.round(equipment.reduce((sum, e) => sum + (e.health_score || 0), 0) / totalEquipment)
    : 0;
  const criticalCount = equipment.filter(e => e.risk_level === 'critical' || e.risk_level === 'high').length;
  const pendingTasks = tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;

  // Filter equipment by search
  const filteredEquipment = equipment.filter(e => 
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate prediction trend data with seeded random for consistency
  const predictionTrendData = React.useMemo(() => {
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 14 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: 75 + seededRandom(i * 2.7) * 10 - 5,
      predicted: 73 + seededRandom(i * 3.4) * 12 - 6 + (i * 0.3)
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      {/* Header — desktop only sticky, mobile uses layout header */}
      <header className="hidden lg:block sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm shadow-slate-100/50">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 truncate">Dashboard</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500">{currentClient?.business_name || 'Loading...'}</p>
                  <span className="text-xs text-slate-300">•</span>
                  <p className="text-xs text-indigo-600 font-medium">
                    {locations.length > 0 ? `${locations.length} locations` : 'All locations'} · {totalEquipment} assets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full ml-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-semibold tracking-wide uppercase">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 lg:w-64 h-10 bg-slate-50 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 rounded-lg focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {activeAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {activeAlerts > 9 ? '9+' : activeAlerts}
                  </span>
                )}
              </Button>
              <Link to="/Settings">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sub-header: search + actions */}
      <div className="lg:hidden px-4 pt-3 pb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full h-10 bg-white border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 rounded-lg"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 relative shrink-0"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="w-4 h-4" />
          {activeAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {activeAlerts > 9 ? '9+' : activeAlerts}
            </span>
          )}
        </Button>
      </div>

      <PullToRefresh onRefresh={async () => {
        await queryClient.invalidateQueries(['equipment']);
        await queryClient.invalidateQueries(['alerts']);
        await queryClient.invalidateQueries(['tasks']);
      }}>
      <main className="px-4 sm:px-6 lg:px-8 py-3 sm:py-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {/* Onboarding Banner */}
        <OnboardingBanner />
        
        {/* Metrics Row — 2 cols mobile, wraps cleanly with 5 items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <MetricCard 
            title="Total Assets" 
            value={totalEquipment} 
            icon={Cpu} 
            color="blue"
            delay={0}
          />
          <MetricCard 
            title="Operational" 
            value={`${totalEquipment > 0 ? Math.round((operationalCount/totalEquipment)*100) : 0}%`}
            icon={Activity} 
            color="green"
            trend="up"
            trendValue={2.5}
            delay={0.1}
          />
          <MetricCard 
            title="Fleet Health" 
            value={`${avgHealth}%`}
            icon={TrendingUp} 
            color="purple"
            trend={avgHealth >= 75 ? 'up' : 'down'}
            trendValue={1.2}
            delay={0.2}
          />
          <MetricCard 
            title="At Risk" 
            value={criticalCount}
            icon={AlertTriangle} 
            color="amber"
            delay={0.3}
          />
          <MetricCard 
            title="Pending Tasks" 
            value={pendingTasks}
            icon={Wrench} 
            color="rose"
            delay={0.4}
          />
          {/* Invisible spacer to fill 6th slot on 2-col mobile grid, prevents orphan */}
          <div className="sm:hidden" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Matterport 3D Tour — South West Sports Centre */}
          <MatterportEmbed height={360} />

          {/* Fleet Overview */}
          <FleetOverview equipment={equipment} />

          {/* Risk Heatmap */}
          <div className="lg:col-span-2">
            <RiskHeatmap equipment={equipment} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* Prediction Chart */}
          <div className="lg:col-span-2">
            <PredictionChart 
              data={predictionTrendData}
              title="Fleet Health Trend & Prediction"
              threshold={65}
            />
          </div>
          
          {/* Alerts Panel */}
          <AlertsPanel 
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
          />
        </div>

        {/* Active Tasks Quick View */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Active Tasks</h2>
            <Link to="/Maintenance">
              <Button variant="outline" size="sm" className="h-8 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                View All Tasks <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          {tasks.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No active tasks</p>
              <Link to="/Maintenance">
                <Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-xs">Create a Task</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks
                .filter(t => t.status === 'scheduled' || t.status === 'in_progress')
                .slice(0, 6)
                .map(task => {
                  const eq = equipment.find(e => e.id === task.equipment_id);
                  const priorityColors = { urgent: 'bg-rose-100 text-rose-700', high: 'bg-amber-100 text-amber-700', medium: 'bg-blue-100 text-blue-700', low: 'bg-slate-100 text-slate-600' };
                  return (
                    <Link key={task.id} to="/Maintenance" className="block">
                      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">{task.title}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${priorityColors[task.priority] || 'bg-slate-100 text-slate-600'}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{eq?.name || 'Unknown equipment'}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${task.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                            {task.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                          </span>
                          {task.assigned_to && <span className="text-[10px] text-slate-400">{task.assigned_to}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>

        {/* Equipment Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Equipment Fleet</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => queryClient.invalidateQueries(['equipment'])}
            className="h-8 bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {loadingEquipment ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-2.5 bg-slate-100 rounded-full w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded-lg w-2/3 mb-2" />
                <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredEquipment.map((eq, idx) => (
              <EquipmentCard 
                key={eq.id}
                equipment={eq}
                onClick={() => setSelectedEquipment(eq)}
                delay={idx * 0.03}
              />
            ))}
          </div>
        )}

        {filteredEquipment.length === 0 && !loadingEquipment && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No equipment found</h3>
            <p className="text-sm text-slate-500 mt-1">Add equipment to start monitoring</p>
          </div>
        )}
      </main>
      </PullToRefresh>

      {/* Equipment Details Modal */}
      <AnimatePresence>
        {selectedEquipment && (
          <EquipmentDetails
            equipment={selectedEquipment}
            readings={sensorReadings}
            onClose={() => setSelectedEquipment(null)}
            onEdit={null}
            onDelete={null}
          />
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        <NotificationsPanel 
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          alerts={alerts}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
        />
      </AnimatePresence>
    </div>
  );
}