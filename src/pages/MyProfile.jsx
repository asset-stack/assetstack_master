import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Award, Wrench, Heart, Download, Loader2, UserCircle } from 'lucide-react';

import ProfileHeader from '@/components/profile/ProfileHeader';
import PerformanceMetrics from '@/components/profile/PerformanceMetrics';
import BadgesSection from '@/components/profile/BadgesSection';
import WorkHistory from '@/components/profile/WorkHistory';
import KudosSection from '@/components/profile/KudosSection';
import EditProfileDialog from '@/components/profile/EditProfileDialog';

export default function MyProfile() {
  const [editOpen, setEditOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Check if viewing someone else's profile via URL param
  const urlParams = new URLSearchParams(window.location.search);
  const techId = urlParams.get('id');

  // Fetch all technicians
  const { data: technicians = [], refetch: refetchTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 200),
  });

  // Find the profile to display
  const technician = techId 
    ? technicians.find(t => t.id === techId)
    : technicians.find(t => t.email === currentUser?.email);

  const isOwnProfile = !techId || technician?.email === currentUser?.email;

  // Fetch tasks assigned to this technician
  const { data: tasks = [] } = useQuery({
    queryKey: ['techTasks', technician?.id],
    queryFn: () => technician ? base44.entities.MaintenanceTask.filter({ assigned_to: technician.name }, '-created_date', 200) : [],
    enabled: !!technician,
  });

  // Fetch work orders
  const { data: workOrders = [] } = useQuery({
    queryKey: ['techWorkOrders', technician?.id],
    queryFn: () => technician ? base44.entities.WorkOrder.filter({ assigned_to: technician.name }, '-created_date', 200) : [],
    enabled: !!technician,
  });

  // Fetch equipment for mapping
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 200),
  });
  const equipmentMap = equipment.reduce((acc, e) => ({ ...acc, [e.id]: e.name }), {});

  // Fetch kudos
  const { data: kudos = [] } = useQuery({
    queryKey: ['kudos'],
    queryFn: () => base44.entities.KudosMessage.list('-created_date', 100),
  });
  const kudosCount = kudos.filter(k => k.to_technician_id === technician?.id).length;

  // Download PDF report
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await base44.functions.invoke('generateWorkReport', { 
        technician_id: technician.id 
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${technician.name?.replace(/\s+/g, '_')}_Work_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (!technician) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">No Profile Found</h2>
          <p className="text-sm text-slate-500 mt-1">
            {techId ? 'This profile does not exist.' : 'No technician profile is linked to your account yet. Ask an admin to create your profile.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {/* Header */}
        <ProfileHeader technician={technician} onEdit={() => setEditOpen(true)} />

        {/* Download Report Button */}
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="gap-2"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Work Report (PDF)
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="performance" className="mt-6">
          <TabsList className="bg-white border border-slate-200 shadow-sm p-1 rounded-xl w-full sm:w-auto overflow-x-auto flex-nowrap">
            <TabsTrigger value="performance" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Performance</span><span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm">
              <Wrench className="w-4 h-4 mr-1 sm:mr-2" /> History
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm">
              <Award className="w-4 h-4 mr-1 sm:mr-2" /> Badges
            </TabsTrigger>
            <TabsTrigger value="kudos" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm">
              <Heart className="w-4 h-4 mr-1 sm:mr-2" /> Kudos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6">
            <PerformanceMetrics technician={technician} tasks={tasks} workOrders={workOrders} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <WorkHistory tasks={tasks} workOrders={workOrders} equipmentMap={equipmentMap} />
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <BadgesSection technician={technician} kudosCount={kudosCount} />
          </TabsContent>

          <TabsContent value="kudos" className="mt-6">
            <KudosSection kudos={kudos} technician={technician} technicians={technicians} isOwnProfile={isOwnProfile} />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {editOpen && (
          <EditProfileDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            technician={technician}
            onSaved={refetchTechnicians}
          />
        )}
      </div>
    </div>
  );
}