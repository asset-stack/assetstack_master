import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap, LayersControl, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Locate, Layers, MapPin, Activity, AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';

const conditionColor = {
  operational: '#10b981',
  degraded: '#f59e0b',
  critical: '#ef4444',
  maintenance: '#3b82f6',
  offline: '#94a3b8',
};

// Compute sensible bounds for the network
function computeBounds(stations) {
  if (!stations.length) return null;
  const lats = stations.map((s) => s.lat);
  const lngs = stations.map((s) => s.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

// Helper component — imperatively fit/fly
function MapController({ bounds, focusStation, onMove }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1.2 });
  }, [bounds, map]);

  useEffect(() => {
    if (focusStation) {
      map.flyTo([focusStation.lat, focusStation.lng], 15, { duration: 1.4 });
    }
  }, [focusStation, map]);

  useEffect(() => {
    const handler = () => onMove && onMove({
      zoom: map.getZoom(),
      center: map.getCenter(),
    });
    map.on('move', handler);
    map.on('zoom', handler);
    handler();
    return () => {
      map.off('move', handler);
      map.off('zoom', handler);
    };
  }, [map, onMove]);

  return null;
}

// Floating map controls (zoom / locate)
function FloatingControls({ onZoomIn, onZoomOut, onFit, onLocate }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl">
      <button onClick={onZoomIn} title="Zoom in" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
        <ZoomIn className="w-4 h-4" />
      </button>
      <button onClick={onZoomOut} title="Zoom out" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
        <ZoomOut className="w-4 h-4" />
      </button>
      <div className="h-px bg-white/10" />
      <button onClick={onFit} title="Fit network" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
        <Crosshair className="w-4 h-4" />
      </button>
      <button onClick={onLocate} title="My location" className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors">
        <Locate className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function NetworkDrilldownMap({ stations, focusStation, onClose, onSelectStation }) {
  const [mapRef, setMapRef] = useState(null);
  const [viewInfo, setViewInfo] = useState({ zoom: 10, center: null });
  const [hovered, setHovered] = useState(null);

  const bounds = useMemo(() => computeBounds(stations), [stations]);
  const path = useMemo(() => stations.map((s) => [s.lat, s.lng]), [stations]);

  const totalDistanceKm = useMemo(() => {
    let d = 0;
    for (let i = 1; i < stations.length; i++) {
      const a = stations[i - 1];
      const b = stations[i];
      // Haversine
      const R = 6371;
      const dLat = ((b.lat - a.lat) * Math.PI) / 180;
      const dLng = ((b.lng - a.lng) * Math.PI) / 180;
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) *
          Math.cos((b.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      d += 2 * R * Math.asin(Math.sqrt(h));
    }
    return d;
  }, [stations]);

  const stats = useMemo(() => ({
    operational: stations.filter((s) => s.condition === 'operational').length,
    degraded: stations.filter((s) => s.condition === 'degraded').length,
    critical: stations.filter((s) => s.condition === 'critical').length,
  }), [stations]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col"
    >
      {/* Top bar */}
      <div className="relative z-[1001] flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
            title="Back to globe"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate">Network Drill-down</h2>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-[10px] font-bold tracking-wider uppercase">
                Live • Zoom {viewInfo.zoom}
              </span>
            </div>
            <p className="text-xs text-white/50 truncate">
              {stations.length} stations • {totalDistanceKm.toFixed(1)} km • OpenStreetMap tiles
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <StatPill icon={CheckCircle2} label={stats.operational} color="text-emerald-400" />
          <StatPill icon={Activity} label={stats.degraded} color="text-amber-400" />
          <StatPill icon={AlertTriangle} label={stats.critical} color="text-rose-400" />
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <MapContainer
          bounds={bounds}
          zoomControl={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
          whenCreated={setMapRef}
        >
          <LayersControl position="bottomright">
            <LayersControl.BaseLayer checked name="Dark (Carto)">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Streets (OSM)">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                attribution='&copy; OpenStreetMap contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
                attribution='Tiles &copy; Esri'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Line glow (wider, soft) */}
          <Polyline
            positions={path}
            pathOptions={{ color: '#6366f1', weight: 12, opacity: 0.18, lineCap: 'round', lineJoin: 'round' }}
          />
          {/* Line main */}
          <Polyline
            positions={path}
            pathOptions={{ color: '#a78bfa', weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
          />
          {/* Line accent */}
          <Polyline
            positions={path}
            pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.6, dashArray: '6 10', lineCap: 'round' }}
          />

          {/* Stations */}
          {stations.map((s) => {
            const color = conditionColor[s.condition] || conditionColor.offline;
            const isCritical = s.condition === 'critical';
            return (
              <React.Fragment key={s.name}>
                {/* Halo for critical */}
                {isCritical && (
                  <CircleMarker
                    center={[s.lat, s.lng]}
                    radius={18}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 0 }}
                  />
                )}
                <CircleMarker
                  center={[s.lat, s.lng]}
                  radius={isCritical ? 8 : 6}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () => onSelectStation && onSelectStation(s),
                    mouseover: () => setHovered(s),
                    mouseout: () => setHovered(null),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={1} className="station-tooltip">
                    <div className="text-xs font-semibold">{s.name}</div>
                    <div className="text-[10px] opacity-70 capitalize">{s.condition} • {s.zone}</div>
                    <div className="text-[10px] font-mono opacity-60 mt-0.5">
                      {s.lat.toFixed(5)}°, {s.lng.toFixed(5)}°
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="min-w-[180px]">
                      <div className="font-bold text-sm">{s.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{s.zone}</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-xs capitalize">{s.condition}</span>
                      </div>
                      <div className="mt-2 font-mono text-[11px] text-slate-500">
                        <div>lat: {s.lat.toFixed(6)}°</div>
                        <div>lng: {s.lng.toFixed(6)}°</div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

          <MapController
            bounds={bounds}
            focusStation={focusStation}
            onMove={setViewInfo}
          />
        </MapContainer>

        {/* Floating controls */}
        <FloatingControls
          onZoomIn={() => mapRef && mapRef.zoomIn()}
          onZoomOut={() => mapRef && mapRef.zoomOut()}
          onFit={() => mapRef && bounds && mapRef.fitBounds(bounds, { padding: [40, 40] })}
          onLocate={() => mapRef && mapRef.locate({ setView: true, maxZoom: 14 })}
        />

        {/* Coordinate readout (bottom-left) */}
        {viewInfo.center && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3 h-3 text-indigo-300" />
              <span className="text-[9px] font-bold tracking-wider uppercase text-indigo-200">
                Viewport Center
              </span>
            </div>
            <p className="text-[11px] font-mono text-white">
              {viewInfo.center.lat.toFixed(6)}°, {viewInfo.center.lng.toFixed(6)}°
            </p>
            <p className="text-[9px] text-white/40 mt-0.5">Zoom level {viewInfo.zoom} / 20</p>
          </div>
        )}

        {/* Hovered station readout (bottom-center) */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-gradient-to-br from-indigo-600/90 to-fuchsia-600/90 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 shadow-2xl"
          >
            <p className="text-sm font-bold text-white">{hovered.name}</p>
            <p className="text-[10px] text-white/80 font-mono mt-0.5">
              {hovered.lat.toFixed(6)}°, {hovered.lng.toFixed(6)}°
            </p>
          </motion.div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-3 h-3 text-white/60" />
            <span className="text-[9px] font-bold tracking-wider uppercase text-white/60">Status</span>
          </div>
          <div className="space-y-1.5">
            <LegendRow color="#10b981" label="Operational" />
            <LegendRow color="#f59e0b" label="Degraded" />
            <LegendRow color="#ef4444" label="Critical" />
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        .leaflet-container {
          font-family: ui-sans-serif, system-ui;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255,255,255,0.98);
          border-radius: 10px;
        }
        .leaflet-popup-tip {
          background: rgba(255,255,255,0.98);
        }
        .station-tooltip {
          background: rgba(15,23,42,0.95) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        }
        .station-tooltip::before {
          border-top-color: rgba(15,23,42,0.95) !important;
        }
        .leaflet-control-layers {
          background: rgba(15,23,42,0.9) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
        }
        .leaflet-control-layers-expanded {
          padding: 10px !important;
        }
        .leaflet-control-layers label {
          color: #fff !important;
          font-size: 12px !important;
        }
      `}</style>
    </motion.div>
  );
}

function StatPill({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className="text-xs font-semibold text-white">{label}</span>
    </div>
  );
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-[11px] text-white/80">{label}</span>
    </div>
  );
}