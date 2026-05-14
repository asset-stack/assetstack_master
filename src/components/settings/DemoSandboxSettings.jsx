import React, { useState } from 'react';
import { FlaskConical, Mountain, Building2, Pickaxe, TrainFront, Database, Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

const DEMOS = [
  {
    id: 'snowy_hydro',
    name: 'Snowy Hydro',
    tagline: 'Energy & utilities',
    description: 'Hydro generation, dams, Snowy 2.0 construction, peakers. AS-class compliance, EIS conditions, $9.3M verified savings.',
    icon: Mountain,
    iconBg: 'bg-sky-100 text-sky-600',
    stats: [
      { label: 'Locations', value: '6' },
      { label: 'Assets', value: '6' },
      { label: 'Capital', value: '$6.7M' },
    ],
  },
  {
    id: 'bunbury_council',
    name: 'City of Bunbury',
    tagline: 'Local government',
    description: 'Town Hall, Sports Centre, Museum, seawall. AS 1735, AS 1851, WA OSH compliance. Real Council asset register.',
    icon: Building2,
    iconBg: 'bg-emerald-100 text-emerald-600',
    stats: [
      { label: 'Locations', value: '5' },
      { label: 'Assets', value: '6' },
      { label: 'Compliance', value: '4' },
    ],
  },
  {
    id: 'mining',
    name: 'Iron Ore Mining Co',
    tagline: 'Mining & resources',
    description: 'Haul trucks, primary crusher, conveyors, train loadout. WA Mines Safety, ANCOLD tailings audits, $11.9M budgets.',
    icon: Pickaxe,
    iconBg: 'bg-amber-100 text-amber-600',
    stats: [
      { label: 'Locations', value: '4' },
      { label: 'Assets', value: '5' },
      { label: 'Budget', value: '$11.9M' },
    ],
  },
  {
    id: 'rail',
    name: 'Regional Rail Authority',
    tagline: 'Transport infrastructure',
    description: 'Track, switches, signals, Hawkesbury bridge, tunnel lining. ONRSR compliance, AS 5100 bridge assessments.',
    icon: TrainFront,
    iconBg: 'bg-violet-100 text-violet-600',
    stats: [
      { label: 'Locations', value: '4' },
      { label: 'Assets', value: '5' },
      { label: 'Capital', value: '$3.0M' },
    ],
  },
];

export default function DemoSandboxSettings() {
  const [pendingDemo, setPendingDemo] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const handleLoad = async () => {
    if (!pendingDemo) return;
    setLoadingId(pendingDemo.id);
    setPendingDemo(null);
    setLastResult(null);
    try {
      const res = await base44.functions.invoke('loadDemoProfile', {
        profile_id: pendingDemo.id,
        confirm: true,
      });
      const data = res?.data || {};
      if (data.success) {
        setLastResult({ ok: true, profile: data.profile_name, wiped: data.wiped, seeded: data.seeded });
        toast({ title: `Loaded: ${data.profile_name}`, description: 'Test database has been reseeded.' });
      } else {
        setLastResult({ ok: false, error: data.error || 'Unknown error' });
        toast({ title: 'Load failed', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Request failed';
      setLastResult({ ok: false, error: msg });
      toast({ title: 'Load failed', description: msg, variant: 'destructive' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-indigo-500" />
          Demo Profiles
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Load any industry demo into the Test database. Only one profile is active at a time — loading a new one wipes the previous demo.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex gap-3">
        <Database className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-slate-900">How demo profiles work</p>
          <ul className="text-slate-600 mt-1 text-xs leading-relaxed list-disc ml-4 space-y-0.5">
            <li>Loading wipes the <strong>Test</strong> database only — Production is never touched.</li>
            <li>Switch to Test mode (top of builder dashboard) before loading, then reload the preview.</li>
            <li>Loading takes ~10–30s depending on dataset size.</li>
          </ul>
        </div>
      </div>

      {/* Last result */}
      {lastResult && (
        <div className={`rounded-xl p-4 flex gap-3 border ${lastResult.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          {lastResult.ok ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-sm flex-1 min-w-0">
            {lastResult.ok ? (
              <>
                <p className="font-medium text-slate-900">Loaded: {lastResult.profile}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Seeded: {Object.entries(lastResult.seeded || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-slate-900">Load failed</p>
                <p className="text-xs text-slate-600 mt-1">{lastResult.error}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Demo cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMOS.map((demo) => {
          const Icon = demo.icon;
          const isLoading = loadingId === demo.id;
          const anyLoading = loadingId !== null;
          return (
            <div key={demo.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${demo.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-base">{demo.name}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{demo.tagline}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">{demo.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-slate-100">
                {demo.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-base font-bold text-slate-900 tabular-nums">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Button
                size="sm"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => setPendingDemo(demo)}
                disabled={anyLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Loading…</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Load this demo</>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!pendingDemo} onOpenChange={(open) => !open && setPendingDemo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Load {pendingDemo?.name}?
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-2">
              <span className="block">
                This will <strong>wipe all data in the Test database</strong> and replace it with the {pendingDemo?.name} demo profile.
              </span>
              <span className="block text-xs bg-amber-50 border border-amber-200 rounded p-2 text-amber-900">
                Production data is never affected. This function only runs against the Test database.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDemo(null)}>Cancel</Button>
            <Button className="bg-slate-900 hover:bg-slate-800" onClick={handleLoad}>
              Wipe Test DB & Load
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}