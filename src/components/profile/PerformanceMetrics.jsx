import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, Target, TrendingUp, DollarSign, Zap,
  Award, Star
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl">
        <p className="text-slate-500 text-xs mb-1 font-medium">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-medium text-slate-700">
              {entry.name}: <span className="text-slate-900">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformanceMetrics({ technician, tasks, workOrders }) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  const ftfr = technician.first_time_fix_rate || 0;
  const onTimeRate = technician.on_time_completion_rate || 0;
  const perfRating = technician.performance_rating || 0;
  const avgTime = technician.average_task_completion_time || 0;
  const savings = technician.total_cost_savings || 0;

  // Monthly trend (simulated based on data)
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const monthlyTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    tasks: Math.floor(seededRandom(i * 3.2 + (technician.id?.charCodeAt(0) || 0)) * 12) + 3,
    rating: Math.floor(seededRandom(i * 2.1 + (technician.id?.charCodeAt(1) || 0)) * 20) + 75,
  }));

  const metrics = [
    { label: 'Tasks Completed', value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'First Time Fix', value: `${ftfr}%`, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'On-Time Rate', value: `${onTimeRate}%`, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Avg Time', value: `${avgTime}h`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Cost Savings', value: `$${savings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Performance Score</h3>
        </div>
        <div className="flex items-center gap-8">
          <div className="h-[160px] w-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="70%" outerRadius="95%"
                data={[{ value: perfRating, fill: perfRating >= 80 ? '#10b981' : perfRating >= 60 ? '#f59e0b' : '#ef4444' }]}
                startAngle={90} endAngle={-270}
              >
                <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{perfRating}</p>
                <p className="text-xs text-slate-500">/100</p>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {metrics.slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${m.bg}`}>
                  <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className="text-sm font-semibold text-slate-900">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mx-auto mb-2`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-lg font-bold text-slate-900">{m.value}</p>
            <p className="text-xs text-slate-500">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-4">Monthly Performance Trend</h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="tasks" stroke="#3b82f6" fill="url(#taskGrad)" strokeWidth={2} name="Tasks" />
              <Area type="monotone" dataKey="rating" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="Rating" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}