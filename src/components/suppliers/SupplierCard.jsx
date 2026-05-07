import React from 'react';
import { Star, Mail, Phone, Globe, Edit, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_COLOR = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  blacklisted: 'bg-rose-100 text-rose-700',
  pending_review: 'bg-amber-100 text-amber-700',
};

export default function SupplierCard({ supplier, onEdit }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-slate-900 truncate">{supplier.name}</h3>
            {supplier.preferred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${STATUS_COLOR[supplier.status] || STATUS_COLOR.active}`}>
              {supplier.status?.replace('_', ' ') || 'active'}
            </span>
            <span className="text-[10px] text-slate-500 capitalize">{supplier.category}</span>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={() => onEdit?.(supplier)} className="h-7 w-7 shrink-0">
          <Edit className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-1 text-[11px] text-slate-600 mb-3">
        {supplier.contact_email && (
          <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {supplier.contact_email}</div>
        )}
        {supplier.contact_phone && (
          <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {supplier.contact_phone}</div>
        )}
        {supplier.website && (
          <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-slate-400" /> <a href={supplier.website} target="_blank" rel="noreferrer" className="hover:underline truncate">{supplier.website}</a></div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Rating</div>
          <div className="text-[13px] font-semibold tabular-nums text-slate-900 flex items-center gap-0.5">
            {(supplier.rating || 0).toFixed(1)}
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">On-time</div>
          <div className="text-[13px] font-semibold tabular-nums text-slate-900">{supplier.on_time_delivery_rate || 0}%</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">YTD spend</div>
          <div className="text-[13px] font-semibold tabular-nums text-slate-900">${((supplier.total_spend_ytd || 0) / 1000).toFixed(1)}k</div>
        </div>
      </div>
    </div>
  );
}