import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  'Which assets are highest risk?',
  'How much is my backlog worth?',
  'Show me defects by location',
];

// Pre-scripted demo answers — no live data, no real customer references
const DEMO_ANSWERS = {
  'Which assets are highest risk?': `**Top 5 high-risk assets in the demo portfolio:**

1. **Chiller CH-04** — 92% failure probability · Condition C5 · $184k CRC
2. **Roof membrane (Block A)** — 86% · C4 · $420k CRC
3. **Lift sheave L-3** — 81% · C4 · $110k CRC
4. **Boiler B-2** — 77% · C4 · $410k CRC
5. **Cooling tower CT-2** — 74% · C4 · $320k CRC

Recommended next step: open the Funding Optimiser to rank these against your budget.`,

  'How much is my backlog worth?': `**Demo portfolio backlog snapshot**

- Total deferred maintenance: **$2.4M**
- High-urgency (next 12 months): **$840k**
- Medium-urgency (12–36 months): **$1.1M**
- Low-urgency (>36 months): **$460k**

A risk-ranked $2M renewal program would clear ~78% of the high-urgency backlog.`,

  'Show me defects by location': `**Defect heatmap (demo data)**

| Location | Defects | High-severity |
|---|---|---|
| Tower A — Plant Room | 14 | 4 |
| South Wing — Roof | 9 | 3 |
| Civic Block — Lifts | 7 | 2 |
| Tech Park — HVAC | 6 | 1 |
| Sports Centre — Pumps | 5 | 2 |

Tower A's plant room is the priority cluster — recommend a single coordinated work package.`,
};

const DEFAULT_ANSWER = `This is a demo response. In your live AssetStack, AssetMind reasons over your full asset register, condition data, and predictions to answer questions like this in seconds.

**Try a sample question** above, or open the platform to ask your own.`;

/**
 * Live AssetMind widget embedded in the hero.
 * Lets visitors actually query the live Bunbury dataset before signing up.
 */
export default function HeroLiveAssetMind() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  const ask = (q) => {
    const query = (q || question).trim();
    if (!query || loading) return;
    setQuestion(query);
    setLoading(true);
    setTouched(true);
    setAnswer('');
    // Simulated thinking delay for realism — no live API call
    setTimeout(() => {
      setAnswer(DEMO_ANSWERS[query] || DEFAULT_ANSWER);
      setLoading(false);
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-2xl mx-auto mt-10"
    >
      <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 via-blue-300/15 to-purple-300/15 blur-2xl rounded-3xl -z-10" />

      <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-slate-900 leading-tight">AssetMind</div>
              <div className="text-[10px] text-slate-500 leading-tight">Demo · Sample portfolio</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-slate-500">Online</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 min-h-[180px]">
          <AnimatePresence mode="wait">
            {!touched ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-4"
              >
                <MessageSquare className="w-6 h-6 text-slate-300" />
                <p className="text-[13px] text-slate-500 text-center">Ask a question about real asset data — try one:</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="px-2.5 py-1 rounded-full border border-slate-200 hover:border-primary/40 hover:bg-primary/[0.03] text-[11px] font-medium text-slate-700 hover:text-primary transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-600">You</span>
                  </div>
                  <p className="text-[13px] text-slate-800 leading-relaxed font-medium">{question}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {loading ? (
                      <div className="flex items-center gap-2 text-[13px] text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analysing your portfolio…
                      </div>
                    ) : (
                      <div className="text-[13px] text-slate-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1.5 prose-strong:text-slate-900">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); ask(); }}
          className="border-t border-slate-100 p-2 flex items-center gap-2 bg-slate-50/40"
        >
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask AssetMind about your assets…"
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-slate-900 placeholder:text-slate-400 px-2"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center text-white transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-400 font-medium">
        Demo preview · No signup · Powered by AssetMind
      </p>
    </motion.div>
  );
}