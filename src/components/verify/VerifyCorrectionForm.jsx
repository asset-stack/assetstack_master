import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3 } from 'lucide-react';

const ANOMALY_TYPES = [
  'scratch', 'dent', 'crack', 'corrosion', 'stain',
  'broken_part', 'missing_part', 'wear', 'water_damage',
  'graffiti', 'misalignment', 'other'
];
const SEVERITIES = ['minor', 'moderate', 'major', 'critical'];

export default function VerifyCorrectionForm({ type, severity, onTypeChange, onSeverityChange }) {
  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
      <div className="text-xs font-semibold text-amber-900 flex items-center gap-1">
        <Edit3 className="w-3.5 h-3.5" /> Correct the AI before saving
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANOMALY_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-xs capitalize">
                {t.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={onSeverityChange}>
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}