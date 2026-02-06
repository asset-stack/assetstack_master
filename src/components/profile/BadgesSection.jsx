import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Zap, Clock, Shield, Star, Target, 
  Flame, Heart, TrendingUp, CheckCircle2
} from 'lucide-react';

const ALL_BADGES = [
  { id: 'first_task', name: 'First Task', desc: 'Completed your first task', icon: CheckCircle2, color: 'from-blue-400 to-blue-600' },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Completed 5 tasks ahead of schedule', icon: Zap, color: 'from-amber-400 to-amber-600' },
  { id: 'reliable', name: 'Reliable', desc: '90%+ on-time completion rate', icon: Clock, color: 'from-emerald-400 to-emerald-600' },
  { id: 'top_performer', name: 'Top Performer', desc: 'Performance rating above 90', icon: Star, color: 'from-violet-400 to-violet-600' },
  { id: 'problem_solver', name: 'Problem Solver', desc: '95%+ first-time fix rate', icon: Target, color: 'from-rose-400 to-rose-600' },
  { id: 'veteran', name: 'Veteran', desc: 'Completed 50+ tasks', icon: Shield, color: 'from-slate-400 to-slate-600' },
  { id: 'streak', name: 'Hot Streak', desc: '10 tasks in a row without issues', icon: Flame, color: 'from-orange-400 to-orange-600' },
  { id: 'team_player', name: 'Team Player', desc: 'Received 5+ kudos from peers', icon: Heart, color: 'from-pink-400 to-pink-600' },
  { id: 'rising_star', name: 'Rising Star', desc: 'Improved performance by 20% in a month', icon: TrendingUp, color: 'from-cyan-400 to-cyan-600' },
  { id: 'excellence', name: 'Excellence', desc: 'Maintained 95+ rating for 3 months', icon: Award, color: 'from-indigo-400 to-indigo-600' },
];

export default function BadgesSection({ technician, kudosCount = 0 }) {
  // Calculate which badges are earned
  const earnedBadges = new Set(technician.badges || []);
  
  // Auto-detect badges based on metrics
  if ((technician.completed_tasks_count || 0) >= 1) earnedBadges.add('first_task');
  if ((technician.on_time_completion_rate || 0) >= 90) earnedBadges.add('reliable');
  if ((technician.performance_rating || 0) >= 90) earnedBadges.add('top_performer');
  if ((technician.first_time_fix_rate || 0) >= 95) earnedBadges.add('problem_solver');
  if ((technician.completed_tasks_count || 0) >= 50) earnedBadges.add('veteran');
  if (kudosCount >= 5) earnedBadges.add('team_player');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-violet-50 rounded-lg">
          <Award className="w-4 h-4 text-violet-600" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Achievements</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
          {earnedBadges.size}/{ALL_BADGES.length} earned
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ALL_BADGES.map((badge, i) => {
          const earned = earnedBadges.has(badge.id);
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex flex-col items-center p-4 rounded-xl border transition-all ${
                earned 
                  ? 'border-slate-200 bg-white hover:shadow-md cursor-default' 
                  : 'border-slate-100 bg-slate-50/50 opacity-40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                earned ? `bg-gradient-to-br ${badge.color} shadow-lg` : 'bg-slate-200'
              }`}>
                <Icon className={`w-6 h-6 ${earned ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <p className="text-xs font-semibold text-slate-900 text-center">{badge.name}</p>
              <p className="text-[10px] text-slate-500 text-center mt-0.5 leading-tight">{badge.desc}</p>
              {earned && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}