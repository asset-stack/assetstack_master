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

  // Generate prediction trend data
  const predictionTrendData = Array.from({ length: 14 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: 75 + Math.random() * 10 - 5,
    predicted: 73 + Math.random() * 12 - 6 + (i * 0.3)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-2xl border-b border-slate-100">
        <div className="px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Predictive Maintenance
                </h1>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-100 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[11px] text-emerald-700 font-semibold tracking-wide">LIVE</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">AI-Powered Asset Health Monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-72 h-10 bg-slate-50/50 border-slate-200/60 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl bg-slate-50/50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-[18px] h-[18px]" />
                {activeAlerts > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full text-[10px] font-semibold text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
                    {activeAlerts}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50/50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <Settings className="w-[18px] h-[18px]" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 lg:px-8 py-8">
        {/* Onboarding Banner */}
        <OnboardingBanner />
        
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Fleet Overview */}
          <FleetOverview equipment={equipment} />
          
          {/* Risk Heatmap */}
          <div className="lg:col-span-2">
            <RiskHeatmap equipment={equipment} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Equipment Fleet</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => queryClient.invalidateQueries(['equipment'])}
            className="h-9 bg-white/80 border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loadingEquipment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="h-3 bg-slate-100 rounded-full w-1/3 mb-4" />
                <div className="h-5 bg-slate-100 rounded-lg w-2/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Cpu className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No equipment found</h3>
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