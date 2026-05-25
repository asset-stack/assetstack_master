import React, { useState, useEffect, useMemo } from 'react';
import { secureEntity } from '@/lib/secureEntities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Waves, Loader2 } from 'lucide-react';
import { climateRiskFor, adjustedBaselife } from '@/lib/climateRisk';
import { fmtMoney, deriveCRC } from '@/lib/assetMetrics';

const EXPOSURE_COLOR = {
  severe_marine: 'bg-red-100 text-red-700',
  marine: 'bg-orange-100 text-orange-700',
  coastal: 'bg-amber-100 text-amber-700',
  inland: 'bg-emerald-100 text-emerald-700',
  unknown: 'bg-slate-100 text-slate-700',
};

export default function ClimateRisk() {
  const [equipment, setEquipment] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [allEq, allLoc] = await Promise.all([
        (async () => {
          const out = []; let p = 0;
          while (true) {
            const b = await secureEntity('Equipment').list('-created_date', 200, p * 200);
            out.push(...b); if (b.length < 200) break; p++; if (p > 20) break;
          }
          return out;
        })(),
        secureEntity('Location').list('-created_date', 100),
      ]);
      setEquipment(allEq);
      setLocations(allLoc);
      setLoading(false);
    })();
  }, []);

  const locationByName = useMemo(() => {
    const m = {};
    for (const l of locations) m[l.name] = l;
    return m;
  }, [locations]);

  const enriched = useMemo(() => equipment.map((eq) => {
    const loc = locationByName[eq.location];
    const climate = climateRiskFor(eq, loc);
    const adjLife = adjustedBaselife(eq, loc);
    const baseLife = Number(eq.specifications?.baselife_years);
    const lifeLost = (Number.isFinite(baseLife) && adjLife != null) ? baseLife - adjLife : 0;
    return { eq, climate, adjLife, baseLife, lifeLost, crc: deriveCRC(eq) };
  }), [equipment, locationByName]);

  const summary = useMemo(() => {
    const groups = { severe_marine: 0, marine: 0, coastal: 0, inland: 0, unknown: 0 };
    let exposedValue = 0;
    for (const r of enriched) {
      groups[r.climate.exposure] = (groups[r.climate.exposure] || 0) + 1;
      if (r.climate.exposure !== 'inland' && r.climate.exposure !== 'unknown') {
        exposedValue += r.crc;
      }
    }
    return { groups, exposedValue };
  }, [enriched]);

  if (loading) return <div className="p-6 flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1480px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Waves className="w-7 h-7 text-cyan-600" /> Climate / Coastal Risk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Salt-spray corrosion zones (AS 4312) reduce expected life of metal/electrical assets near the coast.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {Object.entries(summary.groups).map(([key, count]) => (
          <Card key={key} className="p-4">
            <div className="text-xs text-slate-500 uppercase">{key.replace('_', ' ')}</div>
            <div className="text-2xl font-bold tabular-nums">{count}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4 mb-5">
        <div className="text-sm text-slate-700">
          <span className="font-bold tabular-nums">{fmtMoney(summary.exposedValue)}</span> of replacement value is in coastal exposure zones.
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold text-slate-900 mb-3">Most-impacted assets (largest expected life loss)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500 border-b">
                <th className="py-2 pr-3">Asset</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Exposure</th>
                <th className="py-2 pr-3">Distance</th>
                <th className="py-2 pr-3">Base Life</th>
                <th className="py-2 pr-3">Adjusted</th>
                <th className="py-2 pr-3">Life Lost</th>
              </tr>
            </thead>
            <tbody>
              {enriched
                .filter((r) => r.lifeLost > 0)
                .sort((a, b) => b.lifeLost - a.lifeLost)
                .slice(0, 50)
                .map((r) => (
                <tr key={r.eq.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 pr-3 font-medium text-slate-900 truncate max-w-[260px]">{r.eq.name}</td>
                  <td className="py-2 pr-3 text-xs text-slate-600 truncate max-w-[180px]">{r.eq.location}</td>
                  <td className="py-2 pr-3"><Badge className={`text-[10px] ${EXPOSURE_COLOR[r.climate.exposure]}`}>{r.climate.exposure.replace('_', ' ')}</Badge></td>
                  <td className="py-2 pr-3 tabular-nums text-xs">{r.climate.distanceKm != null ? `${r.climate.distanceKm} km` : '—'}</td>
                  <td className="py-2 pr-3 tabular-nums">{r.baseLife || '—'} yrs</td>
                  <td className="py-2 pr-3 tabular-nums text-amber-700">{r.adjLife || '—'} yrs</td>
                  <td className="py-2 pr-3 tabular-nums font-bold text-red-600">−{r.lifeLost} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}