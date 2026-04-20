// NSW Trains — Real station coordinates for multiple Sydney Trains lines
// Source: Transport for NSW open data (GTFS stops.txt)
// Plus synthetic maintenance checkpoints (signal boxes, substations, track monitors,
// level crossings) placed along each line — these are the sensor pickup points.

export const NSW_FOCUS = {
  lat: -33.75,
  lng: 150.9,
};

// ---------------------------------------------------------------------------
// Train lines — each has id, name, color, and stations
// ---------------------------------------------------------------------------
export const TRAIN_LINES = [
  {
    id: 'T1',
    name: 'T1 Western Line',
    color: '#f59e0b', // amber
    description: 'Sydney Central → Lithgow',
    stations: [
      { name: 'Central',          lat: -33.8832, lng: 151.2065, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Redfern',           lat: -33.8918, lng: 151.1988, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Strathfield',       lat: -33.8720, lng: 151.0950, zone: 'Inner West',      condition: 'degraded' },
      { name: 'Lidcombe',          lat: -33.8629, lng: 151.0432, zone: 'Inner West',      condition: 'operational' },
      { name: 'Auburn',            lat: -33.8494, lng: 151.0327, zone: 'Inner West',      condition: 'operational' },
      { name: 'Granville',         lat: -33.8349, lng: 151.0132, zone: 'Parramatta',      condition: 'operational' },
      { name: 'Parramatta',        lat: -33.8178, lng: 151.0048, zone: 'Parramatta',      condition: 'critical' },
      { name: 'Westmead',          lat: -33.8076, lng: 150.9879, zone: 'Parramatta',      condition: 'operational' },
      { name: 'Wentworthville',    lat: -33.8075, lng: 150.9713, zone: 'Parramatta',      condition: 'operational' },
      { name: 'Pendle Hill',       lat: -33.8013, lng: 150.9551, zone: 'Western Sydney',  condition: 'operational' },
      { name: 'Toongabbie',        lat: -33.7881, lng: 150.9480, zone: 'Western Sydney',  condition: 'operational' },
      { name: 'Seven Hills',       lat: -33.7745, lng: 150.9379, zone: 'Western Sydney',  condition: 'degraded' },
      { name: 'Blacktown',         lat: -33.7688, lng: 150.9061, zone: 'Western Sydney',  condition: 'operational' },
      { name: 'Doonside',          lat: -33.7663, lng: 150.8696, zone: 'Western Sydney',  condition: 'operational' },
      { name: 'Rooty Hill',        lat: -33.7713, lng: 150.8430, zone: 'Western Sydney',  condition: 'operational' },
      { name: 'Mount Druitt',      lat: -33.7695, lng: 150.8200, zone: 'Western Sydney',  condition: 'operational' },
      { name: 'St Marys',          lat: -33.7647, lng: 150.7760, zone: 'Greater West',    condition: 'operational' },
      { name: 'Werrington',        lat: -33.7582, lng: 150.7450, zone: 'Greater West',    condition: 'operational' },
      { name: 'Kingswood',         lat: -33.7569, lng: 150.7189, zone: 'Greater West',    condition: 'operational' },
      { name: 'Penrith',           lat: -33.7508, lng: 150.6945, zone: 'Greater West',    condition: 'degraded' },
      { name: 'Emu Plains',        lat: -33.7462, lng: 150.6702, zone: 'Blue Mountains',  condition: 'operational' },
      { name: 'Springwood',        lat: -33.6977, lng: 150.5626, zone: 'Blue Mountains',  condition: 'critical' },
      { name: 'Katoomba',          lat: -33.7126, lng: 150.3113, zone: 'Blue Mountains',  condition: 'degraded' },
      { name: 'Lithgow',           lat: -33.4817, lng: 150.1574, zone: 'Central West',    condition: 'operational' },
    ],
  },
  {
    id: 'T2',
    name: 'T2 Inner West & Leppington',
    color: '#3b82f6', // blue
    description: 'City Circle → Leppington / Parramatta',
    stations: [
      { name: 'Central',           lat: -33.8832, lng: 151.2065, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Redfern',           lat: -33.8918, lng: 151.1988, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Macdonaldtown',     lat: -33.8945, lng: 151.1806, zone: 'Inner West',      condition: 'operational' },
      { name: 'Newtown',           lat: -33.8975, lng: 151.1795, zone: 'Inner West',      condition: 'operational' },
      { name: 'Stanmore',          lat: -33.8930, lng: 151.1636, zone: 'Inner West',      condition: 'operational' },
      { name: 'Petersham',         lat: -33.8930, lng: 151.1563, zone: 'Inner West',      condition: 'degraded' },
      { name: 'Lewisham',          lat: -33.8890, lng: 151.1466, zone: 'Inner West',      condition: 'operational' },
      { name: 'Summer Hill',       lat: -33.8890, lng: 151.1391, zone: 'Inner West',      condition: 'operational' },
      { name: 'Ashfield',          lat: -33.8874, lng: 151.1250, zone: 'Inner West',      condition: 'operational' },
      { name: 'Croydon',           lat: -33.8831, lng: 151.1150, zone: 'Inner West',      condition: 'operational' },
      { name: 'Burwood',           lat: -33.8779, lng: 151.1030, zone: 'Inner West',      condition: 'critical' },
      { name: 'Strathfield',       lat: -33.8720, lng: 151.0950, zone: 'Inner West',      condition: 'operational' },
      { name: 'Homebush',          lat: -33.8645, lng: 151.0852, zone: 'Inner West',      condition: 'operational' },
      { name: 'Flemington',        lat: -33.8623, lng: 151.0649, zone: 'Inner West',      condition: 'operational' },
      { name: 'Lidcombe',          lat: -33.8629, lng: 151.0432, zone: 'Inner West',      condition: 'operational' },
      { name: 'Regents Park',      lat: -33.8826, lng: 151.0370, zone: 'South West',      condition: 'operational' },
      { name: 'Birrong',           lat: -33.8882, lng: 151.0345, zone: 'South West',      condition: 'operational' },
      { name: 'Bankstown',         lat: -33.9175, lng: 151.0340, zone: 'South West',      condition: 'degraded' },
      { name: 'Cabramatta',        lat: -33.8944, lng: 150.9357, zone: 'South West',      condition: 'operational' },
      { name: 'Liverpool',         lat: -33.9220, lng: 150.9232, zone: 'South West',      condition: 'operational' },
      { name: 'Leppington',        lat: -33.9548, lng: 150.8043, zone: 'South West',      condition: 'operational' },
    ],
  },
  {
    id: 'T3',
    name: 'T3 Bankstown Line',
    color: '#a855f7', // purple
    description: 'City Circle → Lidcombe via Bankstown',
    stations: [
      { name: 'Central',           lat: -33.8832, lng: 151.2065, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Sydenham',          lat: -33.9116, lng: 151.1666, zone: 'Inner West',      condition: 'operational' },
      { name: 'Marrickville',      lat: -33.9099, lng: 151.1571, zone: 'Inner West',      condition: 'operational' },
      { name: 'Dulwich Hill',      lat: -33.9034, lng: 151.1411, zone: 'Inner West',      condition: 'degraded' },
      { name: 'Hurlstone Park',    lat: -33.9088, lng: 151.1316, zone: 'Inner West',      condition: 'operational' },
      { name: 'Canterbury',        lat: -33.9115, lng: 151.1185, zone: 'Inner West',      condition: 'operational' },
      { name: 'Campsie',           lat: -33.9115, lng: 151.1037, zone: 'Inner West',      condition: 'operational' },
      { name: 'Belmore',           lat: -33.9167, lng: 151.0892, zone: 'South',           condition: 'operational' },
      { name: 'Lakemba',           lat: -33.9196, lng: 151.0743, zone: 'South',           condition: 'critical' },
      { name: 'Wiley Park',        lat: -33.9199, lng: 151.0619, zone: 'South',           condition: 'operational' },
      { name: 'Punchbowl',         lat: -33.9247, lng: 151.0505, zone: 'South',           condition: 'operational' },
      { name: 'Bankstown',         lat: -33.9175, lng: 151.0340, zone: 'South West',      condition: 'degraded' },
      { name: 'Yagoona',           lat: -33.9061, lng: 151.0271, zone: 'South West',      condition: 'operational' },
      { name: 'Birrong',           lat: -33.8882, lng: 151.0345, zone: 'South West',      condition: 'operational' },
      { name: 'Regents Park',      lat: -33.8826, lng: 151.0370, zone: 'South West',      condition: 'operational' },
      { name: 'Berala',            lat: -33.8718, lng: 151.0373, zone: 'South West',      condition: 'operational' },
      { name: 'Lidcombe',          lat: -33.8629, lng: 151.0432, zone: 'Inner West',      condition: 'operational' },
    ],
  },
  {
    id: 'T4',
    name: 'T4 Eastern Suburbs & Illawarra',
    color: '#06b6d4', // cyan
    description: 'Bondi Junction → Waterfall / Cronulla',
    stations: [
      { name: 'Bondi Junction',    lat: -33.8916, lng: 151.2489, zone: 'Eastern Suburbs', condition: 'operational' },
      { name: 'Edgecliff',         lat: -33.8791, lng: 151.2389, zone: 'Eastern Suburbs', condition: 'operational' },
      { name: 'Kings Cross',       lat: -33.8737, lng: 151.2226, zone: 'Sydney CBD',      condition: 'degraded' },
      { name: 'Martin Place',      lat: -33.8679, lng: 151.2120, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Town Hall',         lat: -33.8732, lng: 151.2070, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Central',           lat: -33.8832, lng: 151.2065, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Erskineville',      lat: -33.9028, lng: 151.1864, zone: 'Inner South',     condition: 'operational' },
      { name: 'St Peters',         lat: -33.9063, lng: 151.1803, zone: 'Inner South',     condition: 'operational' },
      { name: 'Sydenham',          lat: -33.9116, lng: 151.1666, zone: 'Inner West',      condition: 'operational' },
      { name: 'Wolli Creek',       lat: -33.9284, lng: 151.1531, zone: 'South',           condition: 'critical' },
      { name: 'Arncliffe',         lat: -33.9365, lng: 151.1472, zone: 'South',           condition: 'operational' },
      { name: 'Rockdale',          lat: -33.9517, lng: 151.1373, zone: 'South',           condition: 'operational' },
      { name: 'Kogarah',           lat: -33.9648, lng: 151.1326, zone: 'South',           condition: 'operational' },
      { name: 'Carlton',           lat: -33.9724, lng: 151.1243, zone: 'South',           condition: 'operational' },
      { name: 'Hurstville',        lat: -33.9675, lng: 151.1022, zone: 'South',           condition: 'degraded' },
      { name: 'Penshurst',         lat: -33.9665, lng: 151.0872, zone: 'South',           condition: 'operational' },
      { name: 'Mortdale',          lat: -33.9700, lng: 151.0816, zone: 'South',           condition: 'operational' },
      { name: 'Oatley',            lat: -33.9827, lng: 151.0773, zone: 'South',           condition: 'operational' },
      { name: 'Sutherland',        lat: -34.0316, lng: 151.0574, zone: 'Sutherland',      condition: 'operational' },
      { name: 'Cronulla',          lat: -34.0558, lng: 151.1527, zone: 'Sutherland',      condition: 'operational' },
    ],
  },
  {
    id: 'T8',
    name: 'T8 Airport & South',
    color: '#10b981', // emerald
    description: 'City Circle → Macarthur via Airport',
    stations: [
      { name: 'Central',           lat: -33.8832, lng: 151.2065, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Green Square',      lat: -33.9069, lng: 151.2015, zone: 'Inner South',     condition: 'operational' },
      { name: 'Mascot',            lat: -33.9233, lng: 151.1937, zone: 'Inner South',     condition: 'operational' },
      { name: 'Domestic Airport',  lat: -33.9346, lng: 151.1807, zone: 'Airport',         condition: 'critical' },
      { name: 'International Airport', lat: -33.9349, lng: 151.1661, zone: 'Airport',     condition: 'degraded' },
      { name: 'Wolli Creek',       lat: -33.9284, lng: 151.1531, zone: 'South',           condition: 'operational' },
      { name: 'Turrella',          lat: -33.9356, lng: 151.1357, zone: 'South',           condition: 'operational' },
      { name: 'Bardwell Park',     lat: -33.9378, lng: 151.1283, zone: 'South',           condition: 'operational' },
      { name: 'Bexley North',      lat: -33.9447, lng: 151.1150, zone: 'South',           condition: 'operational' },
      { name: 'Kingsgrove',        lat: -33.9462, lng: 151.1017, zone: 'South',           condition: 'operational' },
      { name: 'Beverly Hills',     lat: -33.9490, lng: 151.0837, zone: 'South',           condition: 'operational' },
      { name: 'Revesby',           lat: -33.9493, lng: 151.0154, zone: 'South West',      condition: 'operational' },
      { name: 'Panania',           lat: -33.9520, lng: 150.9985, zone: 'South West',      condition: 'operational' },
      { name: 'East Hills',        lat: -33.9620, lng: 150.9810, zone: 'South West',      condition: 'degraded' },
      { name: 'Holsworthy',        lat: -33.9631, lng: 150.9514, zone: 'South West',      condition: 'operational' },
      { name: 'Glenfield',         lat: -33.9714, lng: 150.8902, zone: 'South West',      condition: 'operational' },
      { name: 'Campbelltown',      lat: -34.0634, lng: 150.8140, zone: 'Macarthur',       condition: 'operational' },
      { name: 'Macarthur',         lat: -34.0728, lng: 150.8057, zone: 'Macarthur',       condition: 'operational' },
    ],
  },
  {
    id: 'T9',
    name: 'T9 Northern Line',
    color: '#ec4899', // pink
    description: 'Hornsby → City via Strathfield',
    stations: [
      { name: 'Hornsby',           lat: -33.7035, lng: 151.0995, zone: 'Northern',        condition: 'operational' },
      { name: 'Waitara',           lat: -33.7098, lng: 151.1048, zone: 'Northern',        condition: 'operational' },
      { name: 'Wahroonga',         lat: -33.7172, lng: 151.1169, zone: 'Upper North',     condition: 'operational' },
      { name: 'Warrawee',          lat: -33.7222, lng: 151.1203, zone: 'Upper North',     condition: 'operational' },
      { name: 'Turramurra',        lat: -33.7322, lng: 151.1290, zone: 'Upper North',     condition: 'degraded' },
      { name: 'Pymble',            lat: -33.7436, lng: 151.1436, zone: 'Upper North',     condition: 'operational' },
      { name: 'Gordon',            lat: -33.7560, lng: 151.1544, zone: 'Upper North',     condition: 'operational' },
      { name: 'Killara',           lat: -33.7663, lng: 151.1603, zone: 'Upper North',     condition: 'operational' },
      { name: 'Lindfield',         lat: -33.7758, lng: 151.1692, zone: 'Upper North',     condition: 'critical' },
      { name: 'Roseville',         lat: -33.7838, lng: 151.1795, zone: 'Upper North',     condition: 'operational' },
      { name: 'Chatswood',         lat: -33.7964, lng: 151.1830, zone: 'Lower North',     condition: 'operational' },
      { name: 'Artarmon',          lat: -33.8078, lng: 151.1846, zone: 'Lower North',     condition: 'operational' },
      { name: 'St Leonards',       lat: -33.8232, lng: 151.1953, zone: 'Lower North',     condition: 'operational' },
      { name: 'Wollstonecraft',    lat: -33.8329, lng: 151.1983, zone: 'Lower North',     condition: 'operational' },
      { name: 'Waverton',          lat: -33.8389, lng: 151.1999, zone: 'Lower North',     condition: 'operational' },
      { name: 'North Sydney',      lat: -33.8404, lng: 151.2073, zone: 'Lower North',     condition: 'operational' },
      { name: 'Milsons Point',     lat: -33.8475, lng: 151.2117, zone: 'Lower North',     condition: 'operational' },
      { name: 'Wynyard',           lat: -33.8657, lng: 151.2063, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Town Hall',         lat: -33.8732, lng: 151.2070, zone: 'Sydney CBD',      condition: 'operational' },
      { name: 'Central',           lat: -33.8832, lng: 151.2065, zone: 'Sydney CBD',      condition: 'operational' },
    ],
  },
];

// Flattened stations list (de-duplicated by name — same stn appears on multiple lines)
export const ALL_STATIONS = (() => {
  const seen = new Map();
  for (const line of TRAIN_LINES) {
    for (const s of line.stations) {
      if (!seen.has(s.name)) {
        seen.set(s.name, { ...s, lines: [line.id] });
      } else {
        seen.get(s.name).lines.push(line.id);
      }
    }
  }
  return Array.from(seen.values());
})();

// Backwards-compat — keep original export so other files don't break
export const WESTERN_LINE_STATIONS = TRAIN_LINES[0].stations;

// ---------------------------------------------------------------------------
// Maintenance checkpoints — sensor pickup locations
// Placed synthetically between stations (signal boxes, substations, track
// monitors, level crossings) so the map can show where sensors are deployed.
// ---------------------------------------------------------------------------
const CHECKPOINT_TYPES = [
  { type: 'signal_box',     label: 'Signal Box',     sensors: ['current', 'temperature', 'voltage'] },
  { type: 'substation',     label: 'Power Substation', sensors: ['voltage', 'current', 'temperature'] },
  { type: 'track_monitor',  label: 'Track Monitor',  sensors: ['vibration', 'track_geometry', 'strain'] },
  { type: 'level_crossing', label: 'Level Crossing', sensors: ['current', 'acoustic_emission', 'vibration'] },
  { type: 'points_machine', label: 'Points Machine', sensors: ['current', 'displacement', 'temperature'] },
];

// Deterministic pseudo-random so positions are stable between renders
function seeded(i) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function buildCheckpoints() {
  const checkpoints = [];
  let id = 0;

  TRAIN_LINES.forEach((line, lineIdx) => {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const a = line.stations[i];
      const b = line.stations[i + 1];

      // 1-2 checkpoints per segment depending on distance
      const dLat = b.lat - a.lat;
      const dLng = b.lng - a.lng;
      const distKm = Math.hypot(dLat, dLng) * 111;
      const count = distKm > 5 ? 2 : 1;

      for (let k = 0; k < count; k++) {
        const seed = id;
        const t = (k + 1) / (count + 1) + (seeded(seed) - 0.5) * 0.1;
        // small perpendicular jitter so they don't sit exactly on the line
        const jitter = (seeded(seed + 7) - 0.5) * 0.0015;

        const cpType = CHECKPOINT_TYPES[Math.floor(seeded(seed + 3) * CHECKPOINT_TYPES.length)];
        const condition =
          seeded(seed + 11) > 0.92 ? 'critical' :
          seeded(seed + 11) > 0.82 ? 'degraded' :
          seeded(seed + 11) > 0.75 ? 'maintenance' :
          'operational';

        checkpoints.push({
          id: `CP-${line.id}-${id}`,
          line: line.id,
          lineColor: line.color,
          type: cpType.type,
          label: cpType.label,
          name: `${cpType.label} ${line.id}-${String(id).padStart(3, '0')}`,
          lat: a.lat + dLat * t + jitter,
          lng: a.lng + dLng * t - jitter,
          condition,
          sensors: cpType.sensors,
          lastReading: new Date(Date.now() - Math.floor(seeded(seed + 5) * 3600 * 1000)).toISOString(),
          between: `${a.name} → ${b.name}`,
          zone: a.zone,
        });
        id++;
      }
    }
  });

  return checkpoints;
}

export const MAINTENANCE_CHECKPOINTS = buildCheckpoints();