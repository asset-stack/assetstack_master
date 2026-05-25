import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { secureEntity } from '@/lib/secureEntities';
import { AlertOctagon, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { deriveDefectUrgency, deriveCRC, deriveCondition, fmtMoney } from '@/lib/assetMetrics';
import FinanceNav from '@/components/finance/FinanceNav';
import FinanceHeader from '@/components/finance/FinanceHeader';
import { exportFinanceCSV } from '@/components/finance/exportFinanceCSV';
import { Download } from 'lucide-react';

const URGENCY_RANK = { High: 0, Medium: 1, Low: 2 };

export default function DefectBacklog() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment-all-defects'],
    queryFn: async () => {
      const all = [];
      for (let page = 0; page < 20; page++) {
        const batch = await secureEntity('Equipment').list('-created_date', 500, page * 500);
        if (!batch?.length) break;
        all.push(...batch);
        if (batch.length < 500) break;
      }
      return all;
    },
  });

  const defects = useMemo(() => {
    return equipment
      .map((e) => {
        const urgency = deriveDefectUrgency(e);
        const action = e?.specifications?.action;
        const description = e?.specifications?.description;
        const cost = Number(e?.specifications?.defect_cost) || 0;
        const responseYear = e?.specifications?.defect_response_year;
        if (!urgency && !action && !description) return null;
        return { eq: e, urgency, action, description, cost, responseYear };
      })
      .filter(Boolean)
      .sort((a, b) => (URGENCY_RANK[a.urgency] ?? 9) - (URGENCY_RANK[b.urgency] ?? 9));
  }, [equipment]);

  const filtered = defects.filter((d) => {
    if (filter !== 'all' && d.urgency !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        d.eq.name?.toLowerCase().includes(s) ||
        d.eq.location?.toLowerCase().includes(s) ||
        d.action?.toLowerCase().includes(s) ||
        d.description?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totals = useMemo(() => {
    const t = { count: 0, value: 0, high: 0, medium: 0, low: 0 };
    for (const d of defects) {
      t.count++;
      t.value += d.cost || deriveCRC(d.eq) * 0.2;
      if (d.urgency === 'High') t.high++;
      else if (d.urgency === 'Medium') t.medium++;
      else if (d.urgency === 'Low') t.low++;
    }
    return t;
  }, [defects]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-6">
        <FinanceHeader
          icon={AlertOctagon}
          title="Defect Backlog"
          subtitle="Outstanding defects across the portfolio, ranked by urgency"
          accent="rose"
          actions={
            <Button
              variant="outline"
              onClick={() => {
                const rows = filtered.map((d) => ({
                  Asset: d.eq.name,
                  Location: d.eq.location,
                  Condition: deriveCondition(d.eq) ? `C${deriveCondition(d.eq)}` : '',
                  Urgency: d.urgency || '',
                  Action: d.action || '',
                  Description: d.description || '',
                  EstimatedCost: d.cost || deriveCRC(d.eq) * 0.2,
                }));
                exportFinanceCSV(`defect-backlog-${Date.now()}.csv`, rows);
              }}
              className="h-10"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          }
        />

        <FinanceNav />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Defects', value: totals.count, color: 'bg-slate-50 text-slate-700' },
            { label: 'High Urgency', value: totals.high, color: 'bg-rose-50 text-rose-700' },
            { label: 'Medium Urgency', value: totals.medium, color: 'bg-amber-50 text-amber-700' },
            { label: 'Estimated Cost', value: fmtMoney(totals.value), color: 'bg-indigo-50 text-indigo-700' },
          ].map((t) => (
            <div key={t.label} className={`rounded-xl p-4 border border-slate-200/50 ${t.color}`}>
              <p className="text-2xl font-bold tabular-nums">{t.value}</p>
              <p className="text-xs">{t.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search defects..." className="pl-9 bg-slate-50 border-slate-200 h-10" />
          </div>
          {['all', 'High', 'Medium', 'Low'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-indigo-600 hover:bg-indigo-700 h-9' : 'h-9'}
            >
              {f === 'all' ? 'All' : f}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading…
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Asset</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Action / Description</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => {
                  const grade = deriveCondition(d.eq);
                  return (
                    <TableRow key={d.eq.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{d.eq.name}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{d.eq.location}</TableCell>
                      <TableCell>{grade ? <Badge variant="outline">C{grade}</Badge> : <span className="text-slate-400 text-xs">—</span>}</TableCell>
                      <TableCell>
                        {d.urgency ? (
                          <Badge className={
                            d.urgency === 'High' ? 'bg-rose-100 text-rose-700 border-0'
                            : d.urgency === 'Medium' ? 'bg-amber-100 text-amber-700 border-0'
                            : 'bg-slate-100 text-slate-700 border-0'
                          }>{d.urgency}</Badge>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-md">
                        {d.action && <div className="font-medium text-slate-800">{d.action}</div>}
                        {d.description && <div className="text-slate-500 truncate">{d.description}</div>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-900 font-medium">
                        {fmtMoney(d.cost || deriveCRC(d.eq) * 0.2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                      No defects match the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}