import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { secureEntity } from '@/lib/secureEntities';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationHero from '@/components/locations/LocationHero';
import LocationDetailTabs from '@/components/locations/LocationDetailTabs';

export default function LocationDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const locationId = params.get('id');

  const { data: location, isLoading } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => secureEntity('Location').get(locationId),
    enabled: !!locationId,
  });

  const { data: assetCount = 0 } = useQuery({
    queryKey: ['location-asset-count', location?.name],
    queryFn: async () => {
      const list = await secureEntity('Equipment').filter({ location: location.name }, '-created_date', 200);
      return list.length;
    },
    enabled: !!location?.name,
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

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/Locations')} className="mb-4 -ml-2 text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Locations
        </Button>

        <LocationHero location={location} assetCount={assetCount} />

        {location.notes && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <p className="text-sm text-slate-600">{location.notes}</p>
          </div>
        )}

        <LocationDetailTabs location={location} />
      </div>
    </div>
  );
}