import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus, Search, Building2, Cpu, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LocationForm from '@/components/locations/LocationForm';
import PullToRefresh from '@/components/mobile/PullToRefresh';

const TYPE_ICONS = {
  building: Building2,
  facility: Building2,
  park: MapPin,
  road: MapPin,
  bridge: MapPin,
  depot: Building2,
  station: Building2,
  other: MapPin,
};

export default function Locations() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-created_date', 100),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Location.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  const filtered = locations.filter(loc =>
    !search ||
    loc.name?.toLowerCase().includes(search.toLowerCase()) ||
    loc.code?.toLowerCase().includes(search.toLowerCase()) ||
    loc.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    loc.city?.toLowerCase().includes(search.toLowerCase())
  );

  // Count assets per location
  const getAssetCount = (locationName) =>
    equipment.filter(e => e.location === locationName).length;

  const getLocationHealth = (locationName) => {
    const assets = equipment.filter(e => e.location === locationName);
    if (!assets.length) return null;
    return Math.round(assets.reduce((s, e) => s + (e.health_score || 0), 0) / assets.length);
  };

  const getCriticalCount = (locationName) =>
    equipment.filter(e => e.location === locationName && (e.status === 'critical' || e.risk_level === 'critical')).length;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <PullToRefresh onRefresh={async () => { await queryClient.invalidateQueries(['locations']); await queryClient.invalidateQueries(['equipment']); }}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Locations</h1>
            <p className="text-sm text-slate-500">{locations.length} sites managed</p>
          </div>
          <Button onClick={() => { setEditing(null); setIsFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 h-11">
            <Plus className="w-4 h-4 mr-2" /> Add Location
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 bg-white" />
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((loc, idx) => {
            const Icon = TYPE_ICONS[loc.location_type] || MapPin;
            const assetCount = getAssetCount(loc.name);
            const health = getLocationHealth(loc.name);
            const criticals = getCriticalCount(loc.name);

            return (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Link
                  to={`/LocationDetail?id=${loc.id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(loc); setIsFormOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMutation.mutate(loc.id); }}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1">{loc.name}</h3>
                  {loc.code && <p className="text-xs text-slate-400 mb-1">{loc.code}</p>}
                  {loc.address && <p className="text-xs text-slate-500 mb-2">{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>}
                  {loc.client_name && (
                    <Badge variant="secondary" className="mb-3 text-xs">{loc.client_name}</Badge>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{assetCount}</span>
                        <span className="text-xs text-slate-400">assets</span>
                      </div>
                      {health !== null && (
                        <div className="text-xs">
                          <span className={`font-medium ${health >= 70 ? 'text-emerald-600' : health >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {health}%
                          </span>
                          <span className="text-slate-400 ml-1">health</span>
                        </div>
                      )}
                      {criticals > 0 && (
                        <Badge className="bg-rose-50 text-rose-600 border-rose-200 text-xs">{criticals} critical</Badge>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No locations found</h3>
            <p className="text-sm text-slate-400">Add locations to organize your assets by site</p>
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
    </div>
  );
}