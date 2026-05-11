import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LocationDetailTabs from '@/components/locations/LocationDetailTabs';

export default function LocationDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const locationId = params.get('id');

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => base44.entities.Location.get(locationId),
    enabled: !!locationId,
  });

  if (isLoading) {
    return <div className="p-8 text-sm text-slate-500">Loading location…</div>;
  }
  if (!location) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">Location not found.</p>
        <Link to="/Locations" className="text-sm text-indigo-600 mt-2 inline-block">← Back to locations</Link>
      </div>
    );
  }

  const Icon = location.location_type === 'facility' ? Building2 : MapPin;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/Locations')} className="mb-4 -ml-2 text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Locations
        </Button>

        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-slate-900">{location.name}</h1>
              {location.code && <Badge variant="secondary" className="text-xs">{location.code}</Badge>}
              {location.status && <Badge variant="outline" className="text-xs">{location.status}</Badge>}
            </div>
            {location.address && (
              <p className="text-sm text-slate-500 mt-1">
                {location.address}{location.city ? `, ${location.city}` : ''}{location.region ? `, ${location.region}` : ''}
              </p>
            )}
            {location.client_name && <p className="text-xs text-slate-400 mt-1">Client: {location.client_name}</p>}
            {location.notes && <p className="text-sm text-slate-600 mt-2 max-w-3xl">{location.notes}</p>}
          </div>
          <div className="text-right text-xs text-slate-500">
            {location.total_assets > 0 && <div><span className="text-lg font-semibold text-slate-900">{location.total_assets}</span> assets</div>}
            {location.scan_date && <div className="mt-1">Last scan: {location.scan_date}</div>}
          </div>
        </div>

        <LocationDetailTabs location={location} />
      </div>
    </div>
  );
}