import React, { useState } from 'react';
import { secureEntity } from '@/lib/secureEntities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Loader2 } from 'lucide-react';
import TaskStatsBar from './TaskStatsBar';
import TaskBoard from './TaskBoard';
import TaskDialog from './TaskDialog';
import LogTimeDialog from './LogTimeDialog';
import TeamWorkloadPanel from './TeamWorkloadPanel';

export default function ProjectTasksTab({ project }) {
  const queryClient = useQueryClient();
  const [taskDialog, setTaskDialog] = useState({ open: false, task: null });
  const [timeOpen, setTimeOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['project-tasks', project.id],
    queryFn: () => secureEntity('ProjectTask').filter({ project_id: project.id }, '-created_date', 300)
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians-all'],
    queryFn: () => secureEntity('Technician').list('name', 200)
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['project-tasks', project.id] });

  return (
    <div className="space-y-4">
      <TaskStatsBar tasks={tasks} />

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => setTimeOpen(true)} className="gap-1.5">
          <Clock className="w-4 h-4" /> Log Time
        </Button>
        <Button onClick={() => setTaskDialog({ open: true, task: null })} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <TaskBoard
              tasks={tasks}
              onEdit={(task) => setTaskDialog({ open: true, task })}
              onAdd={() => setTaskDialog({ open: true, task: null })}
              onChanged={refresh}
            />
          )}
        </div>
        <div className="xl:col-span-1">
          <TeamWorkloadPanel tasks={tasks} technicians={technicians} />
        </div>
      </div>

      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(o) => setTaskDialog((s) => ({ ...s, open: o }))}
        task={taskDialog.task}
        project={project}
        technicians={technicians}
        siblingTasks={tasks.filter((t) => t.id !== taskDialog.task?.id)}
        onSaved={refresh}
      />

      <LogTimeDialog
        open={timeOpen}
        onOpenChange={setTimeOpen}
        project={project}
        tasks={tasks}
        technicians={technicians}
        onSaved={refresh}
      />
    </div>
  );
}