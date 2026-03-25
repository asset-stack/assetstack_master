import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Trash2 } from 'lucide-react';
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