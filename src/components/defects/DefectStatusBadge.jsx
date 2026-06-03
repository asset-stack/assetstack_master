import React from 'react';
import { Badge } from '@/components/ui/badge';

const priorityCls = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

export function PriorityBadge({ priority }) {
  const key = (priority || '').toLowerCase();
  return (
    <Badge className={`${priorityCls[key] || 'bg-slate-100 text-slate-700 border-slate-200'} text-[11px] capitalize`}>
      {priority || '—'}
    </Badge>
  );
}

const verifyCls = {
  verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function VerifyBadge({ status }) {
  const key = status || 'pending';
  return (
    <Badge className={`${verifyCls[key]} text-[11px] capitalize`}>
      {key}
    </Badge>
  );
}