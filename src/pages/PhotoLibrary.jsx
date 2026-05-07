import React from 'react';
import { Card } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { PHOTO_LIBRARY } from '@/lib/photoLibrary';

export default function PhotoLibrary() {
  const items = Object.entries(PHOTO_LIBRARY).filter(([k]) => !k.startsWith('__'));

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-7 h-7 text-pink-600" /> Asset Photo Library
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Stock reference images for each component type. Inspectors compare these against on-site reality.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(([type, url]) => (
          <Card key={type} className="overflow-hidden">
            <div className="aspect-square bg-slate-100">
              <img src={url} alt={type} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <div className="font-semibold text-slate-900 text-sm">{type}</div>
              <div className="text-xs text-slate-400">Reference photo</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}