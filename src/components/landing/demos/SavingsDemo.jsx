import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { CheckCircle2, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ENTRIES = [
  { id: 1, asset: 'Pump #3 bearing', cost: 24800, status: 'verified', method: 'Sensor confirmation' },
  { id: 2, asset: 'Signal Box 12', cost: 87500, status: 'verified', method: 'Post-action inspection' },
  { id: 3, asset: 'HVAC Unit #7', cost: 12300, status: 'projected', method: 'AI prediction' },
  { id: 4, asset: 'Bridge expansion joint', cost: 156000, status: 'verified', method: 'Expert review' },
  { id: 5, asset: 'Water main valve', cost: 8900, status: 'in_progress', method: 'Awaiting outcome' },
];

const QUARTERLY = [
  { q: 'Q1 25', verified: 180000, projected: 60000 },
  { q: 'Q2 25', verified: 320000, projected: 110000 },
  { q: 'Q3 25', verified: 480000, projected: 90000 },
  { q: 'Q4 25', verified: 690000, projected: 140000 },
  { q: 'Q1 26', verified: 730000, projected: 180000 },
];

const STATUS = {
  verified: { icon: CheckCircle2, label: 'Verified', cls: 'bg-emerald-100 text-emerald-700' },
  projected: { icon: AlertCircle, label: 'Projected', cls: 'bg-amber-100 text-amber-700' },
  in_progress: { icon: Clock, label: 'In progress', cls: 'bg-blue-100 text-blue-700' },
};

export default function SavingsDemo() {
  const total = ENTRIES.filter(e => e.status === 'verified').reduce((s, e) => s + e.cost, 0);

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-900">${total.toLocaleString()}</div>
          <div className="text-xs text-emerald-700 mt-1">3 audited interventions</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" /> Projected
          </div>
          <div className="mt-2 text-3xl font-black text-amber-900">$12,300</div>
          <div className="text-xs text-amber-700 mt-1">Awaiting verification</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> In progress
          </div>
          <div className="mt-2 text-3xl font-black text-blue-900">$8,900</div>
          <div className="text-xs text-blue-700 mt-1">Outcome pending</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h4 className="font-bold text-slate-900 mb-4">Quarterly verified savings</h4>
          <div className="h-[240px]">
            <ResponsiveContainer>
              <BarChart data={QUARTERLY} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="q" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v, name) => [`$${v.toLocaleString()}`, name === 'verified' ? 'Verified' : 'Projected']}
                />
                <Bar dataKey="verified" radius={[8, 8, 0, 0]} fill="#10b981" />
                <Bar dataKey="projected" radius={[8, 8, 0, 0]} fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger entries */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h4 className="font-bold text-slate-900 mb-4">Recent ledger entries</h4>
          <div className="space-y-2">
            {ENTRIES.map((e, i) => {
              const meta = STATUS[e.status];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">{e.asset}</div>
                    <div className="text-[11px] text-slate-500">{e.method}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-slate-900">${e.cost.toLocaleString()}</div>
                    <Badge className={`${meta.cls} text-[9px] border-0 mt-0.5`}>
                      <Icon className="w-2.5 h-2.5 mr-1" /> {meta.label}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}