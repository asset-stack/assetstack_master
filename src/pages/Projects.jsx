import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Briefcase, Plus, Sparkles, Search, Filter } from 'lucide-react';
import ProjectStats from '@/components/projects/ProjectStats';
import ProjectCard from '@/components/projects/ProjectCard';
import AIComposerDialog from '@/components/projects/AIComposerDialog';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog';
import { STATUS_LANES } from '@/lib/projectUtils';

export default function Projects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [aiOpen, setAiOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-updated_date', 200)
  });

  const filtered = projects.filter((p) => {
    if (typeFilter !== 'all' && p.project_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lanes = STATUS_LANES.map((lane) => ({
    ...lane,
    items: filtered.filter((p) => lane.statuses.includes(p.status))
  }));

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['projects'] });

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          </div>
          <p className="text-sm text-slate-500">
            Asset-native delivery — every project linked to assets, finance, and outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAiOpen(true)}
            variant="outline"
            className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <Sparkles className="w-4 h-4" /> AI Composer
          </Button>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      <ProjectStats projects={projects} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="renewal">Renewal</SelectItem>
            <SelectItem value="upgrade">Upgrade</SelectItem>
            <SelectItem value="new_build">New Build</SelectItem>
            <SelectItem value="compliance_program">Compliance</SelectItem>
            <SelectItem value="grant_funded">Grant-Funded</SelectItem>
            <SelectItem value="maintenance_program">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lanes */}
      {isLoading ? (
        <div className="text-center text-slate-500 py-12">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            No projects yet
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Start with the AI Composer or create one manually.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => setAiOpen(true)} variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" /> AI Composer
            </Button>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {lanes.map((lane) => (
            <div key={lane.key} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${lane.color}-500`} />
                  <h2 className="text-sm font-bold text-slate-900">{lane.label}</h2>
                  <span className="text-xs text-slate-500 tabular-nums">
                    ({lane.items.length})
                  </span>
                </div>
              </div>
              <div className="space-y-3 min-h-[120px]">
                {lane.items.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8 border border-dashed border-slate-200 rounded-lg">
                    No projects
                  </div>
                ) : (
                  lane.items.map((p) => <ProjectCard key={p.id} project={p} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AIComposerDialog open={aiOpen} onOpenChange={setAiOpen} onCreated={refresh} />
      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={refresh} />
    </div>
  );
}