import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, ShieldCheck, AlertTriangle } from 'lucide-react';

const docStatusStyle = {
  valid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expiring_soon: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-rose-100 text-rose-700 border-rose-200',
  superseded: 'bg-slate-100 text-slate-600 border-slate-200',
  revoked: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function LocationComplianceTab({ documents, requirements }) {
  if (documents.length === 0 && requirements.length === 0) {
    return <p className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">No compliance items for this location.</p>;
  }

  return (
    <div className="space-y-4">
      {requirements.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Requirements ({requirements.length})
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Requirement</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Regulation</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Frequency</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Next due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requirements.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{r.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono text-xs">{r.regulation}</td>
                    <td className="px-4 py-2.5 text-slate-600 capitalize">{r.frequency}</td>
                    <td className="px-4 py-2.5">
                      <Badge className={`text-xs ${
                        r.compliance_status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                        r.compliance_status === 'due_soon' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {r.compliance_status === 'overdue' && <AlertTriangle className="w-3 h-3 mr-1 inline" />}
                        {r.compliance_status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{r.next_due_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Documents ({documents.length})
          </h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Document</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Type</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Issuing body</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-900">{d.name}</div>
                      {d.reference_number && <div className="text-xs text-slate-500 font-mono mt-0.5">{d.reference_number}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 capitalize">{d.document_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-slate-600">{d.issuing_body || '—'}</td>
                    <td className="px-4 py-2.5">
                      <Badge className={`text-xs border ${docStatusStyle[d.status] || docStatusStyle.valid}`}>
                        {d.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{d.expiry_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}