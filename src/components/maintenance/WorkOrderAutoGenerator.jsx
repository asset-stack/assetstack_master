import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Zap, Brain, User, Package, AlertTriangle, CheckCircle2,
  Loader2, ChevronRight, Clock, DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function WorkOrderAutoGenerator({ 
  source, // { type: 'task' | 'alert' | 'equipment', data: object }
  onClose,
  onSuccess 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const generateWorkOrder = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        source_type: source.type,
        source_id: source.data?.id,
        equipment_id: source.type === 'equipment' ? source.data?.id : source.data?.equipment_id
      };

      const response = await base44.functions.invoke('autoGenerateWorkOrder', payload);
      
      if (response.data.success) {
        setResult(response.data);
        queryClient.invalidateQueries(['workOrders']);
        onSuccess && onSuccess(response.data.workOrder);
      } else {
        setError(response.data.error || 'Failed to generate work order');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate work order');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSourceIcon = () => {
    if (source.type === 'alert') return AlertTriangle;
    if (source.type === 'task') return Clock;
    return Zap;
  };

  const SourceIcon = getSourceIcon();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" />
            Auto-Generate Work Order
          </DialogTitle>
        </DialogHeader>

        {!result && !isGenerating && (
          <div className="space-y-4">
            {/* Source Info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <SourceIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 capitalize">Source: {source.type}</p>
                  <p className="font-medium text-slate-900">{source.data?.title || source.data?.name}</p>
                </div>
              </div>
              {source.data?.priority && (
                <Badge className="mt-2" variant="outline">{source.data.priority} priority</Badge>
              )}
              {source.data?.severity && (
                <Badge className="mt-2 ml-2" variant="outline">{source.data.severity}</Badge>
              )}
            </div>

            {/* What will happen */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">This will automatically:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Create a draft work order with relevant details
                </li>
                <li className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  Suggest the best technician based on skills & availability
                </li>
                <li className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-violet-500" />
                  Pre-fill recommended spare parts
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Calculate estimated costs
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={generateWorkOrder} className="flex-1 bg-violet-600 hover:bg-violet-700">
                <Zap className="w-4 h-4 mr-2" />
                Generate Work Order
              </Button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-violet-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-700 font-medium">Generating work order...</p>
            <p className="text-sm text-slate-500 mt-1">Analyzing data and matching resources</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">Generation Failed</p>
              </div>
              <p className="text-sm text-rose-600 mt-2">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={generateWorkOrder} className="flex-1 bg-violet-600 hover:bg-violet-700">
                Try Again
              </Button>
            </div>
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
                <p className="font-medium">Work Order Created!</p>
              </div>
              <p className="text-sm text-emerald-600">{result.workOrder.work_order_number}</p>
            </div>

            {/* Work Order Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Title</p>
                <p className="font-medium text-slate-900">{result.workOrder.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <Badge variant="outline" className="capitalize">{result.workOrder.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Priority</p>
                  <Badge variant="outline" className="capitalize">{result.workOrder.priority}</Badge>
                </div>
              </div>
            </div>

            {/* Suggested Technician */}
            {result.suggestedTechnician && (
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-indigo-600">Suggested Technician</p>
                    <p className="font-medium text-indigo-900">{result.suggestedTechnician.name}</p>
                    {result.suggestedTechnician.matchScore && (
                      <p className="text-xs text-indigo-600">Match score: {result.suggestedTechnician.matchScore}%</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Parts */}
            {result.suggestedParts?.length > 0 && (
              <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-violet-600" />
                  <p className="text-sm font-medium text-violet-800">Pre-filled Parts ({result.suggestedParts.length})</p>
                </div>
                <div className="space-y-1">
                  {result.suggestedParts.slice(0, 3).map((part, idx) => (
                    <p key={idx} className="text-xs text-violet-700">{part.part_name}</p>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Done
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}