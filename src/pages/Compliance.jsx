import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ShieldCheck, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ComplianceStats from '@/components/compliance/ComplianceStats';
import RequirementsTable from '@/components/compliance/RequirementsTable';
import DocumentsList from '@/components/compliance/DocumentsList';
import RequirementFormDialog from '@/components/compliance/RequirementFormDialog';

export default function CompliancePage() {
  const [requirements, setRequirements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [r, d] = await Promise.all([
      base44.entities.ComplianceRequirement.list('next_due_date', 200),
      base44.entities.ComplianceDocument.list('-updated_date', 50),
    ]);
    setRequirements(r);
    setDocuments(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = requirements.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return r.compliance_status === 'overdue';
    if (filter === 'due_soon') return r.compliance_status === 'due_soon';
    return r.category === filter;
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'due_soon', label: 'Due soon' },
    { id: 'safety', label: 'Safety' },
    { id: 'fire', label: 'Fire' },
    { id: 'electrical', label: 'Electrical' },
  ];

  return (
    <div className="p-6 max-w-[1480px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-slate-700" /> Compliance & Audit Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Inspection schedules, document expiry tracking, and audit-ready exports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-1" /> Export audit pack
          </Button>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New requirement
          </Button>
        </div>
      </div>

      <ComplianceStats requirements={requirements} documents={documents} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {filters.map(f => (
              <Button
                key={f.id}
                size="sm"
                variant={filter === f.id ? 'default' : 'outline'}
                onClick={() => setFilter(f.id)}
                className="h-8 text-[12px]"
              >
                {f.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">Loading…</div>
          ) : (
            <RequirementsTable
              requirements={filtered}
              onEdit={(r) => { setEditing(r); setFormOpen(true); }}
            />
          )}
        </div>

        <DocumentsList documents={documents} />
      </div>

      <RequirementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        requirement={editing}
        onSaved={load}
      />
    </div>
  );
}