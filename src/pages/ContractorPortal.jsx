import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Briefcase, Calendar, Bell, Settings, CheckCircle2, 
  Clock, XCircle, Mail, Building2, DollarSign, Star, Wrench,
  FileText, ChevronRight, Edit, Send
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailabilityScheduler from '@/components/contractor/AvailabilityScheduler';
import EditContractorProfileDialog from '@/components/contractor/EditContractorProfileDialog';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-700',
};

export default function ContractorPortal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEditProfile, setShowEditProfile] = useState(false);

  const { data: technician, isLoading: loadingTech } = useQuery({
    queryKey: ['myTechnician', user?.email],
    queryFn: async () => {
      const results = await base44.entities.Technician.filter({ email: user.email });
      return results[0];
    },
    enabled: !!user?.email,
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ['myApplications', technician?.id],
    queryFn: () => base44.entities.JobApplication.filter({ contractor_id: technician.id }, '-created_date', 50),
    enabled: !!technician?.id,
  });

  const { data: teamInvitations = [] } = useQuery({
    queryKey: ['myInvitations', technician?.id],
    queryFn: () => base44.entities.TeamInvitation.filter({ contractor_technician_id: technician.id }, '-created_date', 20),
    enabled: !!technician?.id,
  });

  const { data: assignedWorkOrders = [] } = useQuery({
    queryKey: ['assignedWorkOrders', technician?.email],
    queryFn: () => base44.entities.WorkOrder.filter({ assigned_to: technician.email }, '-created_date', 50),
    enabled: !!technician?.email,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ invitationId, response }) => {
      const res = await base44.functions.invoke('respondToInvitation', { invitation_id: invitationId, response });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['myTechnician'] });
    },
  });

  if (loadingTech) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-5">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Contractor Profile</h2>
          <p className="text-slate-500 mb-6">
            You don't have a contractor profile yet. Register to start applying for jobs.
          </p>
          <Link to="/ContractorRegister">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <FileText className="w-4 h-4 mr-2" /> Register as Contractor
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingInvitations = teamInvitations.filter(i => i.status === 'pending');
  const pendingApplications = myApplications.filter(a => a.status === 'pending');
  const activeWorkOrders = assignedWorkOrders.filter(wo => wo.status === 'in_progress' || wo.status === 'assigned');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0">
              {technician.profile_image_url ? (
                <img src={technician.profile_image_url} alt={technician.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{technician.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{technician.name}</h1>
                <Badge className={`${technician.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {technician.approval_status === 'approved' ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                {technician.company_name && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{technician.company_name}</span>}
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{technician.email}</span>
                {technician.hourly_rate && <span className="flex items-center gap-1 text-emerald-600"><DollarSign className="w-3.5 h-3.5" />${technician.hourly_rate}/hr</span>}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{technician.performance_rating || 0} rating</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{technician.completed_tasks_count || 0} completed</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowEditProfile(true)}>
              <Edit className="w-4 h-4 mr-1" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-500">Pending Invites</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingInvitations.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-slate-500">Applications</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingApplications.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-500">Active Jobs</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{activeWorkOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-slate-500">Total Completed</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{technician.completed_tasks_count || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 mb-4 w-full sm:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="invitations">Invitations {pendingInvitations.length > 0 && `(${pendingInvitations.length})`}</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AvailabilityScheduler technician={technician} />
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" /> Recent Activity
                </h3>
                {activeWorkOrders.length === 0 && pendingInvitations.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No recent activity</p>
                ) : (
                  <div className="space-y-2">
                    {pendingInvitations.slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">Team invitation from {inv.invited_by_name}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                    {activeWorkOrders.slice(0, 3).map(wo => (
                      <div key={wo.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Wrench className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{wo.title}</p>
                          <p className="text-xs text-slate-500">{wo.status}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/JobBoard" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    <Briefcase className="w-4 h-4 mr-2" /> Browse Job Board
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invitations">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Team Invitations</h3>
              {teamInvitations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No invitations yet</p>
              ) : (
                <div className="space-y-3">
                  {teamInvitations.map(inv => (
                    <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Invitation from {inv.invited_by_name}</p>
                        {inv.message && <p className="text-sm text-slate-500 mt-1">{inv.message}</p>}
                        <Badge className={STATUS_COLORS[inv.status]} variant="secondary">{inv.status}</Badge>
                      </div>
                      {inv.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200"
                            onClick={() => respondMutation.mutate({ invitationId: inv.id, response: 'declined' })}
                            disabled={respondMutation.isPending}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => respondMutation.mutate({ invitationId: inv.id, response: 'accepted' })}
                            disabled={respondMutation.isPending}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">My Job Applications</h3>
              {myApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No applications yet</p>
                  <Link to="/JobBoard" className="inline-block mt-3">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{app.job_title}</p>
                        <p className="text-xs text-slate-500">Applied {new Date(app.created_date).toLocaleDateString()}</p>
                      </div>
                      <Badge className={STATUS_COLORS[app.status]}>{app.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Assigned Work Orders</h3>
              {assignedWorkOrders.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No assigned work orders</p>
              ) : (
                <div className="space-y-3">
                  {assignedWorkOrders.map(wo => (
                    <Link key={wo.id} to={`/Maintenance?workOrderId=${wo.id}`} className="block">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div>
                          <p className="font-medium text-slate-900">{wo.title}</p>
                          <p className="text-xs text-slate-500">{wo.work_order_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{wo.status}</Badge>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <EditContractorProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        technician={technician}
      />
    </div>
  );
}