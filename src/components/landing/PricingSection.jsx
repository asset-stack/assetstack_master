import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Pricing is custom per engagement (asset count, deployment, integrations).
// We show what each tier includes and route to a conversation, not a self-serve checkout.
const TIERS = [
  {
    id: 'team', name: 'Team',
    tagline: 'Single site or small fleet',
    cta: 'Talk to us',
    features: ['Asset register & locations', 'AI condition scanning', 'Failure prediction', 'Maintenance & work orders', 'Email alerts', 'Standard audit log'],
    highlight: false,
  },
  {
    id: 'business', name: 'Business',
    tagline: 'Multi-site operations',
    cta: 'Talk to us',
    features: ['Everything in Team', 'Network globe & digital twin', 'Verified Savings Ledger', 'Custom roles & permissions', 'API access', 'Priority support'],
    highlight: true, badge: 'Most teams start here',
  },
  {
    id: 'enterprise', name: 'Enterprise',
    tagline: 'Regulated & national operators',
    cta: 'Talk to sales',
    features: ['Everything in Business', 'Dedicated ML training', 'Private-cloud / self-hosted option', 'Compliance evidence pack', 'Named customer success', 'Onboarding & data migration'],
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Pricing</span>
          <h2 className="mt-3 text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02] text-slate-900 text-balance">
            Built around{' '}
            <span className="font-serif italic font-medium text-primary">your portfolio.</span>
          </h2>
          <p className="mt-4 text-[17px] text-slate-600 leading-[1.55] text-pretty">
            Pricing is shaped to your asset count, deployment and integrations. Pick the tier that fits, and we'll quote precisely.
          </p>
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
                <div className="text-3xl font-semibold tracking-tight">Custom</div>
                <div className={`text-[11px] mt-1 ${tier.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Quoted on asset count & deployment
                </div>
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
          All tiers include unlimited users · Pilot engagements available · Onboarding & migration support
        </p>
      </div>
    </section>
  );
}