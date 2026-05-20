import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Search, Upload, MapPin, Calendar, Loader2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { PHOTO_LIBRARY } from '@/lib/photoLibrary';
import BulkPhotoUpload from '@/components/scan-analysis/BulkPhotoUpload.jsx';

const PHOTO_TYPES = ['all', 'inspection', 'defect', 'baseline', 'post_repair', 'reference'];
const TYPE_COLORS = {
  inspection: 'bg-blue-100 text-blue-700',
  defect: 'bg-rose-100 text-rose-700',
  baseline: 'bg-slate-100 text-slate-700',
  post_repair: 'bg-emerald-100 text-emerald-700',
  reference: 'bg-amber-100 text-amber-700',
};

export default function PhotoLibrary() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('inspection'); // 'inspection' | 'reference'
  const [search, setSearch] = useState('');
  const [photoType, setPhotoType] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const [bulkOpen, setBulkOpen] = useState(false);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['assetPhotos'],
    queryFn: () => base44.entities.AssetPhoto.list('-created_date', 500),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 500),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('-created_date', 200),
  });

  const filtered = useMemo(() => {
    let r = photos;
    if (photoType !== 'all') r = r.filter((p) => p.photo_type === photoType);
    if (assetFilter !== 'all') r = r.filter((p) => p.equipment_id === assetFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((p) =>
        p.equipment_name?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q)
      );
    }
    return r;
  }, [photos, photoType, assetFilter, search]);

  const referenceItems = Object.entries(PHOTO_LIBRARY).filter(([k]) => !k.startsWith('__'));

  const stats = useMemo(() => ({
    total: photos.length,
    inspection: photos.filter((p) => p.photo_type === 'inspection').length,
    defect: photos.filter((p) => p.photo_type === 'defect').length,
    withGPS: photos.filter((p) => p.lat && p.lng).length,
  }), [photos]);

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-7 h-7 text-pink-600" /> Photo Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            All inspection photos with EXIF tagging, AI-ready, filterable by asset and type.
          </p>
        </div>
        <Button
          onClick={() => setBulkOpen(true)}
          className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
        >
          <Upload className="w-4 h-4 mr-2" /> Bulk Upload Photos
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-3">
          <p className="text-xs text-slate-500 uppercase">Total Photos</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500 uppercase">Inspections</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inspection}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500 uppercase">Defects</p>
          <p className="text-2xl font-bold text-rose-600">{stats.defect}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500 uppercase">GPS-Tagged</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.withGPS}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200">
        <button
          onClick={() => setTab('inspection')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'inspection' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500'
          }`}
        >
          Inspection Photos ({photos.length})
        </button>
        <button
          onClick={() => setTab('reference')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'reference' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500'
          }`}
        >
          Reference Stock ({referenceItems.length})
        </button>
      </div>

      {tab === 'inspection' && (
        <>
          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by asset or notes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={photoType} onValueChange={setPhotoType}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHOTO_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t === 'all' ? 'All types' : t.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="w-56"><SelectValue placeholder="All assets" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">All assets</SelectItem>
                {equipment.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo grid */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-500 py-10 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading photos…
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">
                {photos.length === 0 ? 'No inspection photos yet' : 'No photos match your filters'}
              </p>
              <p className="text-sm text-slate-400 mb-4">
                {photos.length === 0 ? 'Upload a batch to get started.' : 'Try clearing filters.'}
              </p>
              {photos.length === 0 && (
                <Button onClick={() => setBulkOpen(true)} className="bg-pink-600 hover:bg-pink-700">
                  <Upload className="w-4 h-4 mr-2" /> Bulk Upload
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="aspect-square bg-slate-100 relative">
                    <img
                      src={p.photo_url}
                      alt={p.equipment_name || 'photo'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {p.photo_type && (
                      <Badge className={`absolute top-2 left-2 ${TYPE_COLORS[p.photo_type] || 'bg-slate-200'} border-0 text-[10px] capitalize`}>
                        {p.photo_type.replace('_', ' ')}
                      </Badge>
                    )}
                    {p.condition_grade_at_capture != null && (
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0 text-[10px]">
                        C{p.condition_grade_at_capture}
                      </Badge>
                    )}
                    {p.lat && p.lng && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {p.lat.toFixed(2)}, {p.lng.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {p.equipment_name || 'Unassigned'}
                    </div>
                    {p.captured_date && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {format(new Date(p.captured_date), 'PP')}
                      </div>
                    )}
                    {p.notes && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.notes}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'reference' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {referenceItems.map(([type, url]) => (
            <Card key={type} className="overflow-hidden">
              <div className="aspect-square bg-slate-100">
                <img src={url} alt={type} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <div className="font-semibold text-slate-900 text-sm">{type}</div>
                <div className="text-xs text-slate-400">Stock reference photo</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BulkPhotoUpload
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        equipment={equipment}
        locations={locations}
        onCompleted={() => {
          qc.invalidateQueries({ queryKey: ['assetPhotos'] });
          qc.invalidateQueries({ queryKey: ['digitalTwinScans'] });
        }}
      />
    </div>
  );
}