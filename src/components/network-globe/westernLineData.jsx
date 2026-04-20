// NSW Trains T1 Western Line — Real station coordinates (publicly available)
// Source: Transport for NSW open data (GTFS stops.txt)
// Each station: [longitude, latitude, name, zone, condition]
// condition is a demo asset-health status so the map feels alive.

export const WESTERN_LINE_STATIONS = [
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
  { name: 'Lapstone',          lat: -33.7693, lng: 150.6405, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Glenbrook',         lat: -33.7690, lng: 150.6229, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Blaxland',          lat: -33.7445, lng: 150.6075, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Warrimoo',          lat: -33.7243, lng: 150.6010, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Valley Heights',    lat: -33.7043, lng: 150.5889, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Springwood',        lat: -33.6977, lng: 150.5626, zone: 'Blue Mountains',  condition: 'critical' },
  { name: 'Faulconbridge',     lat: -33.6972, lng: 150.5358, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Linden',            lat: -33.7095, lng: 150.4847, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Woodford',          lat: -33.7290, lng: 150.4690, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Hazelbrook',        lat: -33.7236, lng: 150.4527, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Lawson',            lat: -33.7213, lng: 150.4287, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Bullaburra',        lat: -33.7241, lng: 150.4103, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Wentworth Falls',   lat: -33.7157, lng: 150.3738, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Leura',             lat: -33.7128, lng: 150.3320, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Katoomba',          lat: -33.7126, lng: 150.3113, zone: 'Blue Mountains',  condition: 'degraded' },
  { name: 'Medlow Bath',       lat: -33.6822, lng: 150.2787, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Blackheath',        lat: -33.6364, lng: 150.2856, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Mount Victoria',    lat: -33.5870, lng: 150.2555, zone: 'Blue Mountains',  condition: 'operational' },
  { name: 'Lithgow',           lat: -33.4817, lng: 150.1574, zone: 'Central West',    condition: 'operational' },
];

// Helpful centre point to orient the globe on Sydney / NSW
export const NSW_FOCUS = {
  lat: -33.55,
  lng: 150.55,
};