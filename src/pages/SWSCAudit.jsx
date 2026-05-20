import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Play, Wrench, AlertTriangle, CheckCircle2, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import SWSCAuditSummary from '@/components/swsc-audit/SWSCAuditSummary';
import SWSCMismatchList from '@/components/swsc-audit/SWSCMismatchList';
import SWSCMissingList from '@/components/swsc-audit/SWSCMissingList';
import SWSCExtraList from '@/components/swsc-audit/SWSCExtraList';

export default function SWSCAudit() {
  const [auditing, setAuditing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [report, setReport] = useState(null);

  const runAudit = async () => {
    setAuditing(true);
    try {
      const res = await base44.functions.invoke('auditSWSCAssets', { action: 'audit' });
      setReport(res.data);
      toast.success('Audit complete');
    } catch (e) {
      toast.error(`Audit failed: ${e.message}`);
    } finally {
      setAuditing(false);
    }
  };

  const runFix = async () => {
    if (!confirm('Apply spreadsheet values to all mismatched SWSC assets? This updates condition, criticality, baselife, price, and level of service. Up to 200 records per run.')) return;
    setFixing(true);
    try {
      const res = await base44.functions.invoke('auditSWSCAssets', { action: 'fix', max_updates: 200 });
      toast.success(`Fixed ${res.data?.actions?.updated_count || 0} record(s), created ${res.data?.actions?.created_count || 0}`);
      // Re-run audit to refresh
      await runAudit();
    } catch (e) {
      toast.error(`Fix failed: ${e.message}`);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            SWSC Asset Audit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconcile the 2025 Bunbury Condition spreadsheet (760 rows, BLD 1941) against current SWSC equipment records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAudit} disabled={auditing || fixing} variant="outline">
            {auditing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run audit
          </Button>
          {report && (report.summary.field_mismatches_count > 0 || report.summary.missing_in_db_count > 0) && (
            <Button onClick={runFix} disabled={auditing || fixing} className="bg-emerald-600 hover:bg-emerald-700">
              {fixing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
              Apply fixes (200/run)
            </Button>
          )}
        </div>
      </div>

      {!report && !auditing && (
        <Card className="p-10 text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">Ready to audit</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Click "Run audit" to compare 760 spreadsheet rows against your SWSC equipment.
          </p>
          <Button onClick={runAudit} className="bg-indigo-600 hover:bg-indigo-700">
            <Play className="w-4 h-4 mr-2" /> Start audit
          </Button>
        </Card>
      )}

      {auditing && !report && (
        <Card className="p-10 text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-500">Downloading spreadsheet and comparing 760 rows…</p>
        </Card>
      )}

      {report && (
        <>
          <SWSCAuditSummary summary={report.summary} />

          <Tabs defaultValue="mismatches" className="mt-6">
            <TabsList>
              <TabsTrigger value="mismatches">
                Field mismatches
                <Badge variant="outline" className="ml-2">{report.summary.field_mismatches_count}</Badge>
              </TabsTrigger>
              <TabsTrigger value="missing">
                Missing
                <Badge variant="outline" className="ml-2">{report.summary.missing_in_db_count}</Badge>
              </TabsTrigger>
              <TabsTrigger value="extras">
                Extras (DB only)
                <Badge variant="outline" className="ml-2">{report.summary.extra_in_db_count}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mismatches" className="mt-4">
              <SWSCMismatchList items={report.field_mismatches} />
            </TabsContent>
            <TabsContent value="missing" className="mt-4">
              <SWSCMissingList items={report.missing_in_db} />
            </TabsContent>
            <TabsContent value="extras" className="mt-4">
              <SWSCExtraList items={report.extra_in_db} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}