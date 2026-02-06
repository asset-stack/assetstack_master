import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InviteContractorDialog({ open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sendTeamInvitation', {
        contractor_email: email.trim(),
        message,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setResult({ type: 'success', text: 'Invitation sent! The contractor will receive an email notification.' });
      } else {
        setResult({ type: 'error', text: data.error || 'Failed to send invitation' });
      }
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to send invitation';
      setResult({ type: 'error', text: msg });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(null);
    inviteMutation.mutate();
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Contractor</DialogTitle>
          <DialogDescription>
            Search for a registered contractor by email and send them a team invitation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Contractor Email *</Label>
            <div className="relative mt-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                required
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setResult(null); }}
                placeholder="contractor@company.com"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label>Message (optional)</Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Hi, we'd like you to join our maintenance team..."
              rows={3}
              className="mt-1"
            />
          </div>

          {result && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              result.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {result.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              {result.text}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={inviteMutation.isPending || !email.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}