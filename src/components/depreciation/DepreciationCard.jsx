import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Calendar, DollarSign, Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const methodLabels = {
  straight_line: 'Straight-Line',
  declining_balance: 'Declining Balance',
  double_declining: 'Double Declining',
  sum_of_years: 'Sum-of-Years',
  units_of_production: 'Units of Production'
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  fully_depreciated: { label: 'Fully Depreciated', color: 'bg-slate-100 text-slate-700' },
  disposed: { label: 'Disposed', color: 'bg-red-100 text-red-700' },
  impaired: { label: 'Impaired', color: 'bg-amber-100 text-amber-700' }
};

export default function DepreciationCard({ record, onEdit, onViewSchedule }) {
  const depreciationProgress = record.acquisition_cost > 0 
    ? ((record.accumulated_depreciation || 0) / (record.acquisition_cost - (record.salvage_value || 0))) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">{record.equipment_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {methodLabels[record.depreciation_method] || record.depreciation_method}
                </Badge>
                <Badge className={statusConfig[record.status]?.color || statusConfig.active.color}>
                  {statusConfig[record.status]?.label || 'Active'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onViewSchedule(record)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Acquisition Cost
              </p>
              <p className="font-semibold">${record.acquisition_cost?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Book Value
              </p>
              <p className="font-semibold text-indigo-600">${record.current_book_value?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Useful Life
              </p>
              <p className="font-semibold">{record.useful_life_years} years</p>
            </div>
            <div>
              <p className="text-slate-500">Annual Depreciation</p>
              <p className="font-semibold text-amber-600">${record.annual_depreciation?.toLocaleString()}</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Depreciation Progress</span>
              <span>{Math.min(depreciationProgress, 100).toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(depreciationProgress, 100)} className="h-2" />
          </div>
          
          {record.acquisition_date && (
            <p className="text-xs text-slate-400 mt-3">
              Acquired: {new Date(record.acquisition_date).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}