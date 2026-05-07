// Climate / Coastal Risk Overlay — corrosion accelerant by proximity to coast.
// Uses GPS lat/lng of the equipment's location. Bunbury reference shoreline.

const BUNBURY_COAST = { lat: -33.327, lng: 115.640 };

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function climateRiskFor(equipment, location) {
  if (!location?.gps_lat || !location?.gps_lng) {
    return { exposure: 'unknown', distanceKm: null, lifeMultiplier: 1 };
  }
  const km = haversineKm(BUNBURY_COAST, { lat: location.gps_lat, lng: location.gps_lng });
  // Salt-spray corrosion zones (AS 4312)
  let exposure, mult;
  if (km < 1) { exposure = 'severe_marine'; mult = 0.55; }
  else if (km < 5) { exposure = 'marine'; mult = 0.7; }
  else if (km < 20) { exposure = 'coastal'; mult = 0.85; }
  else { exposure = 'inland'; mult = 1.0; }
  return { exposure, distanceKm: Math.round(km * 10) / 10, lifeMultiplier: mult };
}

export function adjustedBaselife(equipment, location) {
  const base = Number(equipment?.specifications?.baselife_years);
  if (!Number.isFinite(base)) return null;
  const r = climateRiskFor(equipment, location);
  // Steel/metal/electrical worst affected
  const t = (equipment?.specifications?.material || '').toLowerCase();
  const sensitive = /steel|metal|alum|galv|electrical|electronic/i.test(t)
    || ['transformer', 'motor', 'power_line', 'generator'].includes(equipment?.type);
  const mult = sensitive ? r.lifeMultiplier : (1 + r.lifeMultiplier) / 2;
  return Math.round(base * mult);
}