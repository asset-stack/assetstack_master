import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Save, Loader2 } from 'lucide-react';

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export default function AvailabilityScheduler({ technician, onUpdate }) {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [status, setStatus] = useState('available');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (technician) {
      setSchedule(technician.preferred_schedule || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      });
      setStatus(technician.availability_status || 'available');
    }
  }, [technician]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Technician.update(technician.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTechnician'] });
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      setHasChanges(false);
      onUpdate?.();
    },
  });

  const toggleDay = (day) => {
    setSchedule(prev => ({ ...prev, [day]: !prev[day] }));
    setHasChanges(true);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      preferred_schedule: schedule,
      availability_status: status,
    });
  };

  const statusColors = {
    available: 'bg-emerald-500',
    busy: 'bg-amber-500',
    on_leave: 'bg-slate-400',
    unavailable: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Availability
        </h3>
        {hasChanges && (
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Save
          </Button>
        )}
      </div>

      {/* Status Selector */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-500 mb-2 block">Current Status</label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Available for work
              </div>
            </SelectItem>
            <SelectItem value="busy">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Busy (limited availability)
              </div>
            </SelectItem>
            <SelectItem value="on_leave">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                On leave
              </div>
            </SelectItem>
            <SelectItem value="unavailable">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Unavailable
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Weekly Schedule */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block flex items-center gap-1">
          <Clock className="w-3 h-3" /> Preferred Working Days
        </label>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleDay(key)}
              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                schedule[key]
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Click days to toggle availability. Employers will see your schedule when assigning jobs.
        </p>
      </div>
    </div>
  );
}