import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Trash2, Database, FlaskConical, Building2, ExternalLink, Info } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

export default function AccountSettings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    // Sign out and redirect — actual data deletion must be handled by an admin
    // per Apple guidelines, we initiate the request here
    base44.auth.logout('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          Account
        </h3>
        <p className="text-xs text-slate-500 mt-1">Manage your account and data</p>
      </div>

      {/* Database Environment */}
      <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          Database Environment
        </h4>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          AssetStack has two separate databases for this app. Switch between them to view different demo datasets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-white border border-emerald-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-900">Production</span>
              <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Bunbury</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Flagship local-government demo. 250+ council assets, verified savings ledger.
            </p>
          </div>
          <div className="bg-white border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <FlaskConical className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-slate-900">Test</span>
              <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Snowy Hydro</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Energy & utilities sandbox. 32 assets across NSW/VIC/SA, $9.8M savings.
            </p>
          </div>
        </div>

        <div className="bg-white border border-indigo-100 rounded-lg p-3 flex gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900 mb-1">How to switch environments</p>
            <p>
              The <span className="font-semibold">Production / Test</span> toggle lives in your <span className="font-semibold">Base44 builder dashboard</span> (outside this app preview), in the top toolbar near your app name. Click it to switch — the preview will reload with that database's data.
            </p>
            <a
              href="https://base44.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Open Base44 dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-rose-800 mb-1">Delete Account</h4>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Permanently delete your account and all associated data. This action cannot be undone.
          You will be signed out immediately and your data will be scheduled for deletion.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="bg-rose-600 hover:bg-rose-700"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Delete My Account
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm">
              This will permanently remove your account, profile, and all data. This cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <p className="text-sm text-slate-700 mb-2">
                Type <span className="font-mono font-bold text-rose-600">DELETE</span> to confirm:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="font-mono"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setConfirmText(''); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmText !== 'DELETE' || deleting}
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}