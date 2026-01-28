import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Zap, Home, Heart, GraduationCap, Train, 
  Factory, Truck, Mountain, MoreHorizontal 
} from 'lucide-react';

const INDUSTRIES = [
  { id: 'local_government', name: 'Local Government / Council', icon: Building2, description: 'Roads, parks, public facilities' },
  { id: 'utilities', name: 'Utilities', icon: Zap, description: 'Water, power, gas infrastructure' },
  { id: 'property_management', name: 'Property Management', icon: Home, description: 'Buildings, facilities, real estate' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, description: 'Hospitals, clinics, medical facilities' },
  { id: 'education', name: 'Education', icon: GraduationCap, description: 'Schools, universities, campuses' },
  { id: 'rail_transport', name: 'Rail & Transport', icon: Train, description: 'Rail networks, transit systems' },
  { id: 'manufacturing', name: 'Manufacturing', icon: Factory, description: 'Production facilities, plants' },
  { id: 'logistics', name: 'Logistics & Warehousing', icon: Truck, description: 'Distribution centers, warehouses' },
  { id: 'mining', name: 'Mining & Resources', icon: Mountain, description: 'Mining operations, extraction' },
  { id: 'other', name: 'Other', icon: MoreHorizontal, description: 'Other infrastructure types' },
];

export default function IndustrySelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {INDUSTRIES.map((industry, idx) => {
        const Icon = industry.icon;
        const isSelected = selected === industry.id;
        
        return (
          <motion.button
            key={industry.id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(industry.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              isSelected 
                ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                  {industry.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{industry.description}</p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export { INDUSTRIES };