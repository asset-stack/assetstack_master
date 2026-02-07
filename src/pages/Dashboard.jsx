import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, AlertTriangle, Wrench, Cpu, TrendingUp, Clock, 
  RefreshCw, Settings, Bell, Search
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

export default function Dashboard() {
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveUpdates, setLiveUpdates] = useState({ equipment: [], alerts: [] });
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading: loadingEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 100),
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 50),
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
    queryKey: ['tasks'],
    queryFn: () => base44.entities.MaintenanceTask.list('-created_date', 50),
  });

  const { data: sensorReadings = [] } = useQuery({
    queryKey: ['sensorReadings', selectedEquipment?.id],
    queryFn: () => selectedEquipment 
      ? base44.entities.SensorReading.filter({ equipment_id: selectedEquipment.id }, '-created_date', 100)
      : [],
    enabled: !!selectedEquipment,
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
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
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm shadow-slate-100/50">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Dashboard</h1>
                <p className="text-xs text-slate-500 hidden sm:block">AI-Powered Asset Health Monitoring</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full ml-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-semibold tracking-wide uppercase">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative hidden sm:block">
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
                className="h-11 w-11 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {activeAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {activeAlerts > 9 ? '9+' : activeAlerts}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {/* Mobile search */}
          <div className="sm:hidden mt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full h-10 bg-slate-50 border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 rounded-lg"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {/* Onboarding Banner */}
        <OnboardingBanner />
        
        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
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