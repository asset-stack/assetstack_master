import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Rocket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import DemoCard from '@/components/demo-library/DemoCard';
import CreateDemoDialog from '@/components/demo-library/CreateDemoDialog';

export default function DemoLibrary() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: demos = [], isLoading, refetch } = useQuery({
    queryKey: ['demoLibrary'],
    queryFn: () => base44.entities.ClientAccount.filter({ is_demo_account: true }, '-created_date', 100),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Demo Library</h1>
            <p className="text-sm text-slate-500">Isolated, read-only demo environments you can share with prospects.</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> New demo
        </Button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-sm py-20 text-center">Loading demos…</div>
      ) : demos.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
          <Rocket className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No demos yet</p>
          <p className="text-sm text-slate-400 mb-4">Create your first isolated demo environment.</p>
          <Button onClick={() => setShowCreate(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> New demo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {demos.map((demo) => (
            <DemoCard key={demo.id} demo={demo} onDeleted={refetch} />
          ))}
        </div>
      )}

      <CreateDemoDialog open={showCreate} onOpenChange={setShowCreate} onCreated={refetch} />
    </div>
  );
}