import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Sparkles,
  RefreshCw,
  Calendar,
  MapPin,
  User,
  Wallet,
  Trash2,
  Loader2
} from 'lucide-react';
import ProjectBudget from '@/components/projects/ProjectBudget';
import ProjectGantt from '@/components/projects/ProjectGantt';
import ProjectAssets from '@/components/projects/ProjectAssets';
import ProjectRisks from '@/components/projects/ProjectRisks';
import ProjectWorkOrders from '@/components/projects/ProjectWorkOrders';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog';
import ProjectEVMPanel from '@/components/projects/ProjectEVMPanel';
import ProjectSCurve from '@/components/projects/ProjectSCurve';
import ProjectCriticalPath from '@/components/projects/ProjectCriticalPath';
import {
  STATUS_META,
  HEALTH_META,
  PRIORITY_META,
  TYPE_META,
  formatCurrency
} from '@/lib/projectUtils';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const [editOpen, setEditOpen] = useState(false);
  const [rolling, setRolling] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.get(projectId),
    enabled: !!projectId
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const handleRollup = async () => {
    setRolling(true);
    try {
      await base44.functions.invoke('rollupProjectCosts', { project_id: projectId });
      refresh();
    } catch (e) {
      console.error(e);
    }
    setRolling(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await base44.entities.Project.delete(projectId);
    navigate('/Projects');
  };

  const status = useMemo(() => STATUS_META[project?.status] || STATUS_META.planning, [project]);
  const health = useMemo(() => HEALTH_META[project?.health] || HEALTH_META.on_track, [project]);
  const priority = useMemo(
    () => PRIORITY_META[project?.priority] || PRIORITY_META.medium,
    [project]
  );
  const type = useMemo(() => TYPE_META[project?.project_type] || TYPE_META.other, [project]);

  if (!projectId) {
    return (
      <div className="p-6 text-center text-slate-500">
        No project ID provided.{' '}
        <Link to="/Projects" className="text-indigo-600 underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (isLoading || !project) {
    return <div className="p-6 text-center text-slate-500">Loading project…</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div>
        <Link
          to="/Projects"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Projects
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${health.color}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {project.code} · {type.label}
              </span>
              {project.ai_generated && <Sparkles className="w-3 h-3 text-indigo-500" />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${status.color} border-0`}>{status.label}</Badge>
              <Badge className={`${priority.color} border-0`}>{priority.label}</Badge>
              <Badge variant="outline" className={`${health.text} border-current`}>
                {health.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRollup}
              disabled={rolling}
              className="gap-1.5"
            >
              {rolling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Roll-up Costs
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 mt-3 max-w-3xl">{project.description}</p>
        )}
      </div>

      {/* Meta strip */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase mb-1">
              <Calendar className="w-3 h-3" /> Timeline
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {project.start_date
                ? new Date(project.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : '—'}{' '}
              →{' '}
              {project.target_end_date
                ? new Date(project.target_end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : '—'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase mb-1">
              <Wallet className="w-3 h-3" /> Budget
            </div>
            <div className="text-sm font-semibold text-slate-900 tabular-nums">
              {formatCurrency(project.budget, project.currency)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase mb-1">
              <User className="w-3 h-3" /> Project Manager
            </div>
            <div className="text-sm font-semibold text-slate-900 truncate">
              {project.project_manager || '—'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase mb-1">
              <MapPin className="w-3 h-3" /> Locations
            </div>
            <div className="text-sm font-semibold text-slate-900 truncate">
              {project.location_names?.length
                ? `${project.location_names.length} site${
                    project.location_names.length > 1 ? 's' : ''
                  }`
                : '—'}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evm">EVM Analysis</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="assets">
            Assets ({project.equipment_ids?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="risks">Risks ({project.risks?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectBudget project={project} />
          <ProjectSCurve project={project} />
          <ProjectGantt
            phases={project.phases || []}
            projectStart={project.start_date}
            projectEnd={project.target_end_date}
          />
        </TabsContent>

        <TabsContent value="evm" className="space-y-4">
          <ProjectEVMPanel project={project} />
          <ProjectSCurve project={project} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ProjectCriticalPath phases={project.phases || []} />
          <ProjectGantt
            phases={project.phases || []}
            projectStart={project.start_date}
            projectEnd={project.target_end_date}
          />
        </TabsContent>

        <TabsContent value="assets">
          <ProjectAssets equipmentIds={project.equipment_ids || []} />
        </TabsContent>

        <TabsContent value="workorders">
          <ProjectWorkOrders equipmentIds={project.equipment_ids || []} />
        </TabsContent>

        <TabsContent value="risks">
          <ProjectRisks risks={project.risks || []} />
        </TabsContent>
      </Tabs>

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        onSaved={refresh}
      />
    </div>
  );
}