import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Cpu, Box, AlertTriangle, Wallet, CalendarDays, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const sevColor = {
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
  major: 'bg-orange-100 text-orange-700 border-orange-200',
  moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  minor: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusColor = {
  operational: 'text-emerald-600',
  degraded: 'text-amber-600',
  critical: 'text-rose-600',
  offline: 'text-slate-500',
  maintenance: 'text-indigo-600',
};

export default function LocationDetailTabs({ location }) {
  const locName = location.name;

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment', locName],
    queryFn: () => base44.entities.Equipment.filter({ location: locName }, '-created_date', 200),
  });
  const { data: scans = [] } = useQuery({
    queryKey: ['scans', location.id],
    queryFn: () => base44.entities.DigitalTwinModel.filter({ location_id: location.id }, '-scan_date', 50),
  });
  const scanIds = scans.map(s => s.id);
  const { data: conditionReports = [] } = useQuery({
    queryKey: ['cr', location.id, scanIds.join(',')],
    queryFn: async () => {
      if (!scanIds.length) return [];
      const all = await Promise.all(scanIds.map(id => base44.entities.ConditionReport.filter({ digital_twin_model_id: id }, '-created_date', 100)));
      return all.flat();
    },
    enabled: scanIds.length > 0,
  });
  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', locName],
    queryFn: () => base44.entities.Budget.filter({ scope_name: locName }, '-created_date', 50),
  });
  const { data: capitalItems = [] } = useQuery({
    queryKey: ['capital', locName],
    queryFn: () => base44.entities.CapitalPlanItem.filter({ location_name: locName }, '-replacement_year', 100),
  });

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <Tabs defaultValue="assets" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-4">
        <TabsTrigger value="assets"><Cpu className="w-4 h-4 mr-1.5" />Assets ({equipment.length})</TabsTrigger>
        <TabsTrigger value="scans"><Box className="w-4 h-4 mr-1.5" />Scans ({scans.length})</TabsTrigger>
        <TabsTrigger value="condition"><AlertTriangle className="w-4 h-4 mr-1.5" />Condition ({conditionReports.length})</TabsTrigger>
        <TabsTrigger value="budget"><Wallet className="w-4 h-4 mr-1.5" />Budget ({budgets.length})</TabsTrigger>
        <TabsTrigger value="capital"><CalendarDays className="w-4 h-4 mr-1.5" />Capital ({capitalItems.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="assets">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {equipment.length === 0 ? (
            <p className="text-sm text-slate-500 p-8 text-center">No assets at this location.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Asset</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Type</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Criticality</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipment.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{e.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{e.type}</td>
                    <td className={`px-4 py-2.5 font-medium ${statusColor[e.status] || 'text-slate-500'}`}>{e.status}</td>
                    <td className="px-4 py-2.5 text-slate-600">{e.criticality || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{e.health_score ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TabsContent>

      <TabsContent value="scans">
        {scans.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">No scans for this location.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scans.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {s.preview_image_url && <img src={s.preview_image_url} alt={s.name} className="w-full h-44 object-cover" />}
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{s.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{s.model_type}</Badge>
                    {s.scan_date && <Badge variant="outline" className="text-xs">{s.scan_date}</Badge>}
                    {s.total_anomalies > 0 && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">{s.total_anomalies} anomalies</Badge>}
                  </div>
                  {s.file_url && (
                    <a href={s.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                      Open Matterport <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="condition">
        {conditionReports.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">No condition reports for this location.</p>
        ) : (
          <div className="space-y-2">
            {conditionReports.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                {r.image_url && <img src={r.image_url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold text-sm text-slate-900">{r.equipment_name || 'Unlinked'}</h4>
                    <Badge className={`text-xs border ${sevColor[r.severity] || sevColor.minor}`}>{r.severity}</Badge>
                    <Badge variant="outline" className="text-xs">{r.anomaly_type}</Badge>
                    {r.ai_confidence && <span className="text-xs text-slate-500">{r.ai_confidence}% confidence</span>}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.ai_description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="budget">
        {budgets.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">No budgets for this location.</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Budget</th>
                  <th className="text-left px-4 py-2.5 font-semibold">FY</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Category</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Allocated</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Spent</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.map(b => {
                  const remaining = (b.allocated_amount || 0) - (b.spent_amount || 0) - (b.committed_amount || 0);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{b.name}</td>
                      <td className="px-4 py-2.5 text-slate-600">{b.fiscal_year}</td>
                      <td className="px-4 py-2.5 text-slate-600">{b.category}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{fmt(b.allocated_amount)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-amber-600">{fmt(b.spent_amount)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-600">{fmt(remaining)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="capital">
        {capitalItems.length === 0 ? (
          <p className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">No capital plan items for this location.</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Asset / Project</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Priority</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Year</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {capitalItems.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-900">{c.equipment_name}</div>
                      {c.rationale && <div className="text-xs text-slate-500 mt-0.5">{c.rationale}</div>}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge className={`text-xs ${c.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : c.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{c.status}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.replacement_year}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{fmt(c.replacement_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}