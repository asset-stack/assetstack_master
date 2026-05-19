// Build a hierarchical tree from a flat equipment array.
// Canonical standard across the app: Location → Room → Asset.
// Other groupings (type, criticality, status) are flat: Group → Asset.

export function buildAssetTree(equipment, groupBy = 'location') {
  if (!equipment?.length) {
    return {
      name: 'No Assets',
      attributes: { kind: 'root', count: 0, critical: 0 },
      children: [],
    };
  }

  // First-level grouping
  const primary = {};
  equipment.forEach((eq) => {
    const key = groupBy === 'location'
      ? (eq.location || 'Unassigned')
      : groupBy === 'type'
      ? (eq.type?.replace(/_/g, ' ') || 'Unknown')
      : groupBy === 'criticality'
      ? (eq.criticality?.replace(/_/g, ' ') || 'medium')
      : (eq.status || 'unknown');

    if (!primary[key]) primary[key] = [];
    primary[key].push(eq);
  });

  const primaryKind = groupBy === 'location' ? 'location' : 'group';

  const children = Object.entries(primary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => {
      // CANONICAL: when grouped by location, second level is ROOM (not type)
      let subChildren;
      if (groupBy === 'location') {
        const byRoom = {};
        items.forEach((eq) => {
          const r = eq.room?.trim() || 'Unassigned room';
          if (!byRoom[r]) byRoom[r] = [];
          byRoom[r].push(eq);
        });
        subChildren = Object.entries(byRoom)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([roomName, roomItems]) => ({
            name: roomName,
            attributes: {
              kind: 'room',
              count: roomItems.length,
              critical: roomItems.filter(e => e.risk_level === 'critical' || e.status === 'critical').length,
            },
            children: roomItems.map(assetToNode),
          }));
      } else {
        subChildren = items.map(assetToNode);
      }

      return {
        name,
        attributes: {
          kind: primaryKind,
          count: items.length,
          critical: items.filter(e => e.risk_level === 'critical' || e.status === 'critical').length,
        },
        children: subChildren,
      };
    });

  const totalCritical = equipment.filter(e => e.risk_level === 'critical' || e.status === 'critical').length;

  return {
    name: 'All Assets',
    attributes: {
      kind: 'root',
      count: equipment.length,
      critical: totalCritical,
    },
    children,
  };
}

function assetToNode(eq) {
  return {
    name: eq.name,
    attributes: {
      kind: 'asset',
      id: eq.id,
      type: eq.type,
      status: eq.status,
      health_score: eq.health_score,
      risk_level: eq.risk_level,
      location: eq.location,
      room: eq.room,
      manufacturer: eq.manufacturer,
      model: eq.model,
      serial_number: eq.serial_number,
      operating_hours: eq.operating_hours,
      failure_probability: eq.failure_probability,
      last_maintenance_date: eq.last_maintenance_date,
      rated_capacity: eq.rated_capacity,
      capacity_unit: eq.capacity_unit,
    },
  };
}

// Filter tree by search term — keeps branches that contain matches
export function filterTree(node, term) {
  if (!term) return node;
  const lower = term.toLowerCase();
  const matches = (n) => n.name?.toLowerCase().includes(lower);

  const walk = (n) => {
    if (!n.children || n.children.length === 0) {
      return matches(n) ? { ...n } : null;
    }
    const filteredChildren = n.children.map(walk).filter(Boolean);
    if (filteredChildren.length > 0 || matches(n)) {
      return { ...n, children: filteredChildren };
    }
    return null;
  };

  return walk(node) || { ...node, children: [] };
}