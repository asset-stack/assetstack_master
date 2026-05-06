import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Starter', price: '$1,490', cadence: '/month',
    desc: 'For single sites and small councils.',
    features: ['Up to 500 assets', 'AI scan & predictions', '5 users', 'Email support', 'CSV exports'],
    cta: 'Start free trial', highlight: false,
  },
  {
    name: 'Professional', price: '$4,290', cadence: '/month',
    desc: 'For multi-site infrastructure operators.',
    features: ['Up to 10,000 assets', 'Everything in Starter', 'Unlimited users', 'Verified Savings Ledger', 'Audit log + SOC 2 pack', 'Priority support', 'Custom integrations'],
    cta: 'Start free trial', highlight: true,
  },
  {
    name: 'Enterprise', price: 'Custom', cadence: '',
    desc: 'For councils, rail, and government.',
    features: ['Unlimited assets', 'Dedicated success manager', 'On-prem option', 'SLA + 24/7 support', 'Custom AI training', 'Procurement-ready paperwork'],
    cta: 'Talk to sales', highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Pricing</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Simple plans. Provable ROI.
          </h2>
          <p className="mt-4 text-lg text-slate-600">No per-asset gotchas. No surprise overages. Cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl p-7 border-2 ${
                p.highlight
                  ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-2xl shadow-slate-900/20 scale-[1.02]'
                  : 'bg-white border-slate-200'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <h3 className={`text-lg font-bold ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
              <p className={`text-sm mt-1 ${p.highlight ? 'text-white/70' : 'text-slate-500'}`}>{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className={`text-4xl font-black ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
                <span className={`text-sm ${p.highlight ? 'text-white/60' : 'text-slate-500'}`}>{p.cadence}</span>
              </div>

              <Link to="/CommandCenter" className="block mt-5">
                <Button
                  size="lg"
                  className={`w-full ${
                    p.highlight
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {p.cta}
                </Button>
              </Link>

              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${p.highlight ? 'text-white/90' : 'text-slate-700'}`}>
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}