import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wrench, Search, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SaveToWorkOrderDialog({ open, onClose, workOrders, onSave, currentWorkOrderId }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(currentWorkOrderId || '');

  const filtered = (workOrders || []).filter(wo =>
    wo.title?.toLowerCase().includes(search.toLowerCase()) ||
    wo.work_order_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-indigo-600" />
            Link Chat to Work Order
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 mt-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No work orders found</p>
          ) : (
            filtered.map(wo => (
              <button
                key={wo.id}
                onClick={() => setSelected(wo.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  selected === wo.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                {selected === wo.id && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{wo.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{wo.work_order_number || 'No #'}</span>
                    <Badge variant="secondary" className="text-[10px]">{wo.status}</Badge>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {currentWorkOrderId && (
            <Button variant="outline" size="sm" onClick={() => { onSave(null, null); onClose(); }}>
              Unlink
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={!selected}
            onClick={() => {
              const wo = workOrders.find(w => w.id === selected);
              onSave(wo.id, wo.title);
              onClose();
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}