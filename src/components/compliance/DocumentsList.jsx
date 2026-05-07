import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function DocumentsList({ documents }) {
  if (!documents.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
        <span className="text-[11px] text-slate-500">{documents.length}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {documents.map(d => {
          const days = d.expiry_date ? differenceInDays(parseISO(d.expiry_date), new Date()) : null;
          const isExpiring = days !== null && days >= 0 && days <= 60;
          const isExpired = days !== null && days < 0;
          return (
            <div key={d.id} className="px-4 py-3 flex items-center hover:bg-slate-50/60">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 mr-3 shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-900 truncate">{d.name}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="capitalize">{d.document_type?.replace('_', ' ')}</span>
                  {d.expiry_date && (
                    <span className={`flex items-center gap-0.5 ${isExpired ? 'text-rose-600 font-semibold' : isExpiring ? 'text-amber-600 font-semibold' : ''}`}>
                      <Calendar className="w-2.5 h-2.5" />
                      {isExpired ? 'Expired' : `Expires ${format(parseISO(d.expiry_date), 'MMM d, yyyy')}`}
                    </span>
                  )}
                </div>
              </div>
              {d.file_url && (
                <a href={d.file_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700 ml-2">
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}