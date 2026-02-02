import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Brain, Search, Wrench, Calendar, CheckCircle2, Loader2,
  AlertTriangle, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FOLLOW_UP_TYPES = [
  { 
    id: 'inspection', 
    label: 'Follow-up Inspection', 
    icon: Search, 
    description: 'Schedule inspection to verify repairs',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  { 
    id: 'preventive', 
    label: 'Next Preventive Maintenance', 
    icon: Calendar, 
    description: 'Schedule next PM cycle',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  },
  { 
    id: 'corrective', 
    label: 'Additional Corrective Work', 
    icon: Wrench, 
    description: 'Additional repairs needed',
    color: 'bg-amber-50 border-amber-200 text-amber-700'
  },
  { 
    id: 'ai_recommended', 
    label: 'AI Recommendation', 
    icon: Brain, 
    description: 'Let AI analyze and recommend',
    color: 'bg-violet-50 border-violet-200 text-violet-700'
  }
];

export default function FollowUpWorkOrderDialog({ 
  completedWorkOrder, 
  onClose,
  onSuccess 
}) {
  const [selectedType, setSelectedType] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!selectedType) return;
    
    setIsCreating(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('createFollowUpWorkOrder', {
        completed_work_order_id: completedWorkOrder.id,
        follow_up_type: selectedType,
        custom_title: customTitle || null,
        custom_description: customDescription || null
      });

      if (response.data.success) {
        setResult(response.data);
        queryClient.invalidateQueries(['workOrders']);
        onSuccess && onSuccess(response.data.followUpWorkOrder);
      } else {
        setError(response.data.error || 'Failed to create follow-up');
      }
    } catch (err) {
      setError(err.message || 'Failed to create follow-up work order');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 max-w-xl" aria-describedby="followup-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Create Follow-up Work Order
          </DialogTitle>
          <p id="followup-description" className="text-sm text-slate-500 mt-1">Create a follow-up work order for additional maintenance or inspection.</p>
        </DialogHeader>

        {!result && !isCreating && (
          <div className="space-y-4">
            {/* Parent Work Order Info */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">Completed Work Order</p>
              <p className="font-medium text-slate-900">{completedWorkOrder.title}</p>
              <p className="text-xs text-slate-500 mt-1">{completedWorkOrder.work_order_number}</p>
            </div>

            {/* Follow-up notes if any */}
            {completedWorkOrder.follow_up_notes && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">Follow-up Notes:</p>
                <p className="text-sm text-amber-800 mt-1">{completedWorkOrder.follow_up_notes}</p>
              </div>
            )}

            {/* Follow-up Type Selection */}
            <div>
              <Label className="text-slate-700 mb-2 block">Select Follow-up Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {FOLLOW_UP_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto" />}
                      </div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Title/Description (optional) */}
            {selectedType && selectedType !== 'ai_recommended' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div>
                  <Label className="text-slate-700">Custom Title (optional)</Label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                    className="bg-white border-slate-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Custom Description (optional)</Label>
                  <Textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                    className="bg-white border-slate-200 mt-1"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={!selectedType}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Create Follow-up
              </Button>
            </div>
          </div>
        )}

        {isCreating && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-700 font-medium">Creating follow-up work order...</p>
            {selectedType === 'ai_recommended' && (
              <p className="text-sm text-slate-500 mt-1">AI is analyzing equipment history...</p>
            )}
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-medium">Follow-up Work Order Created!</p>
              </div>
              <p className="text-sm text-emerald-600">{result.followUpWorkOrder.work_order_number}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Title</p>
                <p className="font-medium text-slate-900">{result.followUpWorkOrder.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Description</p>
                <p className="text-sm text-slate-700">{result.followUpWorkOrder.description?.slice(0, 150)}...</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">{result.followUpWorkOrder.type}</Badge>
                <Badge variant="outline" className="capitalize">{result.followUpWorkOrder.priority}</Badge>
              </div>
              {result.followUpWorkOrder.scheduled_start && (
                <div>
                  <p className="text-xs text-slate-500">Scheduled</p>
                  <p className="text-sm text-slate-700">
                    {new Date(result.followUpWorkOrder.scheduled_start).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <Button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Done
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}