import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';
import { 
  Search, Users, Filter, Shield, Mail, Phone,
  Star, CheckCircle2, Clock, Zap, Building2, UserPlus
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PendingContractorsBanner from '@/components/team/PendingContractorsBanner';
import InviteContractorDialog from '@/components/team/InviteContractorDialog';
import PendingInvitations from '@/components/team/PendingInvitations';
import PullToRefresh from '@/components/mobile/PullToRefresh';

const LEVEL_COLORS = {
  junior: 'bg-slate-100 text-slate-700',
  intermediate: 'bg-blue-100 text-blue-700',
  senior: 'bg-violet-100 text-violet-700',
  expert: 'bg-amber-100 text-amber-700',
  master: 'bg-emerald-100 text-emerald-700',
};

const STATUS_COLORS = {
  available: 'bg-emerald-500',
  busy: 'bg-amber-500',
  on_leave: 'bg-slate-400',
  unavailable: 'bg-red-500',
};

export default function TeamDirectory() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => base44.entities.Technician.list('-created_date', 200),
  });

  const { data: kudos = [] } = useQuery({
    queryKey: ['kudos'],
    queryFn: () => base44.entities.KudosMessage.list('-created_date', 500),
  });

  const kudosByTech = kudos.reduce((acc, k) => {
    acc[k.to_technician_id] = (acc[k.to_technician_id] || 0) + 1;
    return acc;
  }, {});

  const approvedTechnicians = technicians.filter(t => t.approval_status !== 'pending' && t.approval_status !== 'rejected');

  const filtered = approvedTechnicians.filter(t => {
    const matchSearch = !search || 
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || (t.worker_type || 'employee') === typeFilter;
    const matchLevel = levelFilter === 'all' || t.certification_level === levelFilter;
    const matchStatus = statusFilter === 'all' || t.availability_status === statusFilter;
    return matchSearch && matchType && matchLevel && matchStatus;
  });

  const employees = approvedTechnicians.filter(t => (t.worker_type || 'employee') === 'employee').length;
  const contractors = approvedTechnicians.filter(t => t.worker_type === 'contractor').length;
  const available = approvedTechnicians.filter(t => t.availability_status === 'available').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <PullToRefresh onRefresh={async () => { await queryClient.invalidateQueries(['technicians']); await queryClient.invalidateQueries(['kudos']); }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-8" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Team Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Browse team members, view profiles, and send recognition</p>
          </div>
          <Button onClick={() => setInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-11 shrink-0">
            <UserPlus className="w-4 h-4 mr-2" /> Invite Contractor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-slate-500">Total Team</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{technicians.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500">Employees</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{employees}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-violet-500" />
              <span className="text-xs text-slate-500">Contractors</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{contractors}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-500">Available Now</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{available}</p>
          </div>
        </div>

        {/* Pending Invitations (for contractors) */}
        <PendingInvitations />

        {/* Pending Contractors (for admins) */}
        <PendingContractorsBanner technicians={technicians} />

        <InviteContractorDialog open={inviteOpen} onOpenChange={setInviteOpen} />

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[calc(33%-5px)] sm:w-36 h-10 bg-white"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="employee">Employees</SelectItem>
              <SelectItem value="contractor">Contractors</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[calc(33%-5px)] sm:w-36 h-10 bg-white"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
              <SelectItem value="master">Master</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[calc(33%-5px)] sm:w-36 h-10 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((tech, i) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/MyProfile?id=${tech.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {tech.profile_image_url ? (
                        <img src={tech.profile_image_url} alt={tech.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{tech.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${STATUS_COLORS[tech.availability_status] || STATUS_COLORS.available}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{tech.name}</h3>
                      <Badge className={LEVEL_COLORS[tech.certification_level] || LEVEL_COLORS.intermediate} variant="secondary">
                        {tech.certification_level || 'intermediate'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] capitalize">{tech.worker_type || 'employee'}</Badge>
                      {tech.company_name && <span className="text-xs text-slate-400">{tech.company_name}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{tech.performance_rating || 0}</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{tech.completed_tasks_count || 0} tasks</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-pink-500" />{kudosByTech[tech.id] || 0} kudos</span>
                    </div>
                    {tech.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tech.skills.slice(0, 3).map((s, j) => (
                          <span key={j} className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-600">{s}</span>
                        ))}
                        {tech.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{tech.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No team members found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
      </PullToRefresh>
    </div>
  );
}