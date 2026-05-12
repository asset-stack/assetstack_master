import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, User, Calendar, ExternalLink } from 'lucide-react';

export default function LocationHero({ location, assetCount }) {
  const heroImage = location.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
  const mapsUrl = (location.gps_lat && location.gps_lng)
    ? `https://www.google.com/maps/search/?api=1&query=${location.gps_lat},${location.gps_lng}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
      <div className="relative h-48 md:h-56 bg-slate-100">
        <img src={heroImage} alt={location.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {location.code && <Badge className="bg-white/90 text-slate-800 border-0 text-xs">{location.code}</Badge>}
            <Badge className="bg-white/90 text-slate-800 border-0 text-xs capitalize">{location.location_type || 'building'}</Badge>
            {location.status && <Badge className={`text-xs border-0 ${location.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>{location.status}</Badge>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{location.name}</h1>
          {location.address && (
            <p className="text-sm text-white/90 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {location.address}{location.city ? `, ${location.city}` : ''}{location.region ? `, ${location.region}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100 border-t border-slate-100">
        <InfoCell icon={User} label="Contact" value={location.contact_name || '—'} sub={location.client_name} />
        <InfoCell icon={Phone} label="Phone" value={location.contact_phone || '—'} href={location.contact_phone ? `tel:${location.contact_phone}` : null} />
        <InfoCell icon={Mail} label="Email" value={location.contact_email || '—'} href={location.contact_email ? `mailto:${location.contact_email}` : null} truncate />
        <InfoCell icon={Calendar} label="Last scan" value={location.scan_date || 'Not scanned'} sub={`${assetCount} assets`} />
      </div>

      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border-t border-slate-100">
          <MapPin className="w-3.5 h-3.5" />
          View on Google Maps · {location.gps_lat?.toFixed(4)}, {location.gps_lng?.toFixed(4)}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function InfoCell({ icon: Icon, label, value, sub, href, truncate }) {
  const content = (
    <>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className={`text-sm font-semibold text-slate-900 ${truncate ? 'truncate' : ''}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </>
  );
  return href ? (
    <a href={href} className="p-3 hover:bg-slate-50 transition-colors block">{content}</a>
  ) : (
    <div className="p-3">{content}</div>
  );
}