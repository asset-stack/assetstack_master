// Smart inspection route planner — orders assets by room, prioritising overdue + high-risk
// Input: array of equipment records. Output: ordered array grouped by room with priority flags.

export function buildInspectionRoute(assets) {
  // Group by room
  const byRoom = new Map();
  for (const a of assets) {
    const room = a.room || a.specifications?.room_location || 'Unassigned';
    if (!byRoom.has(room)) byRoom.set(room, []);
    byRoom.get(room).push(a);
  }

  // Score each asset for priority within its room
  const scoreAsset = (a) => {
    let s = 0;
    const cg = a.specifications?.condition_grade;
    if (cg >= 4) s += 50;
    else if (cg === 3) s += 20;
    if (a.criticality === 'high' || a.criticality === 'mission_critical') s += 30;
    if (a.specifications?.life_consumed >= 0.8) s += 25;
    if (a.risk_level === 'high' || a.risk_level === 'critical') s += 20;
    if (cg == null) s += 10; // never inspected
    return s;
  };

  // Order rooms by total priority (highest first), assets within room by name
  const rooms = Array.from(byRoom.entries()).map(([roomName, items]) => {
    const sorted = items.slice().sort((a, b) => scoreAsset(b) - scoreAsset(a));
    const totalScore = sorted.reduce((acc, a) => acc + scoreAsset(a), 0);
    return { roomName, assets: sorted, totalScore };
  });
  rooms.sort((a, b) => b.totalScore - a.totalScore);

  return rooms;
}

export function getPriorityFlag(asset) {
  const cg = asset.specifications?.condition_grade;
  if (cg >= 4) return { label: 'Poor', color: 'bg-red-100 text-red-700' };
  if (cg === 3) return { label: 'Fair', color: 'bg-amber-100 text-amber-700' };
  if (asset.criticality === 'high' || asset.criticality === 'mission_critical')
    return { label: 'Critical', color: 'bg-orange-100 text-orange-700' };
  if (asset.specifications?.life_consumed >= 0.8)
    return { label: 'End of life', color: 'bg-purple-100 text-purple-700' };
  if (cg == null) return { label: 'New', color: 'bg-blue-100 text-blue-700' };
  return null;
}