import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Send, Star, Users, Zap, Shield, Target, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const CATEGORY_CONFIG = {
  great_work: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Great Work' },
  team_player: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Team Player' },
  problem_solver: { icon: Target, color: 'text-violet-500', bg: 'bg-violet-50', label: 'Problem Solver' },
  safety_champion: { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Safety Champion' },
  efficiency_expert: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Efficiency Expert' },
  mentor: { icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Mentor' },
};

export default function KudosSection({ kudos, technician, technicians, isOwnProfile }) {
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ message: '', category: 'great_work' });
  const queryClient = useQueryClient();

  const sendKudos = useMutation({
    mutationFn: (data) => base44.entities.KudosMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['kudos']);
      setShowDialog(false);
      setForm({ message: '', category: 'great_work' });
    },
  });

  const handleSend = async () => {
    if (!form.message.trim()) return;
    const currentUser = technicians?.find(t => t.email);
    await sendKudos.mutateAsync({
      to_technician_id: technician.id,
      to_name: technician.name,
      from_name: currentUser?.name || 'A colleague',
      message: form.message,
      category: form.category,
      is_public: true,
    });
  };

  const received = kudos.filter(k => k.to_technician_id === technician.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 rounded-lg">
            <Heart className="w-4 h-4 text-pink-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Recognition</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{received.length} kudos</span>
        </div>
        {!isOwnProfile && (
          <Button size="sm" onClick={() => setShowDialog(true)} className="bg-pink-600 hover:bg-pink-700">
            <Send className="w-3.5 h-3.5 mr-1" /> Give Kudos
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {received.slice(0, 6).map((k, i) => {
          const cat = CATEGORY_CONFIG[k.category] || CATEGORY_CONFIG.great_work;
          const CatIcon = cat.icon;
          return (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-gradient-to-r from-pink-50/30 to-transparent"
            >
              <div className={`w-9 h-9 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                <CatIcon className={`w-4 h-4 ${cat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{k.from_name || 'Anonymous'}</span>
                  <span className="text-xs text-slate-400">{k.created_date ? format(new Date(k.created_date), 'MMM d') : ''}</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{k.message}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${cat.color}`}>
                  <CatIcon className="w-3 h-3" /> {cat.label}
                </span>
              </div>
            </motion.div>
          );
        })}
        {received.length === 0 && (
          <div className="text-center py-6 text-slate-400">
            <Heart className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No kudos yet</p>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Kudos to {technician.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <val.icon className={`w-4 h-4 ${val.color}`} />
                      {val.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Write a message of recognition..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
            />
            <Button onClick={handleSend} disabled={!form.message.trim() || sendKudos.isPending} className="w-full bg-pink-600 hover:bg-pink-700">
              <Send className="w-4 h-4 mr-2" /> Send Kudos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}