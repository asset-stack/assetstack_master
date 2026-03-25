import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { 
  Briefcase, Search, MapPin, Clock, DollarSign, Filter,
  Calendar, Wrench, CheckCircle2, Send, Building2, ChevronRight
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobApplicationDialog from '@/components/contractor/JobApplicationDialog';
import PullToRefresh from '@/components/mobile/PullToRefresh';

const CATEGORY_COLORS = {
  maintenance: 'bg-blue-100 text-blue-700',
  repair: 'bg-amber-100 text-amber-700',
  inspection: 'bg-green-100 text-green-700',
  installation: 'bg-violet-100 text-violet-700',
  emergency: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-700',
};

const TYPE_LABELS = {
  one_time: 'One-time',
  recurring: 'Recurring',
  on_call: 'On-call',
  contract: 'Contract',
};

export default function JobBoard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['publicJobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open', visibility: 'public' }, '-created_date', 100),
  });

  const { data: myTechnician } = useQuery({
    queryKey: ['myTechnician', user?.email],
    queryFn: async () => {
      const results = await base44.entities.Technician.filter({ email: user.email });
      return results[0];
    },
    enabled: !!user?.email,
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ['myApplications', myTechnician?.id],
    queryFn: () => base44.entities.JobApplication.filter({ contractor_id: myTechnician.id }),
    enabled: !!myTechnician?.id,
  });

  const appliedJobIds = new Set(myApplications.map(a => a.job_id));

  const filtered = jobs.filter(job => {
    const matchSearch = !search || 
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.description?.toLowerCase().includes(search.toLowerCase()) ||
      job.location_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.required_skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === 'all' || job.category === categoryFilter;
    const matchType = typeFilter === 'all' || job.job_type === typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      <PullToRefresh onRefresh={async () => { await queryClient.invalidateQueries(['publicJobs']); }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Job Board</h1>
          <p className="text-slate-500 mt-2">Browse available maintenance jobs and apply</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search jobs, skills, locations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 h-10"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_time">One-time</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="on_call">On-call</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No jobs found</h3>
            <p className="text-sm text-slate-500 mt-1">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job, i) => {
              const hasApplied = appliedJobIds.has(job.id);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        <Badge className={CATEGORY_COLORS[job.category]}>{job.category}</Badge>
                        <Badge variant="outline">{TYPE_LABELS[job.job_type]}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
                        {job.client_name && (
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.client_name}</span>
                        )}
                        {job.location_name && (
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location_name}</span>
                        )}
                        {job.estimated_hours && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.estimated_hours}h</span>
                        )}
                        {(job.hourly_rate || job.fixed_price) && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.fixed_price ? `$${job.fixed_price} fixed` : `$${job.hourly_rate}/hr`}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{job.description}</p>
                      )}

                      {job.required_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.required_skills.slice(0, 5).map((skill, j) => (
                            <span key={j} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-xs text-slate-600">{skill}</span>
                          ))}
                          {job.required_skills.length > 5 && (
                            <span className="text-xs text-slate-400">+{job.required_skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      {hasApplied ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Applied
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                            setShowApplyDialog(true);
                          }}
                          disabled={!myTechnician}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Apply
                        </Button>
                      )}
                      {job.application_deadline && (
                        <span className="text-xs text-slate-400">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!myTechnician && user && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-sm text-amber-800">
              <Wrench className="w-4 h-4 inline mr-1" />
              Complete your <a href="/ContractorRegister" className="font-medium underline">contractor registration</a> to apply for jobs.
            </p>
          </div>
        )}
      </div>
      </PullToRefresh>

      {selectedJob && (
        <JobApplicationDialog
          open={showApplyDialog}
          onOpenChange={setShowApplyDialog}
          job={selectedJob}
          technician={myTechnician}
        />
      )}
    </div>
  );
}