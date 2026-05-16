import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, Wallet, Sparkles } from 'lucide-react';
import {
  STATUS_META,
  HEALTH_META,
  PRIORITY_META,
  TYPE_META,
  formatCurrency,
  budgetVariancePct
} from '@/lib/projectUtils';

export default function ProjectCard({ project }) {
  const status = STATUS_META[project.status] || STATUS_META.planning;
  const health = HEALTH_META[project.health] || HEALTH_META.on_track;
  const priority = PRIORITY_META[project.priority] || PRIORITY_META.medium;
  const type = TYPE_META[project.project_type] || TYPE_META.other;
  const variance = budgetVariancePct(project);
  const variancePositive = variance > 0;

  return (
    <Link to={`/ProjectDetail?id=${project.id}`}>
      <Card className="p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${health.color}`} title={health.label} />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {project.code || type.label}
              </span>
              {project.ai_generated && (
                <Sparkles className="w-3 h-3 text-indigo-500" />
              )}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm truncate">{project.name}</h3>
          </div>
          <Badge className={`${priority.color} border-0 text-[10px] font-semibold shrink-0`}>
            {priority.label}
          </Badge>
        </div>

        {project.location_names?.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {project.location_names.slice(0, 2).join(', ')}
              {project.location_names.length > 2 && ` +${project.location_names.length - 2}`}
            </span>
          </div>
        )}

        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {project.progress_percent || 0}%
            </span>
          </div>
          <Progress value={project.progress_percent || 0} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
              <Wallet className="w-3 h-3" />
              <span>Budget</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 tabular-nums">
              {formatCurrency(project.budget, project.currency)}
            </div>
            {project.budget > 0 && (
              <div
                className={`text-[10px] font-medium tabular-nums ${
                  variancePositive ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {variancePositive ? '+' : ''}
                {variance.toFixed(1)}% vs fcst
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
              <Calendar className="w-3 h-3" />
              <span>Target</span>
            </div>
            <div className="text-xs font-semibold text-slate-900">
              {project.target_end_date
                ? new Date(project.target_end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })
                : '—'}
            </div>
            <div className={`text-[10px] font-medium ${status.color.replace('bg-', 'text-').replace('-100', '-600')}`}>
              {status.label}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}