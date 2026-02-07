import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-2 bg-slate-100 rounded-full w-1/3 mb-2" />
              <div className="h-3.5 bg-slate-100 rounded-lg w-2/3" />
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-slate-100 rounded-full w-full" />
            <div className="h-2 bg-slate-100 rounded-full w-3/4" />
            <div className="h-2 bg-slate-100 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg" />
            <div className="flex-1">
              <div className="h-2 bg-slate-100 rounded-full w-2/3 mb-2" />
              <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-3 bg-slate-100 rounded-full w-1/2 mb-2" />
              <div className="h-2 bg-slate-100 rounded-full w-3/4" />
            </div>
            <div className="w-16 h-6 bg-slate-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}