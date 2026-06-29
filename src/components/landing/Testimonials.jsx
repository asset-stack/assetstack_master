import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const QUOTES = [
  {
    quote: "We caught a $156k bridge expansion joint failure 47 days early. The audit trail meant council signed off the spend in one meeting.",
    name: 'Sarah Chen', role: 'Asset Manager', org: 'LGA Council',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    quote: "AssetStack replaced three spreadsheets, two consultants, and a maintenance backlog we'd been chasing for two years. ROI in month one.",
    name: 'Tom Davies', role: 'Operations Director', org: 'Western Rail',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    quote: "The verified savings ledger is the single best feature for getting CFO buy-in. Every dollar has evidence behind it.",
    name: 'Maria Lopez', role: 'CFO', org: 'Coastal Water Authority',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.2), transparent 50%)',
      }} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Customers</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">
            Asset teams that ship outcomes,
            <br />
            <span className="text-indigo-400">not just data.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {QUOTES.map((q, i) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors"
            >
              <Quote className="w-7 h-7 text-indigo-400 mb-3 opacity-60" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-white/90 leading-relaxed text-[15px] mb-5">"{q.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <img src={q.avatar} alt={q.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sm">{q.name}</div>
                  <div className="text-xs text-white/60">{q.role} · {q.org}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}