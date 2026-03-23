import React from 'react';
import { WifiOff, Database } from 'lucide-react';

export default function OfflineBanner({ cachedAt }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs">
      <WifiOff className="h-3.5 w-3.5" />
      <span className="font-medium">Offline Mode</span>
      <span className="text-amber-600">— Using cached data. Messages will sync when back online.</span>
      {cachedAt && (
        <span className="ml-auto flex items-center gap-1 text-amber-500">
          <Database className="h-3 w-3" />
          Cached {new Date(cachedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}