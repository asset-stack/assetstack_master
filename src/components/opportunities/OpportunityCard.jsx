import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, Cpu, Leaf, FileText, Handshake, BarChart3, CalendarClock, ArrowRight } from 'lucide-react';

const SOURCE_META = {
  government_grant: { icon: Building2, label: 'Gov Grant', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  asx_announcement: { icon: BarChart3, label: 'ASX / Market', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  tender_db: { icon: FileText, label: 'Tender', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  partnership_network: { icon: Handshake, label: 'Partnership', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  industry_report: { icon: BarChart3, label: 'Industry', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  sustainability_initiative: { icon: Leaf, label: 'Sustainability', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  technology_innovation: { icon: Cpu, label: 'Technology', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

const REC_META = {
  pursue_aggressively: { label: 'Pursue', color: 'bg-emerald-600 text-white' },
  pursue_carefully: { label: 'Pursue carefully', color: 'bg-emerald-100 text-emerald-700' },
  monitor: { label: 'Monitor', color: 'bg-amber-100 text-amber-700' },
  skip: { label: 'Skip', color: 'bg-slate-100 text-slate-500' },
  unassessed: { label: 'New', color: 'bg-slate-100 text-slate-500' },
};

function money(n) {
  if (!n) return null;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n}`;
}

export default function OpportunityCard({ opp, onAsk }) {
  const meta = SOURCE_META[opp.source] || SOURCE_META.industry_report;
  const Icon = meta.icon;
  const rec = REC_META[opp.recommendation] || REC_META.unassessed;
  const score = Math.round(opp.relevance_score || 0);
  const value = money(opp.estimated_value);
  const days = opp.days_until_close;
  const urgent = typeof days === 'number' && days >= 0 && days <= 30;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4 hover:shadow-md transition-shadow border-slate-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${meta.color} gap-1 font-medium`}>
              <Icon className="w-3 h-3" /> {meta.label}
            </Badge>
            <Badge className={rec.color}>{rec.label}</Badge>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`text-sm font-bold tabular-nums ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-slate-500'}`}>
              {score}
            </div>
            <span className="text-[11px] text-slate-400">fit</span>
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1">{opp.title}</h3>
        {opp.source_name && <p className="text-[11px] text-slate-400 mb-2">{opp.source_name}</p>}
        <p className="text-[13px] text-slate-600 line-clamp-2 mb-3">{opp.summary}</p>

        {opp.relevance_reason && (
          <div className="text-[12px] text-indigo-700 bg-indigo-50/60 rounded-lg px-2.5 py-1.5 mb-3 line-clamp-2">
            <span className="font-semibold">Why: </span>{opp.relevance_reason}
          </div>
        )}

        <div className="flex items-center gap-3 text-[12px] text-slate-500 mb-3 flex-wrap">
          {value && (
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {value}
            </span>
          )}
          {typeof days === 'number' && days >= 0 && (
            <span className={`flex items-center gap-1 ${urgent ? 'text-rose-600 font-semibold' : ''}`}>
              <CalendarClock className="w-3.5 h-3.5" /> {days}d to close
            </span>
          )}
          {opp.effort_required && <span className="capitalize">{opp.effort_required} effort</span>}
          {opp.geographic_scope && <span>{opp.geographic_scope}</span>}
        </div>

        <div className="flex items-center justify-between gap-2">
          {(() => {
            // Verified direct link when the scanner confirmed the URL is live,
            // otherwise a safe Google search for the exact opportunity — never a dead link.
            const verified = !!opp.url;
            const query = [opp.source_name, opp.title].filter(Boolean).join(' ');
            const href = verified ? opp.url : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[12px] text-slate-500 hover:text-indigo-600 truncate">
                {verified ? 'View source' : 'Find source'}
              </a>
            );
          })()}
          <Button size="sm" onClick={() => onAsk(opp)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">
            Ask AssetMind <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}