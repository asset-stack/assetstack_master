import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    id: 'team', name: 'Team',
    monthly: 9, annual: 7,
    tagline: 'For single sites or small fleets',
    cta: 'Start free trial',
    features: ['Up to 250 assets', 'AI condition scanning', 'Failure prediction', 'Email + Slack alerts', 'Standard audit log', '1 admin seat included'],
    highlight: false,
  },
  {
    id: 'business', name: 'Business',
    monthly: 19, annual: 15,
    tagline: 'For multi-site operations',
    cta: 'Start free trial',
    features: ['Up to 5,000 assets', 'Everything in Team', 'Verified Savings Ledger', 'Custom roles + SSO', 'API + webhooks', 'Priority support'],
    highlight: true, badge: 'Most popular',
  },
  {
    id: 'enterprise', name: 'Enterprise',
    monthly: null, annual: null,
    tagline: 'For regulated and global operators',
    cta: 'Talk to sales',
    features: ['Unlimited assets', 'Everything in Business', 'Dedicated ML training', 'On-prem / private cloud', 'SOC 2 + ISO 27001 evidence', 'Named CSM + SLA'],
    highlight: false,
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Pricing</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            Priced like SaaS.{' '}
            <span className="font-serif italic font-medium text-primary">Pays for itself in days.</span>
          </h2>
          <p className="mt-4 text-[17px] text-slate-600 leading-[1.55] text-pretty">
            Per asset, per month. Most customers verify ROI in their first ledger entry.
          </p>

          {/* Toggle */}
          <div className="mt-7 inline-flex items-center gap-1 p-1 rounded-full border border-slate-200 bg-slate-50">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${!annual ? 'bg-white text-slate-900 elevation-1' : 'text-slate-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 ${annual ? 'bg-white text-slate-900 elevation-1' : 'text-slate-500'}`}
            >
              Annual
              <span className="text-[10px] text-emerald-600 font-bold">−20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl p-7 transition-all ${
                tier.highlight
                  ? 'bg-slate-900 text-white border border-slate-900 elevation-3 md:scale-[1.03]'
                  : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 elevation-1 hover:elevation-2'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-semibold uppercase tracking-wider elevation-2">
                  {tier.badge}
                </div>
              )}

              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1.5"
                style={{ color: tier.highlight ? 'hsl(214 100% 80%)' : 'hsl(var(--primary))' }}
              >
                {tier.name}
              </div>
              <div className={`text-[13px] mb-5 ${tier.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                {tier.tagline}
              </div>

              <div className="mb-6 min-h-[60px]">
                {tier.monthly ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-semibold tracking-tight tabular-nums">${annual ? tier.annual : tier.monthly}</span>
                      <span className={`text-[13px] ${tier.highlight ? 'text-slate-400' : 'text-slate-500'}`}>/asset/mo</span>
                    </div>
                    <div className={`text-[11px] mt-1 ${tier.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {annual ? 'Billed annually' : 'Billed monthly'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-semibold tracking-tight">Custom</div>
                    <div className={`text-[11px] mt-1 ${tier.highlight ? 'text-slate-400' : 'text-slate-500'}`}>Volume + on-prem pricing</div>
                  </>
                )}
              </div>

              <Link to="/CommandCenter">
                <Button
                  className={`w-full h-10 text-[13px] font-semibold rounded-lg ${
                    tier.highlight
                      ? 'bg-primary hover:bg-primary/90 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {tier.cta} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>

              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlight ? 'text-primary' : 'text-primary'}`} />
                    <span className={tier.highlight ? 'text-slate-200' : 'text-slate-700'}>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-8 text-[12px] text-slate-500">
          All plans include unlimited users · 14-day free trial · No credit card required
        </p>
      </div>
    </section>
  );
}