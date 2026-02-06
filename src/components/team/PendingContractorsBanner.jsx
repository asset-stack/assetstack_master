import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle2, XCircle, Building2, Mail, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PendingContractorsBanner({ technicians }) {
  const queryClient = useQueryClient();
  const pending = technicians.filter(t => t.approval_status === 'pending');

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Technician.update(id, { 
      approval_status: status,
      availability_status: status === 'approved' ? 'available' : 'unavailable',
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['technicians'] }),
  });

  if (pending.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-amber-900">
          {pending.length} Pending Contractor Registration{pending.length > 1 ? 's' : ''}
        </h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {pending.map(tech => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg border border-amber-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">{tech.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900 truncate">{tech.name}</span>
                    {tech.company_name && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        <Building2 className="w-2.5 h-2.5 mr-1" />{tech.company_name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{tech.email}</span>
                    {tech.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{tech.phone}</span>}
                  </div>
                  {tech.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tech.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-600">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => updateMutation.mutate({ id: tech.id, status: 'rejected' })}
                  disabled={updateMutation.isPending}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateMutation.mutate({ id: tech.id, status: 'approved' })}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}