import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  "What's the cheapest 10 fixes that get me from 65 → 75 portfolio health?",
  "Which Bunbury room has the most deferred maintenance value?",
  "Compare Museum vs Sports Centre on $/sqm of replacement value",
  "What's our 5-year renewal pipeline by location?",
  "Which component types are systemically failing early?",
];

export default function PortfolioInsights() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    const query = q || question;
    if (!query) return;
    setQuestion(query);
    setLoading(true);
    setAnswer('');
    try {
      const res = await base44.functions.invoke('assetMindAggregate', { question: query });
      setAnswer(res.data?.answer || 'No answer.');
    } catch (err) {
      setAnswer(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-7 h-7 text-indigo-600" /> Portfolio Insights
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          AssetMind agent answers portfolio-wide questions using live aggregations.
        </p>
      </div>

      <Card className="p-5 mb-5">
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything about your portfolio…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            className="flex-1 h-12 text-base"
          />
          <Button onClick={() => ask()} disabled={loading || !question} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full">
              {s}
            </button>
          ))}
        </div>
      </Card>

      {(loading || answer) && (
        <Card className="p-5">
          {loading && <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Computing aggregations…</div>}
          {answer && (
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}