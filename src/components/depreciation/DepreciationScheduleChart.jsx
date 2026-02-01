import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from 'lucide-react';

export default function DepreciationScheduleChart({ schedule, acquisitionCost, salvageValue }) {
  if (!schedule || schedule.length === 0) return null;

  const chartData = schedule.map(item => ({
    ...item,
    book_value: item.book_value,
    period_depreciation: item.period_depreciation,
    accumulated_depreciation: item.accumulated_depreciation
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-indigo-600" />
          Depreciation Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="book_value" 
                fill="#c7d2fe" 
                stroke="#6366f1" 
                name="Book Value"
              />
              <Bar 
                dataKey="period_depreciation" 
                fill="#f59e0b" 
                name="Period Depreciation"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="accumulated_depreciation" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                name="Accumulated Depreciation"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Schedule Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 font-medium text-slate-600">Year</th>
                <th className="text-right py-2 px-2 font-medium text-slate-600">Depreciation</th>
                <th className="text-right py-2 px-2 font-medium text-slate-600">Accumulated</th>
                <th className="text-right py-2 px-2 font-medium text-slate-600">Book Value</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-2">{item.year}</td>
                  <td className="py-2 px-2 text-right">${item.period_depreciation.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="py-2 px-2 text-right">${item.accumulated_depreciation.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="py-2 px-2 text-right font-medium">${item.book_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}