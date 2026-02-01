import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calculator, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const methodDescriptions = {
  straight_line: "Equal depreciation each year. Best for assets that provide consistent value.",
  declining_balance: "Higher depreciation early, decreasing over time. Good for assets losing value quickly.",
  double_declining: "Aggressive early depreciation at 2x straight-line rate.",
  sum_of_years: "Accelerated method based on remaining useful life fraction.",
  units_of_production: "Based on actual usage/output. Ideal for machinery with variable use."
};

export default function DepreciationCalculator({ open, onClose, equipment, existingRecord, onSave }) {
  const [formData, setFormData] = useState({
    equipment_id: '',
    equipment_name: '',
    acquisition_cost: '',
    acquisition_date: '',
    useful_life_years: '',
    salvage_value: '',
    depreciation_method: 'straight_line',
    declining_balance_rate: 1.5,
    total_units_expected: '',
    units_produced_to_date: 0
  });
  const [calculating, setCalculating] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState(null);

  useEffect(() => {
    if (equipment) {
      setFormData(prev => ({
        ...prev,
        equipment_id: equipment.id,
        equipment_name: equipment.name,
        acquisition_date: equipment.installation_date || ''
      }));
    }
    if (existingRecord) {
      setFormData({
        equipment_id: existingRecord.equipment_id,
        equipment_name: existingRecord.equipment_name,
        acquisition_cost: existingRecord.acquisition_cost,
        acquisition_date: existingRecord.acquisition_date,
        useful_life_years: existingRecord.useful_life_years,
        salvage_value: existingRecord.salvage_value,
        depreciation_method: existingRecord.depreciation_method,
        declining_balance_rate: existingRecord.declining_balance_rate || 1.5,
        total_units_expected: existingRecord.total_units_expected || '',
        units_produced_to_date: existingRecord.units_produced_to_date || 0
      });
    }
  }, [equipment, existingRecord]);

  const calculateDepreciation = () => {
    setCalculating(true);
    
    const cost = parseFloat(formData.acquisition_cost);
    const salvage = parseFloat(formData.salvage_value) || 0;
    const years = parseInt(formData.useful_life_years);
    const depreciableAmount = cost - salvage;
    
    let schedule = [];
    let annualDepreciation = 0;
    
    switch (formData.depreciation_method) {
      case 'straight_line':
        annualDepreciation = depreciableAmount / years;
        for (let i = 1; i <= years; i++) {
          const accum = annualDepreciation * i;
          schedule.push({
            year: i,
            period_depreciation: annualDepreciation,
            accumulated_depreciation: Math.min(accum, depreciableAmount),
            book_value: Math.max(cost - accum, salvage)
          });
        }
        break;
        
      case 'declining_balance':
      case 'double_declining':
        const rate = formData.depreciation_method === 'double_declining' ? 2 / years : formData.declining_balance_rate / years;
        let bookValue = cost;
        let totalAccum = 0;
        for (let i = 1; i <= years; i++) {
          let yearDep = bookValue * rate;
          if (bookValue - yearDep < salvage) {
            yearDep = bookValue - salvage;
          }
          totalAccum += yearDep;
          bookValue -= yearDep;
          schedule.push({
            year: i,
            period_depreciation: yearDep,
            accumulated_depreciation: totalAccum,
            book_value: bookValue
          });
          if (bookValue <= salvage) break;
        }
        annualDepreciation = schedule[0]?.period_depreciation || 0;
        break;
        
      case 'sum_of_years':
        const sumOfYears = (years * (years + 1)) / 2;
        let soyAccum = 0;
        for (let i = 1; i <= years; i++) {
          const fraction = (years - i + 1) / sumOfYears;
          const yearDep = depreciableAmount * fraction;
          soyAccum += yearDep;
          schedule.push({
            year: i,
            period_depreciation: yearDep,
            accumulated_depreciation: soyAccum,
            book_value: cost - soyAccum
          });
        }
        annualDepreciation = schedule[0]?.period_depreciation || 0;
        break;
        
      case 'units_of_production':
        const totalUnits = parseFloat(formData.total_units_expected) || 1;
        const unitRate = depreciableAmount / totalUnits;
        const unitsProduced = parseFloat(formData.units_produced_to_date) || 0;
        const currentDep = unitRate * unitsProduced;
        annualDepreciation = unitRate * (totalUnits / years);
        schedule.push({
          year: 1,
          period_depreciation: currentDep,
          accumulated_depreciation: currentDep,
          book_value: cost - currentDep
        });
        break;
    }
    
    const currentYear = new Date().getFullYear();
    const acquisitionYear = new Date(formData.acquisition_date).getFullYear();
    const yearsElapsed = Math.max(0, currentYear - acquisitionYear);
    const currentScheduleEntry = schedule[Math.min(yearsElapsed, schedule.length - 1)] || schedule[0];
    
    setCalculatedResult({
      annual_depreciation: annualDepreciation,
      monthly_depreciation: annualDepreciation / 12,
      current_book_value: currentScheduleEntry?.book_value || cost,
      accumulated_depreciation: currentScheduleEntry?.accumulated_depreciation || 0,
      depreciation_schedule: schedule,
      status: currentScheduleEntry?.book_value <= (salvage + 0.01) ? 'fully_depreciated' : 'active'
    });
    
    setCalculating(false);
  };

  const getAISuggestion = async () => {
    setAiSuggesting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this asset and recommend the best depreciation method:
        
Asset: ${formData.equipment_name || equipment?.name}
Type: ${equipment?.type}
Acquisition Cost: $${formData.acquisition_cost}
Industry typical usage: ${equipment?.operating_hours ? 'High usage with ' + equipment.operating_hours + ' operating hours' : 'Standard usage'}

Consider:
1. Asset type and typical wear patterns
2. Industry standards
3. Tax optimization
4. Matching expense with revenue generation

Recommend the best depreciation method and useful life.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_method: { type: "string", enum: ["straight_line", "declining_balance", "double_declining", "sum_of_years", "units_of_production"] },
            recommended_useful_life: { type: "number" },
            recommended_salvage_percent: { type: "number" },
            reasoning: { type: "string" }
          }
        }
      });
      
      if (result.recommended_method) {
        setFormData(prev => ({
          ...prev,
          depreciation_method: result.recommended_method,
          useful_life_years: result.recommended_useful_life || prev.useful_life_years,
          salvage_value: prev.acquisition_cost ? (parseFloat(prev.acquisition_cost) * (result.recommended_salvage_percent || 10) / 100) : prev.salvage_value
        }));
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
    }
    setAiSuggesting(false);
  };

  const handleSave = async () => {
    if (!calculatedResult) {
      calculateDepreciation();
      return;
    }
    
    const data = {
      ...formData,
      acquisition_cost: parseFloat(formData.acquisition_cost),
      salvage_value: parseFloat(formData.salvage_value) || 0,
      useful_life_years: parseInt(formData.useful_life_years),
      declining_balance_rate: parseFloat(formData.declining_balance_rate) || 1.5,
      total_units_expected: parseFloat(formData.total_units_expected) || null,
      units_produced_to_date: parseFloat(formData.units_produced_to_date) || 0,
      ...calculatedResult,
      last_calculated: new Date().toISOString()
    };
    
    await onSave(data, existingRecord?.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            {existingRecord ? 'Edit' : 'Configure'} Depreciation - {formData.equipment_name || equipment?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* AI Suggestion Button */}
          <Button
            variant="outline"
            onClick={getAISuggestion}
            disabled={aiSuggesting || !formData.acquisition_cost}
            className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            {aiSuggesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Get AI Recommendation
          </Button>
          
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Acquisition Cost ($)</Label>
              <Input
                type="number"
                value={formData.acquisition_cost}
                onChange={(e) => setFormData({ ...formData, acquisition_cost: e.target.value })}
                placeholder="50000"
              />
            </div>
            <div>
              <Label>Acquisition Date</Label>
              <Input
                type="date"
                value={formData.acquisition_date}
                onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Useful Life (Years)</Label>
              <Input
                type="number"
                value={formData.useful_life_years}
                onChange={(e) => setFormData({ ...formData, useful_life_years: e.target.value })}
                placeholder="10"
              />
            </div>
            <div>
              <Label>Salvage Value ($)</Label>
              <Input
                type="number"
                value={formData.salvage_value}
                onChange={(e) => setFormData({ ...formData, salvage_value: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>
          
          {/* Depreciation Method */}
          <div>
            <Label>Depreciation Method</Label>
            <Select
              value={formData.depreciation_method}
              onValueChange={(value) => setFormData({ ...formData, depreciation_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight_line">Straight-Line</SelectItem>
                <SelectItem value="declining_balance">Declining Balance</SelectItem>
                <SelectItem value="double_declining">Double Declining Balance</SelectItem>
                <SelectItem value="sum_of_years">Sum-of-Years' Digits</SelectItem>
                <SelectItem value="units_of_production">Units of Production</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {methodDescriptions[formData.depreciation_method]}
            </p>
          </div>
          
          {/* Method-specific fields */}
          {formData.depreciation_method === 'declining_balance' && (
            <div>
              <Label>Declining Balance Rate</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.declining_balance_rate}
                onChange={(e) => setFormData({ ...formData, declining_balance_rate: e.target.value })}
                placeholder="1.5"
              />
            </div>
          )}
          
          {formData.depreciation_method === 'units_of_production' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Expected Units</Label>
                <Input
                  type="number"
                  value={formData.total_units_expected}
                  onChange={(e) => setFormData({ ...formData, total_units_expected: e.target.value })}
                  placeholder="100000"
                />
              </div>
              <div>
                <Label>Units Produced to Date</Label>
                <Input
                  type="number"
                  value={formData.units_produced_to_date}
                  onChange={(e) => setFormData({ ...formData, units_produced_to_date: e.target.value })}
                  placeholder="25000"
                />
              </div>
            </div>
          )}
          
          {/* Calculate Button */}
          <Button
            onClick={calculateDepreciation}
            disabled={!formData.acquisition_cost || !formData.useful_life_years}
            className="w-full"
          >
            {calculating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
            Calculate Depreciation
          </Button>
          
          {/* Results Preview */}
          {calculatedResult && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-slate-900">Calculation Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Annual Depreciation</p>
                  <p className="font-semibold text-lg">${calculatedResult.annual_depreciation.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-slate-500">Monthly Depreciation</p>
                  <p className="font-semibold text-lg">${calculatedResult.monthly_depreciation.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-slate-500">Current Book Value</p>
                  <p className="font-semibold text-lg">${calculatedResult.current_book_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-slate-500">Accumulated Depreciation</p>
                  <p className="font-semibold text-lg">${calculatedResult.accumulated_depreciation.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!calculatedResult}>
            Save Depreciation Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}