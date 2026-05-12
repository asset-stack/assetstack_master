import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Cpu, Box, AlertTriangle, Wallet, CalendarDays, ShieldCheck, CheckCircle2, Wrench } from 'lucide-react';
import LocationScansTab from './LocationScansTab';
import LocationWorkOrdersTab from './LocationWorkOrdersTab';
import LocationComplianceTab from './LocationComplianceTab';

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
  const equipmentIds = equipment.map(e => e.id);
  const { data: workOrders = [] } = useQuery({
    queryKey: ['wo', location.id, equipmentIds.join(',')],
    queryFn: async () => {
      if (!equipmentIds.length) return [];
      const all = await Promise.all(equipmentIds.map(id => base44.entities.WorkOrder.filter({ equipment_id: id }, '-scheduled_start', 30)));
      return all.flat();
    },
    enabled: equipmentIds.length > 0,
  });
  const { data: complianceDocs = [] } = useQuery({
    queryKey: ['compliance-docs', location.id],
    queryFn: () => base44.entities.ComplianceDocument.filter({ location_id: location.id }, '-issue_date', 50),
  });
  const { data: complianceReqs = [] } = useQuery({
    queryKey: ['compliance-reqs', locName],
    queryFn: async () => {
      // Filter requirements by name containing location identifier (best-effort match)
      const all = await base44.entities.ComplianceRequirement.list('-next_due_date', 100);
      const code = location.code || '';
      const shortName = locName.split(',')[0].split(' - ')[0];
      return all.filter(r => (r.name && (r.name.includes(shortName) || (code && r.name.includes(code)))));
    },
  });
  const equipmentById = Object.fromEntries(equipment.map(e => [e.id, e]));

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

  // Fixed/unfixed breakdown
  const UNFIXED = new Set(['pending', 'approved']);
  const unfixedAssetIds = new Set(conditionReports.filter(r => UNFIXED.has(r.review_status)).map(r => r.equipment_id).filter(Boolean));
  const assetsWithStatus = equipment.map(e => ({ ...e, _fixed: !unfixedAssetIds.has(e.id) }));
  const unfixedCount = assetsWithStatus.filter(a => !a._fixed).length;
  const fixedCount = assetsWithStatus.length - unfixedCount;

  return (
    <Tabs defaultValue="assets" className="w-full">
      <TabsList className="flex w-full overflow-x-auto mb-4 h-auto p-1 justify-start">
        <TabsTrigger value="assets" className="text-xs"><Cpu className="w-3.5 h-3.5 mr-1" />Assets ({equipment.length})</TabsTrigger>
        <TabsTrigger value="scans" className="text-xs"><Box className="w-3.5 h-3.5 mr-1" />Scans ({scans.length})</TabsTrigger>
        <TabsTrigger value="condition" className="text-xs"><AlertTriangle className="w-3.5 h-3.5 mr-1" />Condition ({conditionReports.length})</TabsTrigger>
        <TabsTrigger value="workorders" className="text-xs"><Wrench className="w-3.5 h-3.5 mr-1" />Work Orders ({workOrders.length})</TabsTrigger>
        <TabsTrigger value="compliance" className="text-xs"><ShieldCheck className="w-3.5 h-3.5 mr-1" />Compliance ({complianceDocs.length + complianceReqs.length})</TabsTrigger>
        <TabsTrigger value="budget" className="text-xs"><Wallet className="w-3.5 h-3.5 mr-1" />Budget ({budgets.length})</TabsTrigger>
        <TabsTrigger value="capital" className="text-xs"><CalendarDays className="w-3.5 h-3.5 mr-1" />Capital ({capitalItems.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="assets">
        {/* Fixed/Unfixed summary */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-700" /></div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Fixed</div>
              <div className="text-2xl font-semibold text-emerald-700 tabular-nums leading-none mt-0.5">{fixedCount}</div>
            </div>
          </div>
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg"><AlertTriangle className="w-4 h-4 text-rose-700" /></div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Unfixed</div>
              <div className="text-2xl font-semibold text-rose-700 tabular-nums leading-none mt-0.5">{unfixedCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {equipment.length === 0 ? (
            <p className="text-sm text-slate-500 p-8 text-center">No assets at this location.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Condition</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Asset</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Type</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Criticality</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assetsWithStatus.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      {e._fixed ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Fixed</Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs gap-1"><AlertTriangle className="w-3 h-3" />Unfixed</Badge>
                      )}
                    </td>
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
        <LocationScansTab scans={scans} equipment={equipment} conditionReports={conditionReports} workOrders={workOrders} />
      </TabsContent>

      <TabsContent value="workorders">
        <LocationWorkOrdersTab workOrders={workOrders} equipmentById={equipmentById} />
      </TabsContent>

      <TabsContent value="compliance">
        <LocationComplianceTab documents={complianceDocs} requirements={complianceReqs} />
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
                    <Badge variant="outline" className="text-[10px] text-slate-400">demo data</Badge>
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