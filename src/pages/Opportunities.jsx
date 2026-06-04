import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Radar, Sparkles, RefreshCw, Target } from 'lucide-react';
import OpportunityCard from '@/components/opportunities/OpportunityCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'funding', label: 'Funding' },
  { key: 'technology', label: 'Technology' },
  { key: 'sustainability', label: 'Sustainability' },
  { key: 'partnership', label: 'Partnership' },
];

export default function Opportunities() {
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['external-opportunities'],
    queryFn: () => base44.entities.ExternalOpportunity.list('-relevance_score', 100),
    initialData: [],
  });

  const filtered = useMemo(() => {
    if (filter === 'all') return opportunities;
    return opportunities.filter((o) => o.category === filter);
  }, [opportunities, filter]);

  const handleScan = async () => {
    setScanning(true);
    try {
      await base44.functions.invoke('scanForOpportunities', { min_relevance: 55 });
      await queryClient.invalidateQueries({ queryKey: ['external-opportunities'] });
    } finally {
      setScanning(false);
    }
  };

  const handleAsk = (opp) => {
    const q = `Tell me whether we should pursue this opportunity: "${opp.title}" (${opp.source_name || opp.source}). ${opp.summary} Our estimated value is ${opp.estimated_value || 'unknown'}. Assess fit, financial impact, resources, risks and give me a clear recommendation and next steps.`;
    navigate(`/AIAssistant?q=${encodeURIComponent(q)}`);
  };

  const highValue = opportunities.filter((o) => (o.relevance_score || 0) >= 80).length;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Radar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Opportunity Radar</h1>
            <p className="text-sm text-slate-500">
              AssetMind scans government grants, ASX & market signals, tenders and emerging tech — matched to your portfolio.
            </p>
          </div>
        </div>
        <Button onClick={handleScan} disabled={scanning} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {scanning ? 'Scanning the web…' : 'Scan now'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{opportunities.length}</div>
          <div className="text-xs text-slate-500">Opportunities tracked</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-600 tabular-nums flex items-center gap-1.5">
            <Target className="w-5 h-5" /> {highValue}
          </div>
          <div className="text-xs text-slate-500">High-fit (80+)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-indigo-600 tabular-nums">
            {opportunities.filter((o) => o.recommendation === 'pursue_aggressively').length}
          </div>
          <div className="text-xs text-slate-500">Recommended to pursue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Sparkles className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No opportunities yet</h3>
          <p className="text-sm text-slate-500 mb-4">Run a scan and AssetMind will surface live opportunities matched to your assets.</p>
          <Button onClick={handleScan} disabled={scanning} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Radar className="w-4 h-4 mr-2" />}
            Scan now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} onAsk={handleAsk} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-slate-400 mt-8">
        Need deeper strategy? <Link to="/AIAssistant" className="text-indigo-600 hover:underline">Open AssetMind</Link>
      </p>
    </div>
  );
}