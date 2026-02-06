import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PendingInvitations() {
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['my-invitations'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      const all = await base44.entities.TeamInvitation.filter({ contractor_email: user.email, status: 'pending' });
      return all;
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ invitation_id, action }) => {
      const response = await base44.functions.invoke('respondToInvitation', { invitation_id, action });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });

  if (isLoading || invitations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-indigo-900">
          {invitations.length} Team Invitation{invitations.length > 1 ? 's' : ''}
        </h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {invitations.map(inv => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg border border-indigo-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  <strong>{inv.invited_by_name}</strong> invited you to join their team
                </p>
                {inv.message && (
                  <p className="text-xs text-slate-500 mt-1 italic">"{inv.message}"</p>
                )}
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(inv.created_date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => respondMutation.mutate({ invitation_id: inv.id, action: 'decline' })}
                  disabled={respondMutation.isPending}
                >
                  {respondMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => respondMutation.mutate({ invitation_id: inv.id, action: 'accept' })}
                  disabled={respondMutation.isPending}
                >
                  {respondMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  Accept
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}