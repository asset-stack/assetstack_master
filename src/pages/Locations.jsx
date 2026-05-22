import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useClient } from '@/lib/ClientContext';
import { MapPin, Plus, Search, Cpu, CheckCircle2, AlertTriangle, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LocationForm from '@/components/locations/LocationForm';
import LocationHubCard from '@/components/locations/LocationHubCard';
import AssetImportDialog from '@/components/locations/AssetImportDialog';
import PullToRefresh from '@/components/mobile/PullToRefresh';

const UNFIXED_STATUSES = new Set(['pending', 'approved']);

export default function Locations() {
  const { currentClient } = useClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importingTo, setImportingTo] = useState(null);
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', currentClient?.id],
    queryFn: async () => {
      if (!currentClient) return [];
      const all = await base44.entities.Location.list('-created_date', 100);
      return currentClient.business_name === 'Bunbury Council' ? all.filter(e => e.client_account_id === currentClient.id || !e.client_account_id) : all.filter(e => e.client_account_id === currentClient.id);
    }
  });
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment', currentClient?.id],
    queryFn: async () => {
      if (!currentClient) return [];
      const all = await base44.entities.Equipment.list('-created_date', 500);
      return currentClient.business_name === 'Bunbury Council' ? all.filter(e => e.client_account_id === currentClient.id || !e.client_account_id) : all.filter(e => e.client_account_id === currentClient.id);
    }
  });
  const { data: scans = [] } = useQuery({
    queryKey: ['scans-all', currentClient?.id],
    queryFn: async () => {
      if (!currentClient) return [];
      const all = await base44.entities.DigitalTwinModel.list('-scan_date', 200);
      return currentClient.business_name === 'Bunbury Council' ? all.filter(e => e.client_account_id === currentClient.id || !e.client_account_id) : all.filter(e => e.client_account_id === currentClient.id);
    }
  });
  const { data: conditionReports = [] } = useQuery({
    queryKey: ['cr-all', currentClient?.id],
    queryFn: async () => {
      if (!currentClient) return [];
      const all = await base44.entities.ConditionReport.list('-created_date', 500);
      return currentClient.business_name === 'Bunbury Council' ? all.filter(e => e.client_account_id === currentClient.id || !e.client_account_id) : all.filter(e => e.client_account_id === currentClient.id);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Location.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  // Build a map of scanId -> locationName (for routing condition reports back to a location)
  const scanToLocation = useMemo(() => {
    const m = new Map();
    scans.forEach(s => { if (s.location_name) m.set(s.id, s.location_name); });
    return m;
  }, [scans]);

  const statsFor = (locName, locId) => {
    const assets = equipment.filter(e => e.location === locName);
    const locScans = scans.filter(s => s.location_id === locId);
    // Reports tied to this location's scans
    const locReports = conditionReports.filter(r => scanToLocation.get(r.digital_twin_model_id) === locName);

    // Assets with at least one open (unfixed) report
    const unfixedAssetIds = new Set(locReports.filter(r => UNFIXED_STATUSES.has(r.review_status)).map(r => r.equipment_id).filter(Boolean));
    const unfixedAssets = unfixedAssetIds.size;
    const fixedAssets = Math.max(0, assets.length - unfixedAssets);

    const avgHealth = assets.length ? Math.round(assets.reduce((s, e) => s + (e.health_score || 0), 0) / assets.length) : null;
    const criticalCount = assets.filter(e => e.status === 'critical' || e.risk_level === 'critical').length;
    const openAnomalies = locReports.filter(r => UNFIXED_STATUSES.has(r.review_status)).length;

    return {
      totalAssets: assets.length,
      fixedAssets,
      unfixedAssets,
      scanCount: locScans.length,
      openAnomalies,
      avgHealth,
      criticalCount,
    };
  };

  const filtered = locations.filter(loc =>
    !search ||
    loc.name?.toLowerCase().includes(search.toLowerCase()) ||
    loc.code?.toLowerCase().includes(search.toLowerCase()) ||
    loc.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    loc.city?.toLowerCase().includes(search.toLowerCase())
  );

  // Portfolio rollup
  const rollup = useMemo(() => {
    const total = equipment.length;
    const unfixedIds = new Set(
      conditionReports.filter(r => UNFIXED_STATUSES.has(r.review_status)).map(r => r.equipment_id).filter(Boolean)
    );
    return {
      sites: locations.length,
      assets: total,
      fixed: Math.max(0, total - unfixedIds.size),
      unfixed: unfixedIds.size,
      scans: scans.length,
      openAnomalies: conditionReports.filter(r => UNFIXED_STATUSES.has(r.review_status)).length,
    };
  }, [locations, equipment, scans, conditionReports]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <PullToRefresh onRefresh={async () => {
        await Promise.all([
          queryClient.invalidateQueries(['locations']),
          queryClient.invalidateQueries(['equipment']),
          queryClient.invalidateQueries(['scans-all']),
          queryClient.invalidateQueries(['cr-all']),
        ]);
      }}>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Locations</h1>
              <p className="text-sm text-slate-500">Everything downstream from each site — assets, scans, condition, budget, capital.</p>
            </div>
            <Button onClick={() => { setEditing(null); setIsFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 h-11">
              <Plus className="w-4 h-4 mr-2" /> Add Location
            </Button>
          </div>

          {/* Portfolio rollup */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <RollupCard icon={MapPin} label="Sites" value={rollup.sites} tone="indigo" />
            <RollupCard icon={Cpu} label="Assets" value={rollup.assets} tone="slate" />
            <RollupCard icon={CheckCircle2} label="Fixed" value={rollup.fixed} tone="emerald" />
            <RollupCard icon={AlertTriangle} label="Unfixed" value={rollup.unfixed} tone="rose" />
            <RollupCard icon={Box} label="Scans" value={rollup.scans} tone="purple" />
            <RollupCard icon={AlertTriangle} label="Open anomalies" value={rollup.openAnomalies} tone="amber" />
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 bg-white" />
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loc, idx) => (
              <LocationHubCard
                key={loc.id}
                location={loc}
                index={idx}
                stats={statsFor(loc.name, loc.id)}
                onEdit={(l) => { setEditing(l); setIsFormOpen(true); }}
                onDelete={(l) => deleteMutation.mutate(l.id)}
                onImportAssets={(l) => setImportingTo(l)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">No locations found</h3>
              <p className="text-sm text-slate-400">Add locations to organise your assets by site</p>
            </div>
          )}
        </div>
      </PullToRefresh>

      <LocationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        location={editing}
        onSaved={() => { setIsFormOpen(false); setEditing(null); queryClient.invalidateQueries({ queryKey: ['locations'] }); }}
      />

      <AssetImportDialog
        open={!!importingTo}
        onOpenChange={(v) => { if (!v) setImportingTo(null); }}
        location={importingTo}
        onImported={() => {
          queryClient.invalidateQueries({ queryKey: ['locations'] });
          queryClient.invalidateQueries({ queryKey: ['equipment'] });
        }}
      />
    </div>
  );
}

function RollupCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <div className={`p-1.5 rounded-lg ${tones[tone]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">{value}</div>
    </div>
  );
}